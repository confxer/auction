package com.auction.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.dto.UserDto;
// import com.auction.service.EmailService;
import com.auction.service.LoginHistoryService;
import com.auction.service.UserService;
import com.auction.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;
    // @Autowired
    // private EmailService emailService;
    @Autowired
    private LoginHistoryService loginHistoryService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        logger.info("테스트 엔드포인트 호출됨");
        return ResponseEntity.ok(Map.of("message", "AuthController 정상 작동"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req, HttpServletRequest request) {
        String username = req.get("username");
        String password = req.get("password");

        logger.info("입력된 username: [{}]", username);
        logger.info("입력된 password: [{}]", password);

        java.util.Optional<com.auction.entity.User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            logger.warn("사용자를 찾을 수 없음: username={}", username);
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }
        com.auction.entity.User user = userOpt.get();
        logger.info("DB 비밀번호 해시: [{}]", user.getPassword());

        if (!passwordEncoder.matches(password, user.getPassword())) {
            logger.warn("비밀번호 불일치: username={}", username);
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }

        // // 이메일 인증 확인
        // if (!user.getEmailVerified()) {
        //     logger.warn("이메일 미인증 사용자: username={}", username);
        //     return ResponseEntity.status(403).body(Map.of(
        //         "message", "이메일 인증이 필요합니다. 회원가입 시 발송된 이메일을 확인해주세요.",
        //         "emailVerificationRequired", true,
        //         "email", user.getEmail()
        //     ));
        // }

        logger.info("로그인 성공: username={}", username);

        // JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(username, List.of(user.getRole()));
        String refreshToken = jwtUtil.generateRefreshToken(username);
        
        // Refresh Token 저장
        userService.updateRefreshToken(user.getId(), refreshToken);
        
        // 로그인 이력 업데이트
        String clientIp = getClientIp(request);
        userService.updateLastLogin(user.getId(), clientIp);
        
        return ResponseEntity.ok(Map.of(
            "accessToken", accessToken,
            "refreshToken", refreshToken,
            "user", user,
            "message", "로그인 성공"
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.getUsername(token);
        userService.clearRefreshToken(username);
        return ResponseEntity.ok(Map.of("message", "로그아웃되었습니다."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDto userDto) {
        logger.info("회원가입 시도: username={}, email={}", userDto.getUsername(), userDto.getEmail());
        
        try {
            // 중복 검사
            if (userService.findByUsernameDto(userDto.getUsername()) != null) {
                logger.warn("중복된 아이디: username={}", userDto.getUsername());
                return ResponseEntity.badRequest().body(Map.of("message", "이미 존재하는 아이디입니다."));
            }
            
            if (userService.findByEmailDto(userDto.getEmail()) != null) {
                logger.warn("중복된 이메일: email={}", userDto.getEmail());
                return ResponseEntity.badRequest().body(Map.of("message", "이미 존재하는 이메일입니다."));
            }

            // 기본값 설정
            userDto.setSocialType("NONE");
            userDto.setRole("USER");
            userDto.setIsActive(true);
            userDto.setEmailVerified(false); // 이메일 인증 전까지는 false
            
            // 이메일 인증 토큰 생성
            String verificationToken = UUID.randomUUID().toString();
            userDto.setEmailVerificationToken(verificationToken);
            userDto.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));
            
            logger.info("사용자 등록 시작: username={}", userDto.getUsername());
            UserDto savedUser = userService.register(userDto);
            logger.info("사용자 등록 완료: userId={}", savedUser.getId());
            
            // // 이메일 인증 메일 발송
            // try {
            //     logger.info("이메일 인증 메일 발송 시작: email={}", userDto.getEmail());
            //     emailService.sendVerificationEmail(userDto.getEmail(), verificationToken);
            //     logger.info("이메일 인증 메일 발송 완료: email={}", userDto.getEmail());
            // } catch (Exception e) {
            //     logger.error("이메일 발송 실패: email={}, error={}", userDto.getEmail(), e.getMessage());
            //     // 이메일 발송 실패해도 회원가입은 성공으로 처리
            // }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.",
                "userId", savedUser.getId()
            ));
        } catch (Exception e) {
            logger.error("회원가입 실패: username={}, error={}", userDto.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "회원가입 중 오류가 발생했습니다."));
        }
    }

    // 이메일 인증 확인
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        logger.info("이메일 인증 요청 받음: request={}", request);
        logger.info("요청 데이터 타입: {}", request.getClass().getName());
        logger.info("요청 데이터 크기: {}", request.size());
        
        String token = request.get("token");
        logger.info("추출된 토큰: '{}'", token);
        
        if (token == null || token.trim().isEmpty()) {
            logger.warn("인증 토큰이 없음 또는 빈 문자열");
            return ResponseEntity.badRequest().body(Map.of("message", "인증 토큰이 필요합니다."));
        }

        logger.info("인증 토큰: {}", token);

        try {
            UserDto user = userService.findByEmailVerificationToken(token);
            if (user == null) {
                logger.warn("유효하지 않은 인증 토큰: {}", token);
                return ResponseEntity.badRequest().body(Map.of("message", "유효하지 않은 인증 토큰입니다."));
            }

            logger.info("사용자 찾음: userId={}, email={}", user.getId(), user.getEmail());

            if (user.getEmailVerificationExpiry() != null && 
                user.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
                logger.warn("인증 토큰 만료: userId={}, expiry={}", user.getId(), user.getEmailVerificationExpiry());
                return ResponseEntity.badRequest().body(Map.of("message", "인증 토큰이 만료되었습니다."));
            }

            // 이메일 인증 완료 처리
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationExpiry(null);
            userService.updateUser(user);

            logger.info("이메일 인증 완료: userId={}, email={}", user.getId(), user.getEmail());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "이메일 인증이 완료되었습니다."
            ));
        } catch (Exception e) {
            logger.error("이메일 인증 실패: token={}, error={}", token, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "이메일 인증 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> req) {
        String refreshToken = req.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Refresh token이 필요합니다."));
        }

        if (!jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("message", "유효하지 않은 refresh token입니다."));
        }

        String username = jwtUtil.getUsername(refreshToken);
        UserDto user = userService.findByUsernameDto(username);
        if (user == null || !refreshToken.equals(user.getRefreshToken())) {
            return ResponseEntity.status(401).body(Map.of("message", "유효하지 않은 refresh token입니다."));
        }

        String newAccessToken = jwtUtil.generateAccessToken(username, List.of(user.getRole()));
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.getUsername(token);
        UserDto user = userService.findByUsernameDto(username);
        return ResponseEntity.ok(user);
    }

    // 인증 코드 재발송
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이메일이 필요합니다."));
        }

        try {
            UserDto user = userService.findByEmailDto(email);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "해당 이메일로 가입된 계정이 없습니다."));
            }

            if (user.getEmailVerified()) {
                return ResponseEntity.badRequest().body(Map.of("message", "이미 인증이 완료된 계정입니다."));
            }

            // 새로운 인증 토큰 생성
            String newToken = UUID.randomUUID().toString();
            user.setEmailVerificationToken(newToken);
            user.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));
            userService.updateUser(user);

            // // 새로운 인증 메일 발송
            // emailService.sendVerificationEmail(email, newToken);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "인증 메일이 재발송되었습니다."
            ));
        } catch (Exception e) {
            logger.error("인증 메일 재발송 실패", e);
            return ResponseEntity.status(500).body(Map.of("message", "인증 메일 재발송 중 오류가 발생했습니다."));
        }
    }

    // 테스트용 비밀번호 확인 API (개발용)
    @PostMapping("/test-password")
    public ResponseEntity<?> testPassword(@RequestBody Map<String, String> request) {
        String testPassword = request.get("password");
        String hashedPassword = "$2a$10$ev6rkh3en.7HYFdHk2PZOuMVQ44.w9ZoD1IMTdSpXfA9hDnvuOtI2";
        
        boolean matches = passwordEncoder.matches(testPassword, hashedPassword);
        
        return ResponseEntity.ok(Map.of(
            "testPassword", testPassword,
            "hashedPassword", hashedPassword,
            "matches", matches
        ));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
} 
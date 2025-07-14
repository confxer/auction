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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.dto.UserDto;
import com.auction.service.EmailService;
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
    @Autowired
    private EmailService emailService;
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
        
        logger.info("로그인 시도: username={}", username);
        
        UserDto user = userService.findByUsernameDto(username);
        if (user == null) {
            logger.warn("사용자를 찾을 수 없음: username={}", username);
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }

        logger.info("사용자 찾음: username={}, role={}", username, user.getRole());

        // 평문 비밀번호 비교
        if (!password.equals(user.getPassword())) {
            logger.warn("비밀번호 불일치: username={}", username);
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }

        logger.info("로그인 성공: username={}", username);

        // JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(username, List.of(user.getRole()));
        String refreshToken = jwtUtil.generateRefreshToken(username);
        
        // Refresh Token 저장
        userService.updateRefreshToken(user.getId(), refreshToken);
        System.out.println("1");
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
        if (userService.findByUsernameDto(userDto.getUsername()) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "이미 존재하는 아이디입니다."));
        }
        if (userService.findByEmailDto(userDto.getEmail()) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "이미 존재하는 이메일입니다."));
        }

        // 평문 비밀번호로 저장
        userDto.setPassword(userDto.getPassword());
        userDto.setEmailVerified(true); // 이메일 인증 없이 바로 활성화
        userDto.setRole("USER");
        
        UserDto savedUser = userService.save(userDto);

        return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        UserDto user = userService.findByEmailVerificationToken(token);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "유효하지 않은 인증 토큰입니다."));
        }
        if (user.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "인증 토큰이 만료되었습니다."));
        }

        userService.verifyEmail(user.getId());
        return ResponseEntity.ok(Map.of("message", "이메일 인증이 완료되었습니다."));
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

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        UserDto user = userService.findByEmailDto(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "존재하지 않는 이메일입니다."));
        }
        if (user.getEmailVerified()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이미 인증된 이메일입니다."));
        }

        String verificationToken = UUID.randomUUID().toString();
        userService.updateEmailVerificationToken(user.getId(), verificationToken);
        
        emailService.sendVerificationEmail(email, verificationToken);
        return ResponseEntity.ok(Map.of("message", "인증 메일을 다시 발송했습니다."));
    }
} 
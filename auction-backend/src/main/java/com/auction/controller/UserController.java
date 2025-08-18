package com.auction.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.dto.AuctionDto;
import com.auction.dto.CommentDto;
import com.auction.dto.UserDto;
import com.auction.service.AuctionService;
import com.auction.service.CommentService;
// import com.auction.service.EmailService;
import com.auction.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;
    
    @Autowired
    private AuctionService auctionService;
    
    @Autowired
    private CommentService commentService;
    
    // @Autowired
    // private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // 닉네임 중복 확인
    @GetMapping("/check-nickname")
    public ResponseEntity<Map<String, Object>> checkNickname(@RequestParam String nickname) {
        try {
            UserDto existingUser = userService.findByNickname(nickname);
            boolean isAvailable = existingUser == null;
            
            return ResponseEntity.ok(Map.of(
                "available", isAvailable,
                "message", isAvailable ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다."
            ));
        } catch (Exception e) {
            logger.error("닉네임 중복 확인 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "available", false,
                "message", "닉네임 확인 중 오류가 발생했습니다."
            ));
        }
    }

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<UserDto> getMyInfo() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            UserDto user = userService.findByUsernameDto(username);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 비밀번호는 제외하고 반환
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("내 정보 조회 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    // 회원정보 수정
    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody UserDto userDto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            UserDto currentUser = userService.findByUsernameDto(username);
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            // 수정 가능한 필드만 업데이트
            currentUser.setNickname(userDto.getNickname());
            currentUser.setAddress(userDto.getAddress());
            currentUser.setPhone(userDto.getPhone());
            
            UserDto updatedUser = userService.updateUser(currentUser);
            updatedUser.setPassword(null); // 비밀번호 제외
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "회원정보가 수정되었습니다.",
                "user", updatedUser
            ));
        } catch (Exception e) {
            logger.error("회원정보 수정 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "회원정보 수정에 실패했습니다."
            ));
        }
    }

    // 닉네임 변경
    @PutMapping("/me/nickname")
    public ResponseEntity<Map<String, Object>> updateNickname(@RequestBody Map<String, String> request) {
        try {
            String newNickname = request.get("nickname");
            if (newNickname == null || newNickname.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "닉네임을 입력해주세요."
                ));
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            UserDto currentUser = userService.findByUsernameDto(username);
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            // 닉네임 중복 확인
            UserDto existingUser = userService.findByNickname(newNickname);
            if (existingUser != null && !existingUser.getId().equals(currentUser.getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "이미 사용 중인 닉네임입니다."
                ));
            }

            currentUser.setNickname(newNickname);
            UserDto updatedUser = userService.updateUser(currentUser);
            updatedUser.setPassword(null);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "닉네임이 변경되었습니다.",
                "user", updatedUser
            ));
        } catch (Exception e) {
            logger.error("닉네임 변경 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "닉네임 변경에 실패했습니다."
            ));
        }
    }

    // 비밀번호 변경
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "현재 비밀번호와 새 비밀번호를 입력해주세요."
                ));
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            UserDto currentUser = userService.findByUsernameDto(username);
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            // 현재 비밀번호 확인
            if (!passwordEncoder.matches(currentPassword, currentUser.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "현재 비밀번호가 일치하지 않습니다."
                ));
            }

            // 새 비밀번호로 업데이트
            currentUser.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUser(currentUser);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "비밀번호가 변경되었습니다."
            ));
        } catch (Exception e) {
            logger.error("비밀번호 변경 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "비밀번호 변경에 실패했습니다."
            ));
        }
    }

    // 이메일 인증 요청
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> requestEmailVerification() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            UserDto currentUser = userService.findByUsernameDto(username);
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            // // 인증 코드 생성 및 이메일 발송
            // String verificationCode = emailService.sendVerificationEmail(currentUser.getEmail());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "인증 코드가 이메일로 발송되었습니다."
            ));
        } catch (Exception e) {
            logger.error("이메일 인증 요청 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "이메일 인증 요청에 실패했습니다."
            ));
        }
    }

    // 내가 쓴 경매글 조회
    @GetMapping("/me/auctions")
    public ResponseEntity<List<AuctionDto>> getMyAuctions() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            UserDto currentUser = userService.findByUsernameDto(username);
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            List<AuctionDto> myAuctions = auctionService.getAuctionsByUserId(currentUser.getId());
            return ResponseEntity.ok(myAuctions);
        } catch (Exception e) {
            logger.error("내 경매글 조회 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    // 내가 쓴 댓글 조회
    @GetMapping("/me/comments")
    public ResponseEntity<List<CommentDto>> getMyComments() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            UserDto currentUser = userService.findByUsernameDto(username);
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            List<CommentDto> myComments = commentService.getCommentsByUserId(currentUser.getId());
            return ResponseEntity.ok(myComments);
        } catch (Exception e) {
            logger.error("내 댓글 조회 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    // 회원 탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, Object>> deleteAccount(@RequestBody Map<String, String> request) {
        try {
            String password = request.get("password");
            if (password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "비밀번호를 입력해주세요."
                ));
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            UserDto currentUser = userService.findByUsernameDto(username);
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }

            // 비밀번호 확인
            if (!passwordEncoder.matches(password, currentUser.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "비밀번호가 일치하지 않습니다."
                ));
            }

            // 회원 탈퇴 처리 (비활성화)
            currentUser.setIsActive(false);
            userService.updateUser(currentUser);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "회원 탈퇴가 완료되었습니다."
            ));
        } catch (Exception e) {
            logger.error("회원 탈퇴 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "회원 탈퇴에 실패했습니다."
            ));
        }
    }
} 
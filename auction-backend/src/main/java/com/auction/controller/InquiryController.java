package com.auction.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.dto.InquiryDto;
import com.auction.entity.User;
import com.auction.repository.UserRepository;
import com.auction.service.InquiryService;

@RestController
@RequestMapping("/api/inquiry")
public class InquiryController {

    private final InquiryService inquiryService;
    private final UserRepository userRepository;

    public InquiryController(InquiryService inquiryService, UserRepository userRepository) {
        this.inquiryService = inquiryService;
        this.userRepository = userRepository;
    }

    // ✅ 1. 전체 문의 리스트 (관리자 전용)
    @GetMapping("/admin")
    public ResponseEntity<List<InquiryDto>> getAllInquiries() {
        return ResponseEntity.ok(inquiryService.getAllInquiries());
    }

    // ✅ 2. 내 문의 리스트 (사용자 본인 조회)
    @GetMapping("/my")
    public ResponseEntity<List<InquiryDto>> getMyInquiries(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));
        return ResponseEntity.ok(inquiryService.getMyInquiries(user.getId()));
    }

    // ✅ 3. 문의 상세 보기
    @GetMapping("/{id:[\\d]+}") // 정규식 추가로 "admin"과 같은 문자열 요청 방지
    public ResponseEntity<InquiryDto> getInquiry(@PathVariable Long id) {
        return ResponseEntity.ok(inquiryService.getInquiry(id));
    }

    // ✅ 4. 문의 등록 (사용자 전용)
    @PostMapping
    public ResponseEntity<InquiryDto> createInquiry(@RequestBody InquiryDto dto, Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));
        dto.setUserId(String.valueOf(user.getId()));
        dto.setUserName(user.getNickname());
        InquiryDto created = inquiryService.createInquiry(dto);
        return ResponseEntity.ok(created);
    }

    // ✅ 5. 관리자 답변 등록
    @PostMapping("/{id:[\\d]+}/answer")
    public ResponseEntity<?> answerInquiry(
            @PathVariable Long id,
            @RequestParam String answer,
            Principal principal
    ) {
        String username = principal.getName();
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("관리자 정보 없음"));
        inquiryService.answerInquiry(id, answer, admin.getNickname());
        return ResponseEntity.ok().build();
    }

    // ✅ 6. 문의 상태 변경 (관리자 전용)
    @PatchMapping("/{id:[\\d]+}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        inquiryService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // ✅ 7. 문의 삭제
    @DeleteMapping("/{id:[\\d]+}")
    public ResponseEntity<?> deleteInquiry(@PathVariable Long id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.ok().build();
    }
}

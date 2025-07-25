package com.auction.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<List<InquiryDto>> getAllInquiries() {
        return ResponseEntity.ok(inquiryService.getAllInquiries());
    }

    // ✅ 2. 내 문의 리스트 (사용자 전용)
    @GetMapping("/my")
    public ResponseEntity<List<InquiryDto>> getMyInquiries(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("❌ 사용자 정보를 찾을 수 없습니다."));
        return ResponseEntity.ok(inquiryService.getMyInquiries(user.getId()));
    }

    // ✅ 3. 문의 상세 보기
    @GetMapping("/{id:[\\d]+}")
    public ResponseEntity<InquiryDto> getInquiry(@PathVariable Long id) {
        return ResponseEntity.ok(inquiryService.getInquiry(id));
    }

    // ✅ 4. 문의 등록 (사용자)
    @PostMapping
    public ResponseEntity<InquiryDto> createInquiry(@RequestBody InquiryDto dto, Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("❌ 사용자 정보를 찾을 수 없습니다."));

        dto.setUserId(String.valueOf(user.getId()));
        dto.setUserName(user.getNickname());

        InquiryDto created = inquiryService.createInquiry(dto);
        return ResponseEntity.ok(created);
    }

    // ✅ 5. 관리자 답변 등록 (JSON 전송)
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/{id:[\\d]+}/answer")
    public ResponseEntity<?> answerInquiry(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Principal principal
    ) {
        String answer = payload.get("answer");
        if (answer == null || answer.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("❌ 답변 내용이 비어있습니다.");
        }

        String username = principal.getName();
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("❌ 관리자 정보를 찾을 수 없습니다."));

        inquiryService.answerInquiry(id, answer, admin.getNickname());
        return ResponseEntity.ok().build();
    }

    // ✅ 6. 문의 상태 수동 변경 (필요 시)
    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{id:[\\d]+}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        inquiryService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // ✅ 7. 문의 삭제
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id:[\\d]+}")
    public ResponseEntity<?> deleteInquiry(@PathVariable Long id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.ok().build();
    }
}

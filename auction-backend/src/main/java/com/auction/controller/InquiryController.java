package com.auction.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.dto.InquiryDto;
import com.auction.service.InquiryService;

@RestController
@RequestMapping("/api/inquiry")
@CrossOrigin(origins = "*")
public class InquiryController {
    private final InquiryService inquiryService;

    public InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    // ===== 일반 사용자 API =====
    
    @PostMapping
    public ResponseEntity<String> createInquiry(@RequestBody InquiryDto dto) {
        try {
            inquiryService.createInquiry(dto);
            return ResponseEntity.ok("문의가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("문의 등록에 실패했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public List<InquiryDto> getUserInquiries(@PathVariable String userId) {
        return inquiryService.getUserInquiries(userId);
    }

    @GetMapping("/user/{userId}/{id}")
    public InquiryDto getUserInquiry(@PathVariable String userId, @PathVariable Long id) {
        return inquiryService.getInquiry(id);
    }

    // ===== 관리자 API =====
    
    @GetMapping("/admin")
    public List<InquiryDto> getAllInquiries() {
        return inquiryService.getAllInquiries();
    }

    @GetMapping("/admin/{id}")
    public InquiryDto getInquiry(@PathVariable Long id) {
        return inquiryService.getInquiry(id);
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteInquiry(@PathVariable Long id) {
        try {
            inquiryService.deleteInquiry(id);
            return ResponseEntity.ok("문의가 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("문의 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    // ===== 관리자 검색 및 필터링 API =====
    
    @GetMapping("/admin/search")
    public List<InquiryDto> searchInquiries(@RequestParam String term) {
        return inquiryService.searchInquiries(term);
    }

    @GetMapping("/admin/search/title")
    public List<InquiryDto> searchInquiriesByTitle(@RequestParam String title) {
        return inquiryService.searchInquiriesByTitle(title);
    }

    @GetMapping("/admin/search/content")
    public List<InquiryDto> searchInquiriesByContent(@RequestParam String content) {
        return inquiryService.searchInquiriesByContent(content);
    }

    @GetMapping("/admin/category/{category}")
    public List<InquiryDto> getInquiriesByCategory(@PathVariable String category) {
        return inquiryService.getInquiriesByCategory(category);
    }

    @GetMapping("/admin/status/{status}")
    public List<InquiryDto> getInquiriesByStatus(@PathVariable String status) {
        return inquiryService.getInquiriesByStatus(status);
    }

    @GetMapping("/admin/priority/{priority}")
    public List<InquiryDto> getInquiriesByPriority(@PathVariable String priority) {
        return inquiryService.getInquiriesByPriority(priority);
    }

    @GetMapping("/admin/pending")
    public List<InquiryDto> getPendingInquiries() {
        return inquiryService.getPendingInquiries();
    }

    @GetMapping("/admin/urgent")
    public List<InquiryDto> getUrgentInquiries() {
        return inquiryService.getUrgentInquiries();
    }

    // ===== 관리자 답변 및 상태 관리 API =====
    
    @PutMapping("/admin/answer/{id}")
    public ResponseEntity<String> answerInquiry(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String answer = body.get("answer");
            String answerer = body.get("answerer");
            String status = body.get("status");
            
            if (status != null) {
                inquiryService.answerInquiry(id, answer, status, answerer);
            } else {
                inquiryService.answerInquiry(id, answer, answerer);
            }
            return ResponseEntity.ok("답변이 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("답변 등록에 실패했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<String> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            inquiryService.updateStatus(id, status);
            return ResponseEntity.ok("상태가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("상태 변경에 실패했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/priority")
    public ResponseEntity<String> updatePriority(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String priority = body.get("priority");
            inquiryService.updatePriority(id, priority);
            return ResponseEntity.ok("우선순위가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("우선순위 변경에 실패했습니다: " + e.getMessage());
        }
    }

    // ===== 관리자 통계 API =====
    
    @GetMapping("/admin/stats")
    public Map<String, Object> getInquiryStats() {
        return inquiryService.getInquiryStats();
    }
} 
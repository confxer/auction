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

import com.auction.dto.FAQDto;
import com.auction.service.FAQService;

@RestController
@RequestMapping("/api/faq")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class FAQController {
    private final FAQService faqService;

    public FAQController(FAQService faqService) {
        this.faqService = faqService;
    }

    // ===== 일반 사용자 API =====
    
    // FAQ 샘플 데이터 생성
    @PostMapping("/sample-data")
    public ResponseEntity<String> createSampleFAQs() {
        try {
            FAQDto faq1 = new FAQDto();
            faq1.setQuestion("경매는 어떻게 참여하나요?");
            faq1.setAnswer("경매 페이지에서 원하는 상품을 선택하고 입찰 버튼을 클릭하여 참여할 수 있습니다.");
            faq1.setCategory("경매");
            faq1.setStatus("published");
            faq1.setImportant(true);
            faq1.setAuthor("관리자");
            faqService.createFAQ(faq1);

            FAQDto faq2 = new FAQDto();
            faq2.setQuestion("입찰 취소가 가능한가요?");
            faq2.setAnswer("입찰 후 1시간 이내에는 취소가 가능하며, 그 이후에는 취소할 수 없습니다.");
            faq2.setCategory("입찰");
            faq2.setStatus("published");
            faq2.setImportant(false);
            faq2.setAuthor("관리자");
            faqService.createFAQ(faq2);

            FAQDto faq3 = new FAQDto();
            faq3.setQuestion("배송은 언제 되나요?");
            faq3.setAnswer("경매 종료 후 3일 이내에 배송이 시작되며, 배송 상황은 마이페이지에서 확인할 수 있습니다.");
            faq3.setCategory("배송");
            faq3.setStatus("published");
            faq3.setImportant(false);
            faq3.setAuthor("관리자");
            faqService.createFAQ(faq3);

            return ResponseEntity.ok("FAQ 샘플 데이터가 성공적으로 생성되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("FAQ 샘플 데이터 생성에 실패했습니다: " + e.getMessage());
        }
    }
    
    @GetMapping("/published")
    public List<FAQDto> getPublishedFAQs() {
        return faqService.getPublishedFAQs();
    }

    @GetMapping("/published/{id}")
    public FAQDto getPublishedFAQ(@PathVariable Long id) {
        return faqService.getFAQAndIncrementViews(id);
    }

    @GetMapping("/category/{category}")
    public List<FAQDto> getFAQsByCategory(@PathVariable String category) {
        return faqService.getFAQsByCategory(category);
    }

    @GetMapping("/search")
    public List<FAQDto> searchFAQs(@RequestParam String term) {
        return faqService.searchFAQsByQuestion(term);
    }

    // ===== 관리자 API =====
    
    @PostMapping("/admin")
    public ResponseEntity<String> createFAQ(@RequestBody FAQDto dto) {
        try {
            faqService.createFAQ(dto);
            return ResponseEntity.ok("FAQ가 성공적으로 생성되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("FAQ 생성에 실패했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/admin")
    public List<FAQDto> getAllFAQs() {
        return faqService.getAllFAQs();
    }

    @GetMapping("/admin/{id}")
    public FAQDto getFAQ(@PathVariable Long id) {
        return faqService.getFAQ(id);
    }

    @PutMapping("/admin")
    public ResponseEntity<String> updateFAQ(@RequestBody FAQDto dto) {
        try {
            faqService.updateFAQ(dto);
            return ResponseEntity.ok("FAQ가 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("FAQ 수정에 실패했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteFAQ(@PathVariable Long id) {
        try {
            faqService.deleteFAQ(id);
            return ResponseEntity.ok("FAQ가 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("FAQ 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    // ===== 관리자 검색 및 필터링 API =====
    
    @GetMapping("/admin/search")
    public List<FAQDto> searchFAQsAdmin(@RequestParam String term) {
        return faqService.searchFAQsByQuestion(term);
    }

    @GetMapping("/admin/search/question")
    public List<FAQDto> searchFAQsByQuestion(@RequestParam String question) {
        return faqService.searchFAQsByQuestion(question);
    }

    @GetMapping("/admin/status/{status}")
    public List<FAQDto> getFAQsByStatus(@PathVariable String status) {
        return faqService.getFAQsByStatus(status);
    }

    // ===== 관리자 상태 변경 API =====
    
    @PutMapping("/admin/{id}/publish")
    public ResponseEntity<String> publishFAQ(@PathVariable Long id) {
        try {
            faqService.publishFAQ(id);
            return ResponseEntity.ok("FAQ가 발행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("FAQ 발행에 실패했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/unpublish")
    public ResponseEntity<String> unpublishFAQ(@PathVariable Long id) {
        try {
            faqService.unpublishFAQ(id);
            return ResponseEntity.ok("FAQ가 임시저장 상태로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("FAQ 상태 변경에 실패했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/toggle-important")
    public ResponseEntity<String> toggleImportant(@PathVariable Long id) {
        try {
            faqService.toggleImportant(id);
            return ResponseEntity.ok("중요도가 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("중요도 변경에 실패했습니다: " + e.getMessage());
        }
    }

    // ===== 관리자 통계 API =====
    
    @GetMapping("/admin/stats")
    public Map<String, Object> getFAQStats() {
        return faqService.getFAQStats();
    }
} 
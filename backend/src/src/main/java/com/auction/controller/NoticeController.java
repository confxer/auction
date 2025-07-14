package com.auction.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

import com.auction.dto.NoticeDto;
import com.auction.service.NoticeService;

@RestController
@RequestMapping("/api/notice")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class NoticeController {
    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    // ===== 일반 사용자 API =====
    
    // 간단한 테스트 API
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Notice API is working!");
    }
    
    // 데이터베이스 연결 테스트
    @GetMapping("/test-db")
    public ResponseEntity<String> testDatabase() {
        try {
            List<NoticeDto> notices = noticeService.getAllNotices();
            return ResponseEntity.ok("Database connection successful! Found " + notices.size() + " notices.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Database connection failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/published")
    public List<NoticeDto> getPublishedNotices() {
        return noticeService.getPublishedNotices();
    }

    @GetMapping("/published/{id}")
    public NoticeDto getPublishedNotice(@PathVariable Long id) {
        return noticeService.getNoticeAndIncrementViews(id);
    }

    @GetMapping("/category/{category}")
    public List<NoticeDto> getNoticesByCategory(@PathVariable String category) {
        return noticeService.getNoticesByCategory(category);
    }

    // Mock 데이터 테스트 API (데이터베이스 연결 없이)
    @GetMapping("/mock")
    public ResponseEntity<List<NoticeDto>> getMockNotices() {
        List<NoticeDto> mockNotices = new ArrayList<>();
        
        NoticeDto notice1 = new NoticeDto();
        notice1.setId(1L);
        notice1.setTitle("테스트 공지사항 1");
        notice1.setContent("이것은 테스트 공지사항입니다.");
        notice1.setCategory("general");
        notice1.setStatus("published");
        notice1.setImportant(false);
        notice1.setAuthor("관리자");
        notice1.setCreatedAt(LocalDateTime.now());
        notice1.setViews(0);
        
        NoticeDto notice2 = new NoticeDto();
        notice2.setId(2L);
        notice2.setTitle("중요 공지사항");
        notice2.setContent("이것은 중요한 공지사항입니다.");
        notice2.setCategory("important");
        notice2.setStatus("published");
        notice2.setImportant(true);
        notice2.setAuthor("관리자");
        notice2.setCreatedAt(LocalDateTime.now().minusDays(1));
        notice2.setViews(10);
        
        mockNotices.add(notice1);
        mockNotices.add(notice2);
        
        return ResponseEntity.ok(mockNotices);
    }

    // ===== 관리자 API =====
    
    // API 상태 확인용
    @GetMapping("/admin/status")
    public ResponseEntity<String> getApiStatus() {
        return ResponseEntity.ok("Notice API is working!");
    }
    
    // 테스트용 API - 간단한 공지사항 생성
    @PostMapping("/admin/test")
    public ResponseEntity<String> createTestNotice() {
        try {
            NoticeDto dto = new NoticeDto();
            dto.setTitle("테스트 공지사항");
            dto.setContent("이것은 테스트 공지사항입니다.");
            dto.setCategory("general");
            dto.setStatus("published");
            dto.setImportant(false);
            dto.setAuthor("테스트 관리자");
            
            noticeService.createNotice(dto);
            return ResponseEntity.ok("테스트 공지사항이 성공적으로 생성되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("테스트 공지사항 생성에 실패했습니다: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin")
    public ResponseEntity<String> createNotice(@RequestBody NoticeDto dto) {
        try {
            noticeService.createNotice(dto);
            return ResponseEntity.ok("공지사항이 성공적으로 생성되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("공지사항 생성에 실패했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/admin")
    public List<NoticeDto> getAllNotices() {
        return noticeService.getAllNotices();
    }

    @GetMapping("/admin/{id}")
    public NoticeDto getNotice(@PathVariable Long id) {
        return noticeService.getNotice(id);
    }

    @PutMapping("/admin")
    public ResponseEntity<String> updateNotice(@RequestBody NoticeDto dto) {
        try {
            noticeService.updateNotice(dto);
            return ResponseEntity.ok("공지사항이 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("공지사항 수정에 실패했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteNotice(@PathVariable Long id) {
        try {
            noticeService.deleteNotice(id);
            return ResponseEntity.ok("공지사항이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("공지사항 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    // ===== 관리자 검색 및 필터링 API =====
    
    @GetMapping("/admin/search")
    public List<NoticeDto> searchNotices(@RequestParam String title) {
        return noticeService.searchNoticesByTitle(title);
    }

    @GetMapping("/admin/status/{status}")
    public List<NoticeDto> getNoticesByStatus(@PathVariable String status) {
        return noticeService.getNoticesByStatus(status);
    }

    // ===== 관리자 상태 변경 API =====
    
    @PutMapping("/admin/{id}/publish")
    public ResponseEntity<String> publishNotice(@PathVariable Long id) {
        try {
            noticeService.publishNotice(id);
            return ResponseEntity.ok("공지사항이 발행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("공지사항 발행에 실패했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/unpublish")
    public ResponseEntity<String> unpublishNotice(@PathVariable Long id) {
        try {
            noticeService.unpublishNotice(id);
            return ResponseEntity.ok("공지사항이 임시저장 상태로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("공지사항 상태 변경에 실패했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/toggle-important")
    public ResponseEntity<String> toggleImportant(@PathVariable Long id) {
        try {
            noticeService.toggleImportant(id);
            return ResponseEntity.ok("중요도가 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("중요도 변경에 실패했습니다: " + e.getMessage());
        }
    }

    // ===== 관리자 통계 API =====
    
    @GetMapping("/admin/stats")
    public Map<String, Object> getNoticeStats() {
        return noticeService.getNoticeStats();
    }
} 
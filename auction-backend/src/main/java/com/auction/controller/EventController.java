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

import com.auction.dto.EventDto;
import com.auction.service.EventService;

@RestController
@RequestMapping("/api/event")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class EventController {
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // ===== 일반 사용자 API =====
    
    // 이벤트 샘플 데이터 생성
    @PostMapping("/sample-data")
    public ResponseEntity<String> createSampleEvents() {
        try {
            EventDto event1 = new EventDto();
            event1.setTitle("신규 회원 가입 이벤트");
            event1.setContent("신규 회원 가입 시 10,000원 할인 쿠폰을 드립니다!");
            event1.setCategory("가입혜택");
            event1.setStatus("published");
            event1.setImportant(true);
            event1.setAuthor("관리자");
            event1.setStartDate(java.time.LocalDate.now());
            event1.setEndDate(java.time.LocalDate.now().plusMonths(1));
            eventService.createEvent(event1);

            EventDto event2 = new EventDto();
            event2.setTitle("첫 경매 참여 이벤트");
            event2.setContent("첫 경매 참여 시 수수료 면제 혜택을 제공합니다.");
            event2.setCategory("경매혜택");
            event2.setStatus("published");
            event2.setImportant(false);
            event2.setAuthor("관리자");
            event2.setStartDate(java.time.LocalDate.now());
            event2.setEndDate(java.time.LocalDate.now().plusWeeks(2));
            eventService.createEvent(event2);

            EventDto event3 = new EventDto();
            event3.setTitle("프리미엄 상품 경매");
            event3.setContent("한정 수량의 프리미엄 상품들을 특별 가격으로 경매합니다.");
            event3.setCategory("특별경매");
            event3.setStatus("published");
            event3.setImportant(true);
            event3.setAuthor("관리자");
            event3.setStartDate(java.time.LocalDate.now());
            event3.setEndDate(java.time.LocalDate.now().plusDays(7));
            eventService.createEvent(event3);

            return ResponseEntity.ok("이벤트 샘플 데이터가 성공적으로 생성되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("이벤트 샘플 데이터 생성에 실패했습니다: " + e.getMessage());
        }
    }
    
    @GetMapping("/published")
    public List<EventDto> getPublishedEvents() {
        return eventService.getPublishedEvents();
    }

    @GetMapping("/ongoing")
    public List<EventDto> getOngoingEvents() {
        return eventService.getOngoingEvents();
    }

    @GetMapping("/published/{id}")
    public EventDto getPublishedEvent(@PathVariable Long id) {
        return eventService.getEventAndIncrementViews(id);
    }

    @GetMapping("/category/{category}")
    public List<EventDto> getEventsByCategory(@PathVariable String category) {
        return eventService.getEventsByCategory(category);
    }

    @GetMapping("/search")
    public List<EventDto> searchEvents(@RequestParam String title) {
        return eventService.searchEventsByTitle(title);
    }

    // ===== 관리자 API =====
    
    @PostMapping("/admin")
    public ResponseEntity<String> createEvent(@RequestBody EventDto dto) {
        try {
            eventService.createEvent(dto);
            return ResponseEntity.ok("이벤트가 성공적으로 생성되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이벤트 생성에 실패했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/admin")
    public List<EventDto> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/admin/{id}")
    public EventDto getEvent(@PathVariable Long id) {
        return eventService.getEvent(id);
    }

    @PutMapping("/admin")
    public ResponseEntity<String> updateEvent(@RequestBody EventDto dto) {
        try {
            eventService.updateEvent(dto);
            return ResponseEntity.ok("이벤트가 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이벤트 수정에 실패했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok("이벤트가 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이벤트 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    // ===== 관리자 검색 및 필터링 API =====
    
    @GetMapping("/admin/search")
    public List<EventDto> searchEventsAdmin(@RequestParam String title) {
        return eventService.searchEventsByTitle(title);
    }

    @GetMapping("/admin/status/{status}")
    public List<EventDto> getEventsByStatus(@PathVariable String status) {
        return eventService.getEventsByStatus(status);
    }

    // ===== 관리자 상태 변경 API =====
    
    @PutMapping("/admin/{id}/publish")
    public ResponseEntity<String> publishEvent(@PathVariable Long id) {
        try {
            eventService.publishEvent(id);
            return ResponseEntity.ok("이벤트가 발행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이벤트 발행에 실패했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/unpublish")
    public ResponseEntity<String> unpublishEvent(@PathVariable Long id) {
        try {
            eventService.unpublishEvent(id);
            return ResponseEntity.ok("이벤트가 임시저장 상태로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이벤트 상태 변경에 실패했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{id}/toggle-important")
    public ResponseEntity<String> toggleImportant(@PathVariable Long id) {
        try {
            eventService.toggleImportant(id);
            return ResponseEntity.ok("중요도가 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("중요도 변경에 실패했습니다: " + e.getMessage());
        }
    }

    // ===== 관리자 통계 API =====
    
    @GetMapping("/admin/stats")
    public Map<String, Object> getEventStats() {
        return eventService.getEventStats();
    }
} 
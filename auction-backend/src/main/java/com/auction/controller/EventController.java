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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://auction-react-bucket-20250804-prj.s3-website.ap-northeast-2.amazonaws.com"}, allowCredentials = "true")
public class EventController {
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // ===== 일반 사용자 API =====
    
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

    @GetMapping("/{id}")
    public EventDto getEventbyId(@PathVariable Long id) {
        return eventService.getEventbyId(id);
    }
} 
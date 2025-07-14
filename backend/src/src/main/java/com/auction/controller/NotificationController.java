package com.auction.controller;

import com.auction.dto.NotificationDto;
import com.auction.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // 사용자별 알림 목록 조회
    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@PathVariable String userId) {
        try {
            List<NotificationDto> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 읽지 않은 알림 수 조회
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@PathVariable String userId) {
        try {
            int count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(0);
        }
    }

    // 알림 읽음 처리
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok("읽음 처리 완료");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("읽음 처리 실패");
        }
    }

    // 모든 알림 읽음 처리
    @PutMapping("/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok("모든 알림 읽음 처리 완료");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("읽음 처리 실패");
        }
    }
} 
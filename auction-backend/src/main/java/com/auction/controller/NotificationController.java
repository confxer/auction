package com.auction.controller;

import com.auction.dto.NotificationDto;
import com.auction.service.NotificationServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationServiceImpl notificationService;

    @Autowired
    public NotificationController(NotificationServiceImpl notificationService) {
        this.notificationService = notificationService;
    }

    // 🔔 사용자 알림 전체 조회
    @GetMapping("/{userId}")
    public List<NotificationDto> getNotifications(@PathVariable String userId) {
        return notificationService.getUserNotifications(userId);
    }

    // 🔔 읽지 않은 알림 개수 조회
    @GetMapping("/{userId}/unread-count")
    public int getUnreadCount(@PathVariable String userId) {
        return notificationService.getUnreadCount(userId);
    }

    // ✅ 단일 알림 읽음 처리
    @PostMapping("/read/{id}")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    // ✅ 전체 알림 읽음 처리
    @PostMapping("/{userId}/read-all")
    public void markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
    }
    
    // 🔔 알림 저장
    @PostMapping
    @PreAuthorize("isAuthenticated() and (#notificationData.userId == authentication.principal.username or hasRole('ADMIN'))")
    public ResponseEntity<NotificationDto> createNotification(@RequestBody Map<String, Object> notificationData) {
        String userId = (String) notificationData.get("userId");
        String message = (String) notificationData.get("message");
        String type = (String) notificationData.get("type");
        
        NotificationDto dto = new NotificationDto();
        dto.setUserId(userId);
        dto.setMessage(message);
        dto.setType(type);
        
        // Save the notification
        NotificationDto savedNotification = notificationService.saveNotification(dto);
        return ResponseEntity.ok(savedNotification);
    }
}
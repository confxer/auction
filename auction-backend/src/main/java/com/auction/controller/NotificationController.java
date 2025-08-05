package com.auction.controller;

import com.auction.entity.Notification;

import com.auction.dto.NotificationDto;
import com.auction.service.NotificationServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

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
        notificationService.getUserNotifications(userId).stream().map(NotificationDto::getIsRead).forEach(System.out::println);
        System.out.println("Fetching notifications for user: " + userId);
        return notificationService.getUserNotifications(userId);
    }

    // 🔔 읽지 않은 알림 개수 조회
    @GetMapping("/{userId}/unread-count")
    public int getUnreadCount(@PathVariable String userId) {
        return notificationService.getUnreadCount(userId);
    }

    /**
     * ✅ 단일 알림 읽음 처리
     * @param id 알림 ID
     * @return 업데이트된 알림 정보
     */
    @PostMapping("/read/{id}")
    @Transactional
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        try {
            // 알림을 읽음 처리
            notificationService.markAsRead(id);
            
            // 업데이트된 알림 정보 조회
            Notification notification = notificationService.findById(id);
            if (notification != null) {
                NotificationDto dto = notification.toDto();
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            // 로깅
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
package com.auction.controller;

import com.auction.dto.NotificationDto;
import com.auction.service.NotificationServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
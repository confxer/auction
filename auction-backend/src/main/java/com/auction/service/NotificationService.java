package com.auction.service;

import com.auction.dto.NotificationDto;

import java.util.List;

public interface NotificationService {
    void sendNotification(String userId, NotificationDto dto);
    void sendAuctionEndNotification(Long auctionId, String title, String winner);
    void sendBuyNowNotification(Long auctionId, String title, String buyer);
    List<NotificationDto> getUserNotifications(String userId);
    int getUnreadCount(String userId);
    void markAsRead(Long id);
    void markAllAsRead(String userId);

    // Save and notify a user
    void saveAndNotify(NotificationDto dto);
    
    // Send bid notification to seller and bidder
    void sendBidNotification(Long auctionId, String title, String bidder, Long amount);
    
    // Save a notification
    NotificationDto saveNotification(NotificationDto dto);
}
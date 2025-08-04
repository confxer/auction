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

    // ❗ 추가
    void saveAndNotify(NotificationDto dto);
    void sendBidNotification(Long auctionId, String title, String bidder, Long amount);
    void sendSellerNotification(Long auctionId, String title, String seller, Long amount);
}
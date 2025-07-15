package com.auction.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.auction.dto.NotificationDto;
import com.auction.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // 입찰 알림 (경매 등록자에게)
    public void sendBidNotification(Long auctionId, String auctionTitle, String bidder, Long bidAmount) {
        String message = String.format("🎯 '%s'에 %s님이 %d원으로 입찰했습니다!", auctionTitle, bidder, bidAmount);
        NotificationDto notification = new NotificationDto(auctionId, auctionTitle, "seller", "BID", message);
        
        notificationRepository.save(notification);
        
        // WebSocket으로 실시간 알림 전송
        messagingTemplate.convertAndSend("/topic/notifications/seller", notification);
    }

    // 경매 마감 알림 (모든 입찰자에게)
    public void sendAuctionEndNotification(Long auctionId, String auctionTitle, String winner) {
        List<String> bidders = notificationRepository.findBiddersByAuctionId(auctionId);
        
        for (String bidder : bidders) {
            String message;
            String type;
            
            if (bidder.equals(winner)) {
                message = String.format("🏆 축하합니다! '%s' 경매에서 낙찰되었습니다!", auctionTitle);
                type = "WIN";
            } else {
                message = String.format("😔 '%s' 경매에서 패찰되었습니다. 낙찰자: %s", auctionTitle, winner);
                type = "LOSE";
            }
            
            NotificationDto notification = new NotificationDto(auctionId, auctionTitle, bidder, type, message);
            notificationRepository.save(notification);
            
            // WebSocket으로 실시간 알림 전송
            messagingTemplate.convertAndSend("/topic/notifications/" + bidder, notification);
        }
    }

    // 즉시구매 알림
    public void sendBuyNowNotification(Long auctionId, String auctionTitle, String buyer) {
        String message = String.format("💎 '%s'을(를) 즉시구매하셨습니다!", auctionTitle);
        NotificationDto notification = new NotificationDto(auctionId, auctionTitle, buyer, "BUY_NOW", message);
        
        notificationRepository.save(notification);
        
        // WebSocket으로 실시간 알림 전송
        messagingTemplate.convertAndSend("/topic/notifications/" + buyer, notification);
    }

    // 쪽지 등에서 알림 저장 + WebSocket 전송
    public void saveAndNotify(NotificationDto notification) {
        notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications/" + notification.getUserId(), notification);
    }

    // 사용자별 알림 목록 조회
    public List<NotificationDto> getUserNotifications(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    // 읽지 않은 알림 수 조회
    public int getUnreadCount(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    // 알림 읽음 처리
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    // 모든 알림 읽음 처리
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }
} 
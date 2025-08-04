package com.auction.service;

import com.auction.dto.AuctionDto;
import com.auction.dto.NotificationDto;
import com.auction.entity.Notification;
import com.auction.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionService auctionService;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                 SimpMessagingTemplate messagingTemplate,
                                 @Lazy AuctionService auctionService) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.auctionService = auctionService;
    }

    @Override
    public void sendNotification(String userId, NotificationDto dto) {
        try {
            logger.info("Sending notification to user: {}, type: {}, message: {}", userId, dto.getType(), dto.getMessage());
            dto.setUserId(userId);
            
            // Save to database
            Notification notification = new Notification(dto);
            Notification savedNotification = notificationRepository.save(notification);
            logger.info("Notification saved to database with ID: {}", savedNotification.getId());

            // Send via WebSocket
            String destination = "/topic/notifications/" + userId;
            logger.info("Sending WebSocket message to destination: {}", destination);
            messagingTemplate.convertAndSend(destination, dto);
            logger.info("WebSocket message sent successfully");
            
        } catch (Exception e) {
            logger.error("Error in sendNotification for user {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void sendAuctionEndNotification(Long auctionId, String title, String winner) {
        String winnerUserId = winner;
        String sellerUserId = null; // TODO: 판매자 ID 조회 필요
        List<String> bidders = notificationRepository.findBiddersByAuctionId(auctionId);

        for (String bidder : bidders) {
            String type = bidder.equals(winnerUserId) ? "WIN" : "LOSE";
            String msg = bidder.equals(winnerUserId)
                    ? "🏆 '" + title + "' 경매에서 낙찰되었습니다!"
                    : "😢 '" + title + "' 경매에서 패찰되었습니다. 낙찰자: " + winnerUserId;

            NotificationDto dto = new NotificationDto(auctionId, title, bidder, type, msg);
            sendNotification(bidder, dto);
        }

        if (sellerUserId != null && !sellerUserId.equals(winnerUserId)) {
            NotificationDto sellerNotice = new NotificationDto(
                    auctionId, title, sellerUserId, "SOLD",
                    "📦 '" + title + "' 경매가 마감되었습니다. 낙찰자: " + winnerUserId
            );
            sendNotification(sellerUserId, sellerNotice);
        }
    }

    @Override
    public void sendBuyNowNotification(Long auctionId, String title, String buyer) {
        try {
            // Get the auction to find the seller
            AuctionDto auction = auctionService.getAuctionById(auctionId);
            if (auction == null) {
                logger.error("Auction not found for ID: " + auctionId);
                return;
            }

            String buyerUserId = buyer;
            String sellerUserId = String.valueOf(auction.getUserId());

            // Send notification to the buyer
            NotificationDto buyerNotice = new NotificationDto(
                auctionId, 
                title, 
                buyerUserId, 
                "BUY_NOW",
                "✅ '" + title + "' 즉시구매가 완료되었습니다!"
            );
            sendNotification(buyerUserId, buyerNotice);
            logger.info("Buy now notification sent to buyer {} for auction {}", buyerUserId, auctionId);

            // Send notification to the seller if not buying from themselves
            if (!sellerUserId.equals(buyerUserId)) {
                NotificationDto sellerNotice = new NotificationDto(
                    auctionId, 
                    title, 
                    sellerUserId, 
                    "SOLD",
                    "💰 '" + title + "' 상품이 즉시구매로 판매되었습니다. 구매자: " + buyerUserId
                );
                sendNotification(sellerUserId, sellerNotice);
                logger.info("Sale notification sent to seller {} for auction {}", sellerUserId, auctionId);
            }
            
        } catch (Exception e) {
            logger.error("Error sending buy now notification: ", e);
        }
    }

    @Override
    public List<NotificationDto> getUserNotifications(String userId) {
        List<Notification> list = notificationRepository.findByUserId(userId);
        return list.stream()
                .map(Notification::toDto) // ← toDto() 메서드 필요
                .collect(Collectors.toList());
    }

    @Override
    public int getUnreadCount(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    public void markAsRead(Long id) {
        notificationRepository.markAsRead(id);
    }

    @Override
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Override
    public void saveAndNotify(NotificationDto dto) {
        // Save the notification to database
        Notification notification = new Notification(dto);
        notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + dto.getUserId(), dto);
    }

    @Override
    public NotificationDto saveNotification(NotificationDto dto) {
        logger.info("Saving notification for user: {}, message: {}", dto.getUserId(), dto.getMessage());
        
        // Create and save the notification
        Notification notification = new Notification(dto);
        notification = notificationRepository.save(notification);
        logger.info("Notification saved with ID: {}", notification.getId());
        
        // Convert to DTO and return
        return convertToDto(notification);
    }
    
    // Convert Notification entity to NotificationDto
    private NotificationDto convertToDto(Notification notification) {
        if (notification == null) {
            return null;
        }
        
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        
        return dto;
    }

    @Override
    public void sendBidNotification(Long auctionId, String title, String bidder, Long amount) {
        try {
            // Get the auction to find the seller
            AuctionDto auction = auctionService.getAuctionById(auctionId);
            if (auction == null) {
                logger.error("Auction not found for ID: " + auctionId);
                return;
            }

            String sellerId = String.valueOf(auction.getUserId());
            
            // Only send notification to the seller if the bidder is not the seller
            if (!bidder.equals(sellerId)) {
                NotificationDto sellerNotice = new NotificationDto(
                    auctionId, 
                    title, 
                    sellerId, 
                    "NEW_BID", 
                    "💰 새 입찰: '" + title + "'에 " + String.format("%,d", amount) + "원에 입찰되었습니다."
                );
                sendNotification(sellerId, sellerNotice);
                logger.info("Bid notification sent to seller {} for auction {}", sellerId, auctionId);
            }
            
            // Also send a notification to the bidder (optional)
            NotificationDto bidderNotice = new NotificationDto(
                auctionId,
                title,
                bidder,
                "BID_PLACED",
                "✅ '" + title + "'에 " + String.format("%,d", amount) + "원으로 입찰하셨습니다."
            );
            sendNotification(bidder, bidderNotice);
            logger.info("Bid confirmation sent to bidder {} for auction {}", bidder, auctionId);
            
        } catch (Exception e) {
            logger.error("Error sending bid notification: ", e);
        }
    }

}
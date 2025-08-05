package com.auction.service;

import com.auction.dto.AuctionDto;
import com.auction.dto.NotificationDto;
import com.auction.entity.Notification;
import com.auction.entity.NotificationType;
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
    // ... 기존 필드 및 생성자 유지

    public Notification findById(Long id) {
        return notificationRepository.findById(id);
    }
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
    public void sendAuctionEndNotification(Long auctionId, String title, String winner, Long sellerId) {
        String winnerUserId = winner;
        String sellerUserId = sellerId.toString();
        List<String> bidders = notificationRepository.findBiddersByAuctionId(auctionId);

        for (String bidder : bidders) {
    NotificationType type = bidder.equals(winnerUserId) ? NotificationType.WIN : NotificationType.LOSE;
    String msg = bidder.equals(winnerUserId)
            ? String.format("🏆 '%s' 경매에서 낙찰되었습니다!", title)
            : String.format("😢 '%s' 경매에서 패찰되었습니다. 낙찰자: %s", title, winnerUserId);
    String notiTitle = type == NotificationType.WIN ? "낙찰 알림" : "패찰 알림";
    NotificationDto dto = NotificationDto.builder()
            .auctionId(auctionId)
            .title(notiTitle)
            .userId(bidder)
            .type(type.name())
            .message(msg)
            .sellerId(Long.valueOf(sellerUserId))
            .build();
    sendNotification(bidder, dto);
}

if (sellerUserId != null && !sellerUserId.equals(winnerUserId)) {
    NotificationDto sellerNotice = NotificationDto.builder()
            .auctionId(auctionId)
            .title("판매 완료")
            .userId(sellerUserId)
            .type(NotificationType.SOLD.name())
            .message(String.format("📦 '%s' 경매가 마감되었습니다. 낙찰자: %s", title, winnerUserId))
            .sellerId(Long.valueOf(sellerUserId))
            .build();
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
            NotificationDto buyerNotice = NotificationDto.builder()
    .auctionId(auctionId)
    .title("즉시구매 완료")
    .userId(buyerUserId)
    .type(NotificationType.BUY_NOW.name())
    .message(String.format("✅ '%s' 즉시구매가 완료되었습니다!", title))
    .sellerId(Long.valueOf(sellerUserId))
    .build();
sendNotification(buyerUserId, buyerNotice);
            logger.info("Buy now notification sent to buyer {} for auction {}", buyerUserId, auctionId);

            // Always send notification to the seller, even if they are the buyer
            NotificationDto sellerNotice = NotificationDto.builder()
                .auctionId(auctionId)
                .title("판매 완료")
                .userId(sellerUserId)
                .type(NotificationType.SOLD.name())
                .message(String.format("📦 '%s' 경매가 마감되었습니다. 구매자: %s", title, 
                    sellerUserId.equals(buyerUserId) ? "본인" : buyerUserId))
                .sellerId(Long.valueOf(sellerUserId))
                .build();
            sendNotification(sellerUserId, sellerNotice);
            logger.info("Sale notification sent to seller {} for auction {}", sellerUserId, auctionId);
            
        } catch (Exception e) {
            logger.error("Error sending buy now notification: ", e);
        }
    }

    @Override
    public List<NotificationDto> getUserNotifications(String userId) {
        List<Notification> list = notificationRepository.findByUserId(userId);
        return list.stream()
                .map(Notification::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public int getUnreadCount(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        try {
            // Verify notification exists first
            Notification notification = notificationRepository.findById(id);
            if (notification == null) {
                logger.warn("Attempted to mark non-existent notification as read: {}", id);
                throw new IllegalArgumentException("Notification not found with id: " + id);
            }
            
            // Only update if not already read
            if (notification.getIsRead() == 0) {
                notificationRepository.markAsRead(id);
                logger.debug("Marked notification as read: {}", id);
                
                // Send WebSocket update if needed
                NotificationDto dto = convertToDto(notification);
                dto.setIsRead(1);
                messagingTemplate.convertAndSend("/topic/notifications/" + notification.getUserId(), dto);
            }
        } catch (Exception e) {
            logger.error("Error marking notification {} as read: {}", id, e.getMessage(), e);
            throw e;
        }
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
        dto.setAuctionId(notification.getAuctionId());
        dto.setTitle(notification.getTitle());
        dto.setUserId(notification.getUserId());
        dto.setType(notification.getType());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead()); // Use getIsRead()
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setSellerId(notification.getSellerId());
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
            
            // Always send notification to the seller, even if they are the bidder
            String sellerMessage = bidder.equals(sellerId) 
                ? "💡 본인 상품에 " + String.format("%,d", amount) + "원으로 입찰하셨습니다."
                : "💰 새 입찰: '" + title + "'에 " + String.format("%,d", amount) + "원에 입찰되었습니다.";
                
            NotificationDto sellerNotice = NotificationDto.builder()
                .auctionId(auctionId)
                .title(bidder.equals(sellerId) ? "본인 입찰 알림" : "새 입찰 알림")
                .userId(sellerId)
                .type("NEW_BID")
                .message(sellerMessage)
                .sellerId(Long.valueOf(sellerId))
                .build();
            sendNotification(sellerId, sellerNotice);
            logger.info("Bid notification sent to seller {} for auction {}", sellerId, auctionId);
            
            // Also send a notification to the bidder (optional)
            NotificationDto bidderNotice = NotificationDto.builder()
                .auctionId(auctionId)
                .title(title)
                .userId(bidder)
                .type("BID_PLACED")
                .message("✅ '" + title + "'에 " + String.format("%,d", amount) + "원으로 입찰하셨습니다.")
                .isRead(0)
                .build();
            sendNotification(bidder, bidderNotice);
            logger.info("Bid confirmation sent to bidder {} for auction {}", bidder, auctionId);
            
        } catch (Exception e) {
            logger.error("Error sending bid notification: ", e);
        }
    }

}
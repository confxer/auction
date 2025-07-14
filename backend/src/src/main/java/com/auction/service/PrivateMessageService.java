package com.auction.service;

import com.auction.dto.PrivateMessageDto;
import com.auction.repository.PrivateMessageRepository;
import com.auction.service.NotificationService;
import com.auction.dto.NotificationDto;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrivateMessageService {

    private final PrivateMessageRepository privateMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public PrivateMessageService(PrivateMessageRepository privateMessageRepository,
                               SimpMessagingTemplate messagingTemplate,
                               NotificationService notificationService) {
        this.privateMessageRepository = privateMessageRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    // 쪽지 전송
    public PrivateMessageDto sendMessage(Long auctionId, String senderId, String senderName,
                                       String receiverId, String receiverName, String subject, String content) {
        PrivateMessageDto message = new PrivateMessageDto(auctionId, senderId, senderName, 
                                                        receiverId, receiverName, subject, content);
        privateMessageRepository.save(message);

        // WebSocket으로 실시간 쪽지 알림 전송
        messagingTemplate.convertAndSend("/topic/messages/" + receiverId, message);

        // NotificationBell용 쪽지 알림 전송
        String notiMsg = String.format("%s님에게서 쪽지가 도착했습니다: %s", senderName, subject);
        NotificationDto notification = new NotificationDto(auctionId, subject, receiverId, "MESSAGE", notiMsg);
        notificationService.saveAndNotify(notification);

        return message;
    }

    // 받은 쪽지 목록 조회
    public List<PrivateMessageDto> getReceivedMessages(String userId) {
        return privateMessageRepository.findByReceiverId(userId);
    }

    // 보낸 쪽지 목록 조회
    public List<PrivateMessageDto> getSentMessages(String userId) {
        return privateMessageRepository.findBySenderId(userId);
    }

    // 쪽지 상세 조회
    public PrivateMessageDto getMessage(Long messageId) {
        return privateMessageRepository.findById(messageId);
    }

    // 쪽지 읽음 처리
    public void markAsRead(Long messageId) {
        privateMessageRepository.markAsRead(messageId);
    }

    // 읽지 않은 쪽지 수 조회
    public int getUnreadCount(String userId) {
        return privateMessageRepository.countUnreadByReceiverId(userId);
    }

    // 쪽지 삭제
    public void deleteMessage(Long messageId) {
        privateMessageRepository.delete(messageId);
    }

    // 경매별 쪽지 목록 조회
    public List<PrivateMessageDto> getMessagesByAuction(Long auctionId, String userId) {
        List<PrivateMessageDto> received = privateMessageRepository.findByReceiverId(userId);
        List<PrivateMessageDto> sent = privateMessageRepository.findBySenderId(userId);
        
        // 경매 ID로 필터링
        received.removeIf(msg -> !msg.getAuctionId().equals(auctionId));
        sent.removeIf(msg -> !msg.getAuctionId().equals(auctionId));
        
        // 시간순으로 정렬하여 합치기
        received.addAll(sent);
        received.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        return received;
    }
} 
package com.auction.service;

import com.auction.dto.ChatRoomDto;
import com.auction.dto.ChatMessageDto;
import com.auction.dto.ChatParticipantDto;
import com.auction.repository.ChatRoomRepository;
import com.auction.repository.ChatMessageRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatRoomRepository chatRoomRepository, 
                      ChatMessageRepository chatMessageRepository,
                      SimpMessagingTemplate messagingTemplate) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // 채팅방 생성 또는 조회
    public ChatRoomDto getOrCreateChatRoom(Long auctionId, String roomName) {
        ChatRoomDto existingRoom = chatRoomRepository.findByAuctionId(auctionId);
        if (existingRoom != null) {
            return existingRoom;
        }

        // 새 채팅방 생성
        ChatRoomDto newRoom = new ChatRoomDto(auctionId, roomName);
        chatRoomRepository.save(newRoom);
        return newRoom;
    }

    // 사용자의 채팅방 목록 조회
    public List<ChatRoomDto> getUserChatRooms(String userId) {
        return chatRoomRepository.findByUserId(userId);
    }

    // 채팅방 메시지 목록 조회
    public List<ChatMessageDto> getChatMessages(Long roomId) {
        return chatMessageRepository.findByRoomId(roomId);
    }

    // 메시지 전송
    public ChatMessageDto sendMessage(Long roomId, String senderId, String senderName, String message) {
        ChatMessageDto chatMessage = new ChatMessageDto(roomId, senderId, senderName, message);
        chatMessageRepository.save(chatMessage);

        // WebSocket으로 실시간 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, chatMessage);

        return chatMessage;
    }

    // 시스템 메시지 전송
    public ChatMessageDto sendSystemMessage(Long roomId, String message) {
        ChatMessageDto systemMessage = new ChatMessageDto(roomId, "SYSTEM", "시스템", message, "SYSTEM");
        chatMessageRepository.save(systemMessage);

        // WebSocket으로 실시간 시스템 메시지 전송
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, systemMessage);

        return systemMessage;
    }

    // 사용자 입장 메시지
    public void sendJoinMessage(Long roomId, String userName) {
        String message = "👋 " + userName + "님이 입장하셨습니다.";
        sendSystemMessage(roomId, message);
    }

    // 사용자 퇴장 메시지
    public void sendLeaveMessage(Long roomId, String userName) {
        String message = "👋 " + userName + "님이 퇴장하셨습니다.";
        sendSystemMessage(roomId, message);
    }

    // 메시지 삭제
    public void deleteMessage(Long messageId) {
        chatMessageRepository.delete(messageId);
    }

    // 채팅방 비활성화
    public void deactivateChatRoom(Long roomId) {
        chatRoomRepository.deactivate(roomId);
        sendSystemMessage(roomId, "🔒 채팅방이 비활성화되었습니다.");
    }
} 
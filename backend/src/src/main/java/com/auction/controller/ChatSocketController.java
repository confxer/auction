package com.auction.controller;

import com.auction.dto.ChatMessageDto;
import com.auction.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatSocketController {

    private final ChatService chatService;

    public ChatSocketController(ChatService chatService) {
        this.chatService = chatService;
    }

    // 채팅 메시지 전송
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessageDto sendMessage(@Payload ChatMessageDto chatMessage) {
        // 메시지를 데이터베이스에 저장하고 실시간으로 전송
        return chatService.sendMessage(
            chatMessage.getRoomId(),
            chatMessage.getSenderId(),
            chatMessage.getSenderName(),
            chatMessage.getMessage()
        );
    }

    // 채팅방 입장
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessageDto addUser(@Payload ChatMessageDto chatMessage, 
                                 SimpMessageHeaderAccessor headerAccessor) {
        // WebSocket 세션에 사용자 정보 추가
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSenderName());
        headerAccessor.getSessionAttributes().put("roomId", chatMessage.getRoomId());
        
        // 입장 메시지 전송
        chatService.sendJoinMessage(chatMessage.getRoomId(), chatMessage.getSenderName());
        
        return chatMessage;
    }

    // 채팅방 퇴장
    @MessageMapping("/chat.removeUser")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessageDto removeUser(@Payload ChatMessageDto chatMessage) {
        // 퇴장 메시지 전송
        chatService.sendLeaveMessage(chatMessage.getRoomId(), chatMessage.getSenderName());
        
        return chatMessage;
    }

    // 시스템 메시지 전송
    @MessageMapping("/chat.systemMessage")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessageDto sendSystemMessage(@Payload ChatMessageDto chatMessage) {
        return chatService.sendSystemMessage(chatMessage.getRoomId(), chatMessage.getMessage());
    }
} 
package com.auction.controller;

import com.auction.dto.ChatRoomDto;
import com.auction.dto.ChatMessageDto;
import com.auction.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // 채팅방 생성 또는 조회
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomDto> createOrGetChatRoom(@RequestParam Long auctionId, 
                                                          @RequestParam String roomName) {
        try {
            ChatRoomDto room = chatService.getOrCreateChatRoom(auctionId, roomName);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 사용자의 채팅방 목록 조회
    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms(@PathVariable String userId) {
        try {
            List<ChatRoomDto> rooms = chatService.getUserChatRooms(userId);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 채팅방 메시지 목록 조회
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(@PathVariable Long roomId) {
        try {
            List<ChatMessageDto> messages = chatService.getChatMessages(roomId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 메시지 전송
    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(@PathVariable Long roomId,
                                                     @RequestParam String senderId,
                                                     @RequestParam String senderName,
                                                     @RequestParam String message) {
        try {
            ChatMessageDto chatMessage = chatService.sendMessage(roomId, senderId, senderName, message);
            return ResponseEntity.ok(chatMessage);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 메시지 삭제
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        try {
            chatService.deleteMessage(messageId);
            return ResponseEntity.ok("메시지가 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("메시지 삭제 실패");
        }
    }

    // 채팅방 비활성화
    @PutMapping("/rooms/{roomId}/deactivate")
    public ResponseEntity<?> deactivateChatRoom(@PathVariable Long roomId) {
        try {
            chatService.deactivateChatRoom(roomId);
            return ResponseEntity.ok("채팅방이 비활성화되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("채팅방 비활성화 실패");
        }
    }

    // 사용자 입장 메시지
    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<?> joinChatRoom(@PathVariable Long roomId, @RequestParam String userName) {
        try {
            chatService.sendJoinMessage(roomId, userName);
            return ResponseEntity.ok("입장 메시지가 전송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("입장 메시지 전송 실패");
        }
    }

    // 사용자 퇴장 메시지
    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<?> leaveChatRoom(@PathVariable Long roomId, @RequestParam String userName) {
        try {
            chatService.sendLeaveMessage(roomId, userName);
            return ResponseEntity.ok("퇴장 메시지가 전송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("퇴장 메시지 전송 실패");
        }
    }
} 
package com.auction.controller;

import com.auction.dto.PrivateMessageDto;
import com.auction.service.PrivateMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class PrivateMessageController {

    private final PrivateMessageService privateMessageService;

    public PrivateMessageController(PrivateMessageService privateMessageService) {
        this.privateMessageService = privateMessageService;
    }

    // 쪽지 전송
    @PostMapping
    public ResponseEntity<PrivateMessageDto> sendMessage(@RequestParam Long auctionId,
                                                        @RequestParam String senderId,
                                                        @RequestParam String senderName,
                                                        @RequestParam String receiverId,
                                                        @RequestParam String receiverName,
                                                        @RequestParam String subject,
                                                        @RequestParam String content) {
        try {
            PrivateMessageDto message = privateMessageService.sendMessage(auctionId, senderId, senderName,
                                                                        receiverId, receiverName, subject, content);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 받은 쪽지 목록 조회
    @GetMapping("/received/{userId}")
    public ResponseEntity<List<PrivateMessageDto>> getReceivedMessages(@PathVariable String userId) {
        try {
            List<PrivateMessageDto> messages = privateMessageService.getReceivedMessages(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 보낸 쪽지 목록 조회
    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<PrivateMessageDto>> getSentMessages(@PathVariable String userId) {
        try {
            List<PrivateMessageDto> messages = privateMessageService.getSentMessages(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 쪽지 상세 조회
    @GetMapping("/{messageId}")
    public ResponseEntity<PrivateMessageDto> getMessage(@PathVariable Long messageId) {
        try {
            PrivateMessageDto message = privateMessageService.getMessage(messageId);
            if (message != null) {
                return ResponseEntity.ok(message);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 쪽지 읽음 처리
    @PutMapping("/{messageId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        try {
            privateMessageService.markAsRead(messageId);
            return ResponseEntity.ok("쪽지가 읽음 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("읽음 처리 실패");
        }
    }

    // 읽지 않은 쪽지 수 조회
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@PathVariable String userId) {
        try {
            int count = privateMessageService.getUnreadCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(0);
        }
    }

    // 쪽지 삭제
    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        try {
            privateMessageService.deleteMessage(messageId);
            return ResponseEntity.ok("쪽지가 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("쪽지 삭제 실패");
        }
    }

    // 경매별 쪽지 목록 조회
    @GetMapping("/auction/{auctionId}/user/{userId}")
    public ResponseEntity<List<PrivateMessageDto>> getMessagesByAuction(@PathVariable Long auctionId,
                                                                       @PathVariable String userId) {
        try {
            List<PrivateMessageDto> messages = privateMessageService.getMessagesByAuction(auctionId, userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
} 
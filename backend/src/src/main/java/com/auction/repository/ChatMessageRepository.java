package com.auction.repository;

import com.auction.dto.ChatMessageDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class ChatMessageRepository {

    private final JdbcTemplate jdbcTemplate;

    public ChatMessageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 메시지 저장
    public void save(ChatMessageDto dto) {
        String sql = "INSERT INTO chat_messages (room_id, sender_id, sender_name, message, message_type, created_at, is_deleted) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                dto.getRoomId(),
                dto.getSenderId(),
                dto.getSenderName(),
                dto.getMessage(),
                dto.getMessageType(),
                Timestamp.valueOf(dto.getCreatedAt()),
                dto.isDeleted() ? 1 : 0
        );
    }

    // 채팅방 메시지 목록 조회
    public List<ChatMessageDto> findByRoomId(Long roomId, int limit) {
        String sql = "SELECT * FROM chat_messages WHERE room_id = ? AND is_deleted = 0 " +
                "ORDER BY created_at DESC LIMIT ?";
        List<ChatMessageDto> messages = jdbcTemplate.query(sql, (rs, rowNum) -> {
            ChatMessageDto dto = new ChatMessageDto();
            dto.setId(rs.getLong("id"));
            dto.setRoomId(rs.getLong("room_id"));
            dto.setSenderId(rs.getString("sender_id"));
            dto.setSenderName(rs.getString("sender_name"));
            dto.setMessage(rs.getString("message"));
            dto.setMessageType(rs.getString("message_type"));
            dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            dto.setDeleted(rs.getBoolean("is_deleted"));
            return dto;
        }, roomId, limit);
        
        // 최신 메시지가 아래에 오도록 역순으로 정렬
        java.util.Collections.reverse(messages);
        return messages;
    }

    // 채팅방 메시지 목록 조회 (전체)
    public List<ChatMessageDto> findByRoomId(Long roomId) {
        return findByRoomId(roomId, 100);
    }

    // 메시지 삭제 (소프트 삭제)
    public void delete(Long messageId) {
        String sql = "UPDATE chat_messages SET is_deleted = 1 WHERE id = ?";
        jdbcTemplate.update(sql, messageId);
    }

    // 사용자별 메시지 수 조회
    public int countBySenderId(String senderId) {
        String sql = "SELECT COUNT(*) FROM chat_messages WHERE sender_id = ? AND is_deleted = 0";
        return jdbcTemplate.queryForObject(sql, Integer.class, senderId);
    }
} 
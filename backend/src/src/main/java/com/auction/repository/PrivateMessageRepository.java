package com.auction.repository;

import com.auction.dto.PrivateMessageDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class PrivateMessageRepository {

    private final JdbcTemplate jdbcTemplate;

    public PrivateMessageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 쪽지 저장
    public void save(PrivateMessageDto dto) {
        String sql = "INSERT INTO private_messages (auction_id, sender_id, sender_name, receiver_id, receiver_name, " +
                "subject, content, is_read, created_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                dto.getAuctionId(),
                dto.getSenderId(),
                dto.getSenderName(),
                dto.getReceiverId(),
                dto.getReceiverName(),
                dto.getSubject(),
                dto.getContent(),
                dto.isRead() ? 1 : 0,
                Timestamp.valueOf(dto.getCreatedAt()),
                dto.isDeleted() ? 1 : 0
        );
    }

    // 받은 쪽지 목록 조회
    public List<PrivateMessageDto> findByReceiverId(String receiverId) {
        String sql = "SELECT * FROM private_messages WHERE receiver_id = ? AND is_deleted = 0 " +
                "ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            PrivateMessageDto dto = new PrivateMessageDto();
            dto.setId(rs.getLong("id"));
            dto.setAuctionId(rs.getLong("auction_id"));
            dto.setSenderId(rs.getString("sender_id"));
            dto.setSenderName(rs.getString("sender_name"));
            dto.setReceiverId(rs.getString("receiver_id"));
            dto.setReceiverName(rs.getString("receiver_name"));
            dto.setSubject(rs.getString("subject"));
            dto.setContent(rs.getString("content"));
            dto.setRead(rs.getBoolean("is_read"));
            dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            dto.setDeleted(rs.getBoolean("is_deleted"));
            return dto;
        }, receiverId);
    }

    // 보낸 쪽지 목록 조회
    public List<PrivateMessageDto> findBySenderId(String senderId) {
        String sql = "SELECT * FROM private_messages WHERE sender_id = ? AND is_deleted = 0 " +
                "ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            PrivateMessageDto dto = new PrivateMessageDto();
            dto.setId(rs.getLong("id"));
            dto.setAuctionId(rs.getLong("auction_id"));
            dto.setSenderId(rs.getString("sender_id"));
            dto.setSenderName(rs.getString("sender_name"));
            dto.setReceiverId(rs.getString("receiver_id"));
            dto.setReceiverName(rs.getString("receiver_name"));
            dto.setSubject(rs.getString("subject"));
            dto.setContent(rs.getString("content"));
            dto.setRead(rs.getBoolean("is_read"));
            dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            dto.setDeleted(rs.getBoolean("is_deleted"));
            return dto;
        }, senderId);
    }

    // 쪽지 상세 조회
    public PrivateMessageDto findById(Long messageId) {
        String sql = "SELECT * FROM private_messages WHERE id = ? AND is_deleted = 0";
        List<PrivateMessageDto> messages = jdbcTemplate.query(sql, (rs, rowNum) -> {
            PrivateMessageDto dto = new PrivateMessageDto();
            dto.setId(rs.getLong("id"));
            dto.setAuctionId(rs.getLong("auction_id"));
            dto.setSenderId(rs.getString("sender_id"));
            dto.setSenderName(rs.getString("sender_name"));
            dto.setReceiverId(rs.getString("receiver_id"));
            dto.setReceiverName(rs.getString("receiver_name"));
            dto.setSubject(rs.getString("subject"));
            dto.setContent(rs.getString("content"));
            dto.setRead(rs.getBoolean("is_read"));
            dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            dto.setDeleted(rs.getBoolean("is_deleted"));
            return dto;
        }, messageId);
        
        return messages.isEmpty() ? null : messages.get(0);
    }

    // 쪽지 읽음 처리
    public void markAsRead(Long messageId) {
        String sql = "UPDATE private_messages SET is_read = 1 WHERE id = ?";
        jdbcTemplate.update(sql, messageId);
    }

    // 읽지 않은 쪽지 수 조회
    public int countUnreadByReceiverId(String receiverId) {
        String sql = "SELECT COUNT(*) FROM private_messages WHERE receiver_id = ? AND is_read = 0 AND is_deleted = 0";
        return jdbcTemplate.queryForObject(sql, Integer.class, receiverId);
    }

    // 쪽지 삭제 (소프트 삭제)
    public void delete(Long messageId) {
        String sql = "UPDATE private_messages SET is_deleted = 1 WHERE id = ?";
        jdbcTemplate.update(sql, messageId);
    }
} 
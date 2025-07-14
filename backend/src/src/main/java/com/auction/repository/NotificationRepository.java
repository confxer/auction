package com.auction.repository;

import com.auction.dto.NotificationDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class NotificationRepository {

    private final JdbcTemplate jdbcTemplate;

    public NotificationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 알림 저장
    public void save(NotificationDto dto) {
        String sql = "INSERT INTO notifications (auction_id, title, user_id, type, message, is_read, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        jdbcTemplate.update(sql,
                dto.getAuctionId(),
                dto.getTitle(),
                dto.getUserId(),
                dto.getType(),
                dto.getMessage(),
                dto.isRead() ? 1 : 0,
                Timestamp.valueOf(dto.getCreatedAt())
        );
    }

    // 사용자별 알림 목록 조회
    public List<NotificationDto> findByUserId(String userId) {
        String sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            NotificationDto dto = new NotificationDto();
            dto.setId(rs.getLong("id"));
            dto.setAuctionId(rs.getLong("auction_id"));
            dto.setTitle(rs.getString("title"));
            dto.setUserId(rs.getString("user_id"));
            dto.setType(rs.getString("type"));
            dto.setMessage(rs.getString("message"));
            dto.setRead(rs.getBoolean("is_read"));
            dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return dto;
        }, userId);
    }

    // 읽지 않은 알림 수 조회
    public int countUnreadByUserId(String userId) {
        String sql = "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0";
        return jdbcTemplate.queryForObject(sql, Integer.class, userId);
    }

    // 알림 읽음 처리
    public void markAsRead(Long notificationId) {
        String sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
        jdbcTemplate.update(sql, notificationId);
    }

    // 모든 알림 읽음 처리
    public void markAllAsRead(String userId) {
        String sql = "UPDATE notifications SET is_read = 1 WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }

    // 경매별 알림 조회 (경매 마감 시 모든 입찰자에게 알림)
    public List<String> findBiddersByAuctionId(Long auctionId) {
        String sql = "SELECT DISTINCT bidder FROM bids WHERE auction_id = ?";
        return jdbcTemplate.queryForList(sql, String.class, auctionId);
    }
} 
package com.auction.repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.auction.dto.NotificationDto;
import com.auction.entity.Notification;

@Repository
public class NotificationRepository {

    private final JdbcTemplate jdbcTemplate;

    public NotificationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

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



    // ✅ Notification 엔티티 객체 저장용 오버로드 메서드 추가
public void save(Notification notification) {
    String sql = "INSERT INTO notifications (auction_id, title, user_id, type, message, is_read, created_at) " +
                 "VALUES (?, ?, ?, ?, ?, ?, ?)";
    jdbcTemplate.update(sql,
        notification.getAuctionId(),
        notification.getTitle(),
        notification.getUserId(),
        notification.getType(),
        notification.getMessage(),
        notification.isRead() ? 1 : 0,
        Timestamp.valueOf(notification.getCreatedAt())
    );
}

    public int countUnreadByUserId(String userId) {
        return jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0",
            Integer.class, userId
        );
    }

    public void markAsRead(Long notificationId) {
        jdbcTemplate.update("UPDATE notifications SET is_read = 1 WHERE id = ?", notificationId);
    }

    public void markAllAsRead(String userId) {
        jdbcTemplate.update("UPDATE notifications SET is_read = 1 WHERE user_id = ?", userId);
    }

    public List<String> findBiddersByAuctionId(Long auctionId) {
        return jdbcTemplate.queryForList("SELECT DISTINCT bidder FROM bids WHERE auction_id = ?", String.class, auctionId);
    }

    public List<Notification> findByUserId(String userId) {
        String sql = "SELECT id, auction_id, title, user_id, type, message, is_read, created_at " +
                     "FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Notification notification = new Notification();
            notification.setId(rs.getLong("id"));
            notification.setAuctionId(rs.getLong("auction_id"));
            notification.setTitle(rs.getString("title"));
            notification.setUserId(rs.getString("user_id"));
            notification.setType(rs.getString("type"));
            notification.setMessage(rs.getString("message"));
            notification.setRead(rs.getBoolean("is_read"));
            notification.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return notification;
        }, userId);
    }

    public List<Notification> findSeller(Long id) {
        String sql = "SELECT a.user_id as seller_id, n.* FROM notifications n JOIN auctions a ON n.auction_id = a.id where seller_id = ?";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Notification notification = new Notification();
            notification.setId(rs.getLong("id"));
            notification.setAuctionId(rs.getLong("auction_id"));
            notification.setTitle(rs.getString("title"));
            notification.setUserId(rs.getString("user_id"));
            notification.setSellerId(rs.getLong("seller_id"));
            notification.setType(rs.getString("type"));
            notification.setMessage(rs.getString("message"));
            notification.setRead(rs.getBoolean("is_read"));
            notification.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return notification;
        }, id);
    }
}
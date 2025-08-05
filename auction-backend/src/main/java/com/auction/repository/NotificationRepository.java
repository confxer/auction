package com.auction.repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.auction.dto.NotificationDto;
import com.auction.entity.Notification;

@Repository
public class NotificationRepository {

    private final JdbcTemplate jdbcTemplate;

    public NotificationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ✅ DTO 기반 저장
    public void save(NotificationDto dto) {
        String sql = "INSERT INTO notifications (auction_id, title, user_id, type, message, is_read, created_at, seller_id) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
            dto.getAuctionId(),
            dto.getTitle(),
            dto.getUserId(),
            dto.getType(),
            dto.getMessage(),
            dto.getIsRead(),
            Timestamp.valueOf(dto.getCreatedAt()),
            dto.getSellerId()
        );
    }

    // ✅ Entity 기반 저장 + KeyHolder 반환
    public Notification save(Notification notification) {
        String sql = "INSERT INTO notifications (auction_id, title, user_id, type, message, is_read, created_at, seller_id) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setObject(1, notification.getAuctionId());
            ps.setString(2, notification.getTitle());
            ps.setString(3, notification.getUserId());
            ps.setString(4, notification.getType());
            ps.setString(5, notification.getMessage());
            ps.setInt(6, notification.getIsRead());
            ps.setTimestamp(7, Timestamp.valueOf(notification.getCreatedAt()));
            ps.setObject(8, notification.getSellerId());  // seller_id는 NULL 가능
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            notification.setId(keyHolder.getKey().longValue());
        } else {
            System.err.println("⚠️ Warning: No key generated for notification");
        }
        return notification;
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
        return jdbcTemplate.queryForList(
            "SELECT DISTINCT bidder FROM bids WHERE auction_id = ?", String.class, auctionId
        );
    }

    public List<Notification> findByUserId(String userId) {
        String sql = "SELECT id, auction_id, title, user_id, type, message, is_read, created_at, seller_id " +
                     "FROM notifications WHERE user_id = ? ORDER BY created_at DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Notification notification = new Notification();
            notification.setId(rs.getLong("id"));
            notification.setAuctionId(rs.getLong("auction_id"));
            notification.setTitle(rs.getString("title"));
            notification.setUserId(rs.getString("user_id"));
            notification.setType(rs.getString("type"));
            notification.setMessage(rs.getString("message"));
            notification.setIsRead(rs.getInt("is_read"));
            notification.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            notification.setSellerId(rs.getObject("seller_id") != null ? rs.getLong("seller_id") : null);
            return notification;
        }, userId);
    }

    public List<Notification> findSeller(Long id) {
        String sql = "SELECT a.user_id as seller_id, n.* FROM notifications n " +
                     "JOIN auctions a ON n.auction_id = a.id WHERE seller_id = ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Notification notification = new Notification();
            notification.setId(rs.getLong("id"));
            notification.setAuctionId(rs.getLong("auction_id"));
            notification.setTitle(rs.getString("title"));
            notification.setUserId(rs.getString("user_id"));
            notification.setType(rs.getString("type"));
            notification.setMessage(rs.getString("message"));
            notification.setIsRead(rs.getInt("is_read"));
            notification.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            notification.setSellerId(rs.getObject("seller_id") != null ? rs.getLong("seller_id") : null);
            return notification;
        }, id);
    }

    public Notification findById(Long id) {
        String sql = "SELECT * FROM notifications WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new Object[]{id}, (rs, rowNum) -> {
                Notification notification = new Notification();
                notification.setId(rs.getLong("id"));
                notification.setAuctionId(rs.getLong("auction_id"));
                notification.setTitle(rs.getString("title"));
                notification.setUserId(rs.getString("user_id"));
                notification.setSellerId(rs.getObject("seller_id") != null ? rs.getLong("seller_id") : null);
                notification.setType(rs.getString("type"));
                notification.setMessage(rs.getString("message"));
                notification.setIsRead(rs.getInt("is_read"));
                notification.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                return notification;
            });
        } catch (Exception e) {
            return null;
        }
    }
}

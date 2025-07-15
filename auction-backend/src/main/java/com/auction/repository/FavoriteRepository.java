package com.auction.repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.auction.dto.FavoriteDto;

@Repository
public class FavoriteRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    // 좋아요 추가
    public void addFavorite(Long auctionId, String userId) {
        String sql = "INSERT INTO favorites (auction_id, user_id, created_at) VALUES (?, ?, NOW())";
        jdbcTemplate.update(sql, auctionId, userId);
    }
    
    // 좋아요 제거
    public void removeFavorite(Long auctionId, String userId) {
        String sql = "DELETE FROM favorites WHERE auction_id = ? AND user_id = ?";
        jdbcTemplate.update(sql, auctionId, userId);
    }
    
    // 사용자의 좋아요 목록 조회 (경매 정보 포함)
    public List<FavoriteDto> getUserFavorites(String userId) {
        String sql = """
            SELECT f.id, f.auction_id, f.user_id, f.created_at,
                   a.title as auction_title, a.image_url1 as auction_image_url,
                   a.start_price as auction_start_price, a.highest_bid as auction_highest_bid,
                   a.end_time as auction_end_time, a.category as auction_category
            FROM favorites f
            JOIN auction a ON f.auction_id = a.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            FavoriteDto favorite = new FavoriteDto();
            favorite.setId(rs.getLong("id"));
            favorite.setAuctionId(rs.getLong("auction_id"));
            favorite.setUserId(rs.getString("user_id"));
            favorite.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            favorite.setAuctionTitle(rs.getString("auction_title"));
            favorite.setAuctionImageUrl(rs.getString("auction_image_url"));
            favorite.setAuctionStartPrice(rs.getInt("auction_start_price"));
            favorite.setAuctionHighestBid(rs.getInt("auction_highest_bid"));
            favorite.setAuctionEndTime(rs.getTimestamp("auction_end_time").toLocalDateTime());
            favorite.setAuctionCategory(rs.getString("auction_category"));
            return favorite;
        }, userId);
    }
    
    // 특정 경매에 대한 좋아요 여부 확인
    public boolean isFavorited(Long auctionId, String userId) {
        String sql = "SELECT COUNT(*) FROM favorites WHERE auction_id = ? AND user_id = ?";
        int count = jdbcTemplate.queryForObject(sql, Integer.class, auctionId, userId);
        return count > 0;
    }
    
    // 사용자의 좋아요 수 조회
    public int getUserFavoriteCount(String userId) {
        String sql = "SELECT COUNT(*) FROM favorites WHERE user_id = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, userId);
    }
    
    // 경매의 좋아요 수 조회
    public int getAuctionFavoriteCount(Long auctionId) {
        String sql = "SELECT COUNT(*) FROM favorites WHERE auction_id = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, auctionId);
    }
    
    // 마감 30분 전인 좋아요 경매 조회 (알림용)
    public List<FavoriteDto> getFavoritesEndingSoon(String userId) {
        String sql = """
            SELECT f.id, f.auction_id, f.user_id, f.created_at,
                   a.title as auction_title, a.image_url1 as auction_image_url,
                   a.start_price as auction_start_price, a.highest_bid as auction_highest_bid,
                   a.end_time as auction_end_time, a.category as auction_category
            FROM favorites f
            JOIN auction a ON f.auction_id = a.id
            WHERE f.user_id = ? 
            AND a.end_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 MINUTE)
            AND a.is_closed = false
            ORDER BY a.end_time ASC
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            FavoriteDto favorite = new FavoriteDto();
            favorite.setId(rs.getLong("id"));
            favorite.setAuctionId(rs.getLong("auction_id"));
            favorite.setUserId(rs.getString("user_id"));
            favorite.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            favorite.setAuctionTitle(rs.getString("auction_title"));
            favorite.setAuctionImageUrl(rs.getString("auction_image_url"));
            favorite.setAuctionStartPrice(rs.getInt("auction_start_price"));
            favorite.setAuctionHighestBid(rs.getInt("auction_highest_bid"));
            favorite.setAuctionEndTime(rs.getTimestamp("auction_end_time").toLocalDateTime());
            favorite.setAuctionCategory(rs.getString("auction_category"));
            return favorite;
        }, userId);
    }
} 
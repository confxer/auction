package com.auction.repository;

import com.auction.dto.AutoBidDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class AutoBidRepository {
    private final JdbcTemplate jdbcTemplate;

    public AutoBidRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 자동입찰 등록/갱신
    public void saveOrUpdate(AutoBidDto dto) {
        String sql = "REPLACE INTO auto_bids (auction_id, user_id, max_amount, created_at) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, dto.getAuctionId(), dto.getUserId(), dto.getMaxAmount(), Timestamp.valueOf(dto.getCreatedAt()));
    }

    // 경매별 자동입찰자 목록
    public List<AutoBidDto> findByAuctionId(Long auctionId) {
        String sql = "SELECT * FROM auto_bids WHERE auction_id = ? ORDER BY max_amount DESC, created_at ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AutoBidDto dto = new AutoBidDto();
            dto.setAuctionId(rs.getLong("auction_id"));
            dto.setUserId(rs.getString("user_id"));
            dto.setMaxAmount(rs.getInt("max_amount"));
            dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return dto;
        }, auctionId);
    }

    // 자동입찰 삭제
    public void delete(Long auctionId, String userId) {
        String sql = "DELETE FROM auto_bids WHERE auction_id = ? AND user_id = ?";
        jdbcTemplate.update(sql, auctionId, userId);
    }
} 
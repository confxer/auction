package com.auction.repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.auction.dto.BidDto;

@Repository
public class BidRepository {
    private final JdbcTemplate jdbcTemplate;

    public BidRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(BidDto bid) {
        String sql = "INSERT INTO bids (auction_id, bidder, bid_amount, bid_time) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, bid.getAuctionId(), bid.getBidder(), bid.getBidAmount(), Timestamp.valueOf(bid.getBidTime()));
    }

    public List<BidDto> findByAuctionId(Long auctionId) {
        String sql = "SELECT * FROM bids WHERE auction_id = ? ORDER BY bid_amount DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            BidDto bid = new BidDto();
            bid.setId(rs.getLong("id"));
            bid.setAuctionId(rs.getLong("auction_id"));
            bid.setBidder(rs.getString("bidder"));
            bid.setBidAmount(rs.getLong("bid_amount"));
            bid.setBidTime(rs.getTimestamp("bid_time").toLocalDateTime());
            bid.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return bid;
        }, auctionId);
    }

    public List<BidDto> findByUserId(Long userId) {
        String sql = "SELECT * FROM bids WHERE bidder = ? ORDER BY bid_time DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            BidDto bid = new BidDto();
            bid.setId(rs.getLong("id"));
            bid.setAuctionId(rs.getLong("auction_id"));
            bid.setBidder(rs.getString("bidder"));
            bid.setBidAmount(rs.getLong("bid_amount"));
            bid.setBidTime(rs.getTimestamp("bid_time").toLocalDateTime());
            bid.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return bid;
        }, userId);
    }

    public Long findHighestBidByAuctionId(Long auctionId) {
        String sql = "SELECT COALESCE(MAX(bid_amount), 0) FROM bids WHERE auction_id = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, auctionId);
    }

    // ✅ 최고 입찰자 username 조회 메서드
    public String findTopBidderByAuctionId(Long auctionId) {
        String sql = "SELECT bidder FROM bids WHERE auction_id = ? ORDER BY bid_amount DESC LIMIT 1";
        List<String> results = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("bidder"), auctionId);
        return results.isEmpty() ? null : results.get(0);
    }
}

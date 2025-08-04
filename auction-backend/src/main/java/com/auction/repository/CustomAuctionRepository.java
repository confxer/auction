package com.auction.repository;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.auction.mapper.AuctionRowMapper;
import com.auction.dto.AuctionDto;

@Repository
public class CustomAuctionRepository {

    private final JdbcTemplate jdbcTemplate;

    public CustomAuctionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AuctionDto> findByUserId(String userId) {
        String sql = "SELECT a.*, u.username as seller FROM auction a LEFT JOIN users u ON a.user_id = u.id WHERE a.user_id = ?";
        return jdbcTemplate.query(sql, new Object[] { userId }, new AuctionRowMapper());
    }

    public String getBuyerNickname(Long buyerId) {
        String sql = "SELECT nickname FROM users WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[] { buyerId }, String.class);
    }
}

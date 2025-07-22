package com.auction.repository;

import com.auction.entity.Report;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class ReportRepository {
    private final JdbcTemplate jdbcTemplate;

    public ReportRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(Report report) {
        String sql = "INSERT INTO reports (auction_id, reporter, reason, status) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, report.getAuctionId(), report.getReporter(), report.getReason(), report.getStatus());
    }

    public List<Report> findAll() {
        String sql = "SELECT * FROM reports ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Report r = new Report();
            r.setId(rs.getLong("id"));
            r.setAuctionId(rs.getLong("auction_id"));
            r.setReporter(rs.getString("reporter"));
            r.setReason(rs.getString("reason"));
            r.setStatus(rs.getString("status"));
            r.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return r;
        });
    }

    public void updateStatus(Long id, String status) {
        String sql = "UPDATE reports SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, id);
    }
}

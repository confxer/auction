package com.auction.repository;

import com.auction.dto.CommentDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class CommentRepository {
    private final JdbcTemplate jdbcTemplate;

    public CommentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 댓글 등록
    public void save(CommentDto comment) {
        String sql = "INSERT INTO comments (auction_id, user_id, author, content, created_at, updated_at, is_deleted) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)";

        jdbcTemplate.update(sql,
                comment.getAuctionId(),
                comment.getUserId(),
                comment.getAuthor(),
                comment.getContent(),
                Timestamp.valueOf(comment.getCreatedAt()),
                Timestamp.valueOf(comment.getUpdatedAt()),
                comment.isDeleted() ? 1 : 0
        );
    }

    // 경매별 댓글 목록 조회 (삭제되지 않은 것만, 최신순)
    public List<CommentDto> findByAuctionId(Long auctionId) {
        String sql = "SELECT * FROM comments WHERE auction_id = ? AND is_deleted = FALSE ORDER BY created_at DESC";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            CommentDto comment = new CommentDto();
            comment.setId(rs.getLong("id"));
            comment.setAuctionId(rs.getLong("auction_id"));
            comment.setUserId(rs.getObject("user_id") == null ? null : rs.getLong("user_id"));
            comment.setAuthor(rs.getString("author"));
            comment.setContent(rs.getString("content"));
            comment.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            comment.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            comment.setDeleted(rs.getBoolean("is_deleted"));
            return comment;
        }, auctionId);
    }

    // 댓글 단일 조회
    public CommentDto findById(Long id) {
        String sql = "SELECT * FROM comments WHERE id = ? AND is_deleted = FALSE";
        
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                CommentDto comment = new CommentDto();
                comment.setId(rs.getLong("id"));
                comment.setAuctionId(rs.getLong("auction_id"));
                comment.setUserId(rs.getObject("user_id") == null ? null : rs.getLong("user_id"));
                comment.setAuthor(rs.getString("author"));
                comment.setContent(rs.getString("content"));
                comment.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                comment.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
                comment.setDeleted(rs.getBoolean("is_deleted"));
                return comment;
            }, id);
        } catch (Exception e) {
            return null;
        }
    }

    // 댓글 수정
    public void update(Long id, CommentDto comment) {
        String sql = "UPDATE comments SET content = ?, updated_at = ? WHERE id = ? AND is_deleted = FALSE";
        
        jdbcTemplate.update(sql,
                comment.getContent(),
                Timestamp.valueOf(comment.getUpdatedAt()),
                id
        );
    }

    // 댓글 삭제 (소프트 삭제)
    public void delete(Long id) {
        String sql = "UPDATE comments SET is_deleted = TRUE, updated_at = ? WHERE id = ?";
        
        jdbcTemplate.update(sql,
                Timestamp.valueOf(java.time.LocalDateTime.now()),
                id
        );
    }

    // 경매별 댓글 수 조회
    public int countByAuctionId(Long auctionId) {
        String sql = "SELECT COUNT(*) FROM comments WHERE auction_id = ? AND is_deleted = FALSE";
        return jdbcTemplate.queryForObject(sql, Integer.class, auctionId);
    }

    // 전체 댓글 수 조회
    public int countAll() {
        String sql = "SELECT COUNT(*) FROM comments WHERE is_deleted = FALSE";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }
} 
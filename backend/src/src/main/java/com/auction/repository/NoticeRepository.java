package com.auction.repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.auction.dto.NoticeDto;

@Repository
public class NoticeRepository {
    private final JdbcTemplate jdbcTemplate;

    public NoticeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(NoticeDto dto) {
        String sql = "INSERT INTO notice (title, content, category, status, is_important, views, author, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, 
            dto.getTitle(), 
            dto.getContent(), 
            dto.getCategory(),
            dto.getStatus(),
            dto.isImportant(),
            dto.getViews(),
            dto.getAuthor(),
            Timestamp.valueOf(dto.getCreatedAt())
        );
    }

    public List<NoticeDto> findAll() {
        String sql = "SELECT * FROM notice ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public List<NoticeDto> findByCategory(String category) {
        String sql = "SELECT * FROM notice WHERE category = ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, category);
    }

    public List<NoticeDto> findByStatus(String status) {
        String sql = "SELECT * FROM notice WHERE status = ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, status);
    }

    public List<NoticeDto> findByTitleContaining(String searchTerm) {
        String sql = "SELECT * FROM notice WHERE title LIKE ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, "%" + searchTerm + "%");
    }

    public List<NoticeDto> findPublishedNotices() {
        String sql = "SELECT * FROM notice WHERE status = 'published' ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public NoticeDto findById(Long id) {
        String sql = "SELECT * FROM notice WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, this::mapRowToDto, id);
    }

    public void update(NoticeDto dto) {
        String sql = "UPDATE notice SET title = ?, content = ?, category = ?, status = ?, is_important = ?, author = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, 
            dto.getTitle(), 
            dto.getContent(),
            dto.getCategory(),
            dto.getStatus(),
            dto.isImportant(),
            dto.getAuthor(),
            Timestamp.valueOf(dto.getUpdatedAt()), 
            dto.getId()
        );
    }

    public void incrementViews(Long id) {
        String sql = "UPDATE notice SET views = views + 1 WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void delete(Long id) {
        String sql = "DELETE FROM notice WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public long countByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM notice WHERE status = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, status);
    }

    public long countByCategory(String category) {
        String sql = "SELECT COUNT(*) FROM notice WHERE category = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, category);
    }

    public long countImportantNotices() {
        String sql = "SELECT COUNT(*) FROM notice WHERE is_important = true";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    public long getTotalViews() {
        String sql = "SELECT COALESCE(SUM(views), 0) FROM notice";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    private NoticeDto mapRowToDto(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        NoticeDto dto = new NoticeDto();
        dto.setId(rs.getLong("id"));
        dto.setTitle(rs.getString("title"));
        dto.setContent(rs.getString("content"));
        dto.setCategory(rs.getString("category"));
        dto.setStatus(rs.getString("status"));
        dto.setImportant(rs.getBoolean("is_important"));
        dto.setViews(rs.getInt("views"));
        dto.setAuthor(rs.getString("author"));
        dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        dto.setUpdatedAt(rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toLocalDateTime() : null);
        return dto;
    }
} 
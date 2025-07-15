package com.auction.repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.auction.dto.FAQDto;

@Repository
public class FAQRepository {
    private final JdbcTemplate jdbcTemplate;

    public FAQRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(FAQDto dto) {
        String sql = "INSERT INTO faq (question, answer, category, status, is_important, views, author, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, 
            dto.getQuestion(), 
            dto.getAnswer(), 
            dto.getCategory(),
            dto.getStatus(),
            dto.isImportant(),
            dto.getViews(),
            dto.getAuthor(),
            Timestamp.valueOf(dto.getCreatedAt())
        );
    }

    public List<FAQDto> findAll() {
        String sql = "SELECT * FROM faq ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public List<FAQDto> findByCategory(String category) {
        String sql = "SELECT * FROM faq WHERE category = ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, category);
    }

    public List<FAQDto> findByStatus(String status) {
        String sql = "SELECT * FROM faq WHERE status = ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, status);
    }

    public List<FAQDto> findByQuestionContaining(String searchTerm) {
        String sql = "SELECT * FROM faq WHERE question LIKE ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, "%" + searchTerm + "%");
    }

    public List<FAQDto> findPublishedFAQs() {
        String sql = "SELECT * FROM faq WHERE status = 'published' ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public FAQDto findById(Long id) {
        String sql = "SELECT * FROM faq WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, this::mapRowToDto, id);
    }

    public void update(FAQDto dto) {
        String sql = "UPDATE faq SET question = ?, answer = ?, category = ?, status = ?, is_important = ?, author = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, 
            dto.getQuestion(), 
            dto.getAnswer(),
            dto.getCategory(),
            dto.getStatus(),
            dto.isImportant(),
            dto.getAuthor(),
            Timestamp.valueOf(dto.getUpdatedAt()), 
            dto.getId()
        );
    }

    public void incrementViews(Long id) {
        String sql = "UPDATE faq SET views = views + 1 WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void delete(Long id) {
        String sql = "DELETE FROM faq WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public long countByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM faq WHERE status = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, status);
    }

    public long countByCategory(String category) {
        String sql = "SELECT COUNT(*) FROM faq WHERE category = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, category);
    }

    public long countImportantFAQs() {
        String sql = "SELECT COUNT(*) FROM faq WHERE is_important = true";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    public long getTotalViews() {
        String sql = "SELECT COALESCE(SUM(views), 0) FROM faq";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    private FAQDto mapRowToDto(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        FAQDto dto = new FAQDto();
        dto.setId(rs.getLong("id"));
        dto.setQuestion(rs.getString("question"));
        dto.setAnswer(rs.getString("answer"));
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
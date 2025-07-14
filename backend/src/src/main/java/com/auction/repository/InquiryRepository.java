package com.auction.repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.auction.dto.InquiryDto;

@Repository
public class InquiryRepository {
    private final JdbcTemplate jdbcTemplate;

    public InquiryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(InquiryDto dto) {
        String sql = "INSERT INTO inquiry (user_id, user_name, title, content, category, status, priority, attachment_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, 
            dto.getUserId(), 
            dto.getUserName(),
            dto.getTitle(), 
            dto.getContent(), 
            dto.getCategory(),
            dto.getStatus() != null ? dto.getStatus() : "pending",
            dto.getPriority() != null ? dto.getPriority() : "normal",
            dto.getAttachmentUrl(),
            Timestamp.valueOf(dto.getCreatedAt())
        );
    }

    public List<InquiryDto> findAll() {
        String sql = "SELECT * FROM inquiry ORDER BY priority DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public List<InquiryDto> findByUserId(String userId) {
        String sql = "SELECT * FROM inquiry WHERE user_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, userId);
    }

    public List<InquiryDto> findByCategory(String category) {
        String sql = "SELECT * FROM inquiry WHERE category = ? ORDER BY priority DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, category);
    }

    public List<InquiryDto> findByStatus(String status) {
        String sql = "SELECT * FROM inquiry WHERE status = ? ORDER BY priority DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, status);
    }

    public List<InquiryDto> findByPriority(String priority) {
        String sql = "SELECT * FROM inquiry WHERE priority = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, priority);
    }

    public List<InquiryDto> findByTitleContaining(String searchTerm) {
        String sql = "SELECT * FROM inquiry WHERE title LIKE ? ORDER BY priority DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, "%" + searchTerm + "%");
    }

    public List<InquiryDto> findByContentContaining(String searchTerm) {
        String sql = "SELECT * FROM inquiry WHERE content LIKE ? ORDER BY priority DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, "%" + searchTerm + "%");
    }

    public List<InquiryDto> findPendingInquiries() {
        String sql = "SELECT * FROM inquiry WHERE status = 'pending' ORDER BY priority DESC, created_at ASC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public List<InquiryDto> findUrgentInquiries() {
        String sql = "SELECT * FROM inquiry WHERE priority = 'urgent' ORDER BY created_at ASC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public InquiryDto findById(Long id) {
        String sql = "SELECT * FROM inquiry WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, this::mapRowToDto, id);
    }

    public void updateAnswer(Long id, String answer, String answerer) {
        String sql = "UPDATE inquiry SET answer = ?, answerer = ?, answered_at = NOW(), status = 'answered', updated_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, answer, answerer, id);
    }

    public void updateAnswerAndStatus(Long id, String answer, String status, String answerer) {
        String sql = "UPDATE inquiry SET answer = ?, status = ?, answerer = ?, answered_at = NOW(), updated_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, answer, status, answerer, id);
    }

    public void updateStatus(Long id, String status) {
        String sql = "UPDATE inquiry SET status = ?, updated_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, status, id);
    }

    public void updatePriority(Long id, String priority) {
        String sql = "UPDATE inquiry SET priority = ?, updated_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, priority, id);
    }

    public void delete(Long id) {
        String sql = "DELETE FROM inquiry WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public long countByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM inquiry WHERE status = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, status);
    }

    public long countByCategory(String category) {
        String sql = "SELECT COUNT(*) FROM inquiry WHERE category = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, category);
    }

    public long countByPriority(String priority) {
        String sql = "SELECT COUNT(*) FROM inquiry WHERE priority = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, priority);
    }

    public long countPendingInquiries() {
        String sql = "SELECT COUNT(*) FROM inquiry WHERE status = 'pending'";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    public long countUrgentInquiries() {
        String sql = "SELECT COUNT(*) FROM inquiry WHERE priority = 'urgent'";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    public double getAverageResponseTime() {
        String sql = "SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, answered_at)) FROM inquiry WHERE answered_at IS NOT NULL";
        Double result = jdbcTemplate.queryForObject(sql, Double.class);
        return result != null ? result : 0.0;
    }

    private InquiryDto mapRowToDto(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        InquiryDto dto = new InquiryDto();
        dto.setId(rs.getLong("id"));
        dto.setUserId(rs.getString("user_id"));
        dto.setUserName(rs.getString("user_name"));
        dto.setTitle(rs.getString("title"));
        dto.setContent(rs.getString("content"));
        dto.setCategory(rs.getString("category"));
        dto.setStatus(rs.getString("status"));
        dto.setPriority(rs.getString("priority"));
        dto.setAnswer(rs.getString("answer"));
        dto.setAnswerer(rs.getString("answerer"));
        dto.setAnsweredAt(rs.getTimestamp("answered_at") != null ? rs.getTimestamp("answered_at").toLocalDateTime() : null);
        dto.setAttachmentUrl(rs.getString("attachment_url"));
        dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        dto.setUpdatedAt(rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toLocalDateTime() : null);
        return dto;
    }
} 
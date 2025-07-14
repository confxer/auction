package com.auction.repository;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.auction.dto.EventDto;

@Repository
public class EventRepository {
    private final JdbcTemplate jdbcTemplate;

    public EventRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(EventDto dto) {
        String sql = "INSERT INTO event (title, content, category, status, is_important, views, author, image_url, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, 
            dto.getTitle(), 
            dto.getContent(), 
            dto.getCategory(),
            dto.getStatus(),
            dto.isImportant(),
            dto.getViews(),
            dto.getAuthor(),
            dto.getImageUrl(),
            dto.getStartDate() != null ? Date.valueOf(dto.getStartDate()) : null,
            dto.getEndDate() != null ? Date.valueOf(dto.getEndDate()) : null,
            Timestamp.valueOf(dto.getCreatedAt())
        );
    }

    public List<EventDto> findAll() {
        String sql = "SELECT * FROM event ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public List<EventDto> findByCategory(String category) {
        String sql = "SELECT * FROM event WHERE category = ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, category);
    }

    public List<EventDto> findByStatus(String status) {
        String sql = "SELECT * FROM event WHERE status = ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, status);
    }

    public List<EventDto> findByTitleContaining(String searchTerm) {
        String sql = "SELECT * FROM event WHERE title LIKE ? ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto, "%" + searchTerm + "%");
    }

    public List<EventDto> findPublishedEvents() {
        String sql = "SELECT * FROM event WHERE status = 'published' ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public List<EventDto> findOngoingEvents() {
        String sql = "SELECT * FROM event WHERE status = 'published' AND start_date <= CURDATE() AND end_date >= CURDATE() ORDER BY is_important DESC, created_at DESC";
        return jdbcTemplate.query(sql, this::mapRowToDto);
    }

    public EventDto findById(Long id) {
        String sql = "SELECT * FROM event WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, this::mapRowToDto, id);
    }

    public void update(EventDto dto) {
        String sql = "UPDATE event SET title = ?, content = ?, category = ?, status = ?, is_important = ?, author = ?, image_url = ?, start_date = ?, end_date = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, 
            dto.getTitle(), 
            dto.getContent(),
            dto.getCategory(),
            dto.getStatus(),
            dto.isImportant(),
            dto.getAuthor(),
            dto.getImageUrl(),
            dto.getStartDate() != null ? Date.valueOf(dto.getStartDate()) : null,
            dto.getEndDate() != null ? Date.valueOf(dto.getEndDate()) : null,
            Timestamp.valueOf(dto.getUpdatedAt()), 
            dto.getId()
        );
    }

    public void incrementViews(Long id) {
        String sql = "UPDATE event SET views = views + 1 WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void delete(Long id) {
        String sql = "DELETE FROM event WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public long countByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM event WHERE status = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, status);
    }

    public long countByCategory(String category) {
        String sql = "SELECT COUNT(*) FROM event WHERE category = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, category);
    }

    public long countImportantEvents() {
        String sql = "SELECT COUNT(*) FROM event WHERE is_important = true";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    public long getTotalViews() {
        String sql = "SELECT COALESCE(SUM(views), 0) FROM event";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    private EventDto mapRowToDto(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        EventDto dto = new EventDto();
        dto.setId(rs.getLong("id"));
        dto.setTitle(rs.getString("title"));
        dto.setContent(rs.getString("content"));
        dto.setCategory(rs.getString("category"));
        dto.setStatus(rs.getString("status"));
        dto.setImportant(rs.getBoolean("is_important"));
        dto.setViews(rs.getInt("views"));
        dto.setAuthor(rs.getString("author"));
        dto.setImageUrl(rs.getString("image_url"));
        dto.setStartDate(rs.getDate("start_date") != null ? rs.getDate("start_date").toLocalDate() : null);
        dto.setEndDate(rs.getDate("end_date") != null ? rs.getDate("end_date").toLocalDate() : null);
        dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        dto.setUpdatedAt(rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toLocalDateTime() : null);
        return dto;
    }
} 
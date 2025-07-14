package com.auction.repository;

import com.auction.dto.ChatRoomDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class ChatRoomRepository {

    private final JdbcTemplate jdbcTemplate;

    public ChatRoomRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 채팅방 생성
    public void save(ChatRoomDto dto) {
        String sql = "INSERT INTO chat_rooms (auction_id, room_name, created_at, is_active) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                dto.getAuctionId(),
                dto.getRoomName(),
                Timestamp.valueOf(dto.getCreatedAt()),
                dto.isActive() ? 1 : 0
        );
    }

    // 경매별 채팅방 조회
    public ChatRoomDto findByAuctionId(Long auctionId) {
        String sql = "SELECT * FROM chat_rooms WHERE auction_id = ? AND is_active = 1";
        List<ChatRoomDto> rooms = jdbcTemplate.query(sql, (rs, rowNum) -> {
            ChatRoomDto dto = new ChatRoomDto();
            dto.setId(rs.getLong("id"));
            dto.setAuctionId(rs.getLong("auction_id"));
            dto.setRoomName(rs.getString("room_name"));
            dto.setActive(rs.getBoolean("is_active"));
            dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return dto;
        }, auctionId);
        
        return rooms.isEmpty() ? null : rooms.get(0);
    }

    // 사용자가 참여한 채팅방 목록 조회
    public List<ChatRoomDto> findByUserId(String userId) {
        String sql = """
            SELECT cr.*, 
                   COUNT(cp.id) as participant_count,
                   (SELECT COUNT(*) FROM chat_messages cm 
                    WHERE cm.room_id = cr.id 
                    AND cm.created_at > COALESCE(cp2.last_read_at, '1970-01-01')
                    AND cm.sender_id != ?) as unread_count
            FROM chat_rooms cr
            JOIN chat_participants cp ON cr.id = cp.room_id
            LEFT JOIN chat_participants cp2 ON cr.id = cp2.room_id AND cp2.user_id = ?
            WHERE cp.user_id = ? AND cr.is_active = 1
            GROUP BY cr.id
            ORDER BY cr.created_at DESC
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            ChatRoomDto dto = new ChatRoomDto();
            dto.setId(rs.getLong("id"));
            dto.setAuctionId(rs.getLong("auction_id"));
            dto.setRoomName(rs.getString("room_name"));
            dto.setActive(rs.getBoolean("is_active"));
            dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            dto.setParticipantCount(rs.getInt("participant_count"));
            dto.setUnreadCount(rs.getInt("unread_count"));
            return dto;
        }, userId, userId, userId);
    }

    // 채팅방 비활성화
    public void deactivate(Long roomId) {
        String sql = "UPDATE chat_rooms SET is_active = 0 WHERE id = ?";
        jdbcTemplate.update(sql, roomId);
    }
} 
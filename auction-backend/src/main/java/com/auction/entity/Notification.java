package com.auction.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.auction.dto.NotificationDto;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = true)
    private String userId;

    @Column(name = "auction_id", nullable = true)
    private Long auctionId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "seller_id", nullable = true)
    private Long sellerId;
    
    public Notification() {}

    // ✅ 기존 생성자
    public Notification(String userId, Long auctionId, String type, String title, String message) {
        this.userId = userId;
        this.auctionId = auctionId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    // ✅ DTO 기반 생성자 추가
    public Notification(NotificationDto dto) {
        this.userId = dto.getUserId();
        this.auctionId = dto.getAuctionId();
        this.type = dto.getType();
        this.title = dto.getTitle();
        this.message = dto.getMessage();
        this.isRead = dto.isRead();
        this.createdAt = dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now();
    }

    // ✅ DTO로 변환하는 메서드도 함께 제공
    public NotificationDto toDto() {
        return NotificationDto.builder()
                .id(id)
                .userId(userId)
                .auctionId(auctionId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(isRead)
                .createdAt(createdAt)
                .build();
    }

    // Getter/Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
}

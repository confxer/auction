package com.auction.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private Long auctionId;
    private String title;
    private String userId;
    private String type; // BID, END, WIN, LOSE, BUY_NOW
    private String message;
    private int isRead; // 0 = 안 읽음, 1 = 읽음
    private Long sellerId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public NotificationDto() {}

    // Constructor without isRead parameter (defaults to unread)
    public NotificationDto(Long auctionId, String title, String userId, String type, String message, Long sellerId) {
        this(auctionId, title, userId, type, message, 0, sellerId); // Default to unread (0)
    }

    public NotificationDto(Long auctionId, String title, String userId, String type, String message, int isRead, Long sellerId) {
        this.auctionId = auctionId;
        this.title = title;
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = LocalDateTime.now();
        this.sellerId = sellerId;
    }

    // ✅ Builder 패턴
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final NotificationDto dto;

        public Builder() {
            dto = new NotificationDto();
        }

        public Builder id(Long id) {
            dto.setId(id);
            return this;
        }

        public Builder auctionId(Long auctionId) {
            dto.setAuctionId(auctionId);
            return this;
        }

        public Builder title(String title) {
            dto.setTitle(title);
            return this;
        }

        public Builder userId(String userId) {
            dto.setUserId(userId);
            return this;
        }

        public Builder type(String type) {
            dto.setType(type);
            return this;
        }

        public Builder message(String message) {
            dto.setMessage(message);
            return this;
        }

        public Builder isRead(int isRead) {
            dto.setIsRead(isRead);
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            dto.setCreatedAt(createdAt);
            return this;
        }

        public Builder sellerId(Long sellerId) {
            dto.setSellerId(sellerId);
            return this;
        }

        public NotificationDto build() {
            return dto;
        }
    }

    // ✅ Getter/Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getIsRead() {
        return isRead;
    }

    public void setIsRead(int isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }
}

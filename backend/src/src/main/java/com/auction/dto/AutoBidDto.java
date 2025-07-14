package com.auction.dto;

import java.time.LocalDateTime;

public class AutoBidDto {
    private Long auctionId;
    private String userId;
    private int maxAmount;
    private LocalDateTime createdAt;

    public AutoBidDto() {}

    public AutoBidDto(Long auctionId, String userId, int maxAmount) {
        this.auctionId = auctionId;
        this.userId = userId;
        this.maxAmount = maxAmount;
        this.createdAt = LocalDateTime.now();
    }

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getMaxAmount() { return maxAmount; }
    public void setMaxAmount(int maxAmount) { this.maxAmount = maxAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 
package com.auction.entity;

import java.time.LocalDateTime;

public class Favorite {
    private Long id;
    private Long auctionId;
    private String userId;
    private LocalDateTime createdAt;
    
    // 기본 생성자
    public Favorite() {}
    
    // 생성자
    public Favorite(Long auctionId, String userId) {
        this.auctionId = auctionId;
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
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
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 
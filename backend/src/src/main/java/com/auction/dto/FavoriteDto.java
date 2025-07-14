package com.auction.dto;

import java.time.LocalDateTime;

public class FavoriteDto {
    private Long id;
    private Long auctionId;
    private String userId;
    private LocalDateTime createdAt;
    
    // 경매 정보 (JOIN 결과)
    private String auctionTitle;
    private String auctionImageUrl;
    private Integer auctionStartPrice;
    private Integer auctionHighestBid;
    private LocalDateTime auctionEndTime;
    private String auctionCategory;
    
    // 기본 생성자
    public FavoriteDto() {}
    
    // 생성자
    public FavoriteDto(Long auctionId, String userId) {
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
    
    public String getAuctionTitle() {
        return auctionTitle;
    }
    
    public void setAuctionTitle(String auctionTitle) {
        this.auctionTitle = auctionTitle;
    }
    
    public String getAuctionImageUrl() {
        return auctionImageUrl;
    }
    
    public void setAuctionImageUrl(String auctionImageUrl) {
        this.auctionImageUrl = auctionImageUrl;
    }
    
    public Integer getAuctionStartPrice() {
        return auctionStartPrice;
    }
    
    public void setAuctionStartPrice(Integer auctionStartPrice) {
        this.auctionStartPrice = auctionStartPrice;
    }
    
    public Integer getAuctionHighestBid() {
        return auctionHighestBid;
    }
    
    public void setAuctionHighestBid(Integer auctionHighestBid) {
        this.auctionHighestBid = auctionHighestBid;
    }
    
    public LocalDateTime getAuctionEndTime() {
        return auctionEndTime;
    }
    
    public void setAuctionEndTime(LocalDateTime auctionEndTime) {
        this.auctionEndTime = auctionEndTime;
    }
    
    public String getAuctionCategory() {
        return auctionCategory;
    }
    
    public void setAuctionCategory(String auctionCategory) {
        this.auctionCategory = auctionCategory;
    }
} 
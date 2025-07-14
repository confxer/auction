package com.auction.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "auction")
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 100)
    private String brand;

    @Column(length = 500)
    private String imageUrl1;

    @Column(length = 500)
    private String imageUrl2;

    @Column(length = 500)
    private String imageUrl3;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer startPrice;

    @Column
    private Integer buyNowPrice;

    @Column(nullable = false)
    private Integer bidUnit;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Integer minBidCount;

    @Column(nullable = false)
    private Boolean autoExtend;

    @Column(nullable = false, length = 20)
    private String shippingFee;

    @Column(nullable = false, length = 20)
    private String shippingType;

    @Column(length = 200)
    private String location;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Integer highestBid;

    @Column(nullable = false)
    private Boolean isClosed;

    @Column(length = 100)
    private String winner;

    @Column(nullable = false)
    private Integer viewCount;

    @Column(nullable = false)
    private Integer bidCount;

    public Auction() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.highestBid = 0;
        this.isClosed = false;
        this.status = "신품";
        this.bidUnit = 1000;
        this.minBidCount = 1;
        this.autoExtend = false;
        this.shippingFee = "무료";
        this.shippingType = "택배";
        this.viewCount = 0;
        this.bidCount = 0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    
    public String getImageUrl1() { return imageUrl1; }
    public void setImageUrl1(String imageUrl1) { this.imageUrl1 = imageUrl1; }
    
    public String getImageUrl2() { return imageUrl2; }
    public void setImageUrl2(String imageUrl2) { this.imageUrl2 = imageUrl2; }
    
    public String getImageUrl3() { return imageUrl3; }
    public void setImageUrl3(String imageUrl3) { this.imageUrl3 = imageUrl3; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getStartPrice() { return startPrice; }
    public void setStartPrice(Integer startPrice) { this.startPrice = startPrice; }
    
    public Integer getBuyNowPrice() { return buyNowPrice; }
    public void setBuyNowPrice(Integer buyNowPrice) { this.buyNowPrice = buyNowPrice; }
    
    public Integer getBidUnit() { return bidUnit; }
    public void setBidUnit(Integer bidUnit) { this.bidUnit = bidUnit; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public Integer getMinBidCount() { return minBidCount; }
    public void setMinBidCount(Integer minBidCount) { this.minBidCount = minBidCount; }
    
    public Boolean getAutoExtend() { return autoExtend; }
    public void setAutoExtend(Boolean autoExtend) { this.autoExtend = autoExtend; }
    
    public String getShippingFee() { return shippingFee; }
    public void setShippingFee(String shippingFee) { this.shippingFee = shippingFee; }
    
    public String getShippingType() { return shippingType; }
    public void setShippingType(String shippingType) { this.shippingType = shippingType; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Integer getHighestBid() { return highestBid; }
    public void setHighestBid(Integer highestBid) { this.highestBid = highestBid; }
    
    public Boolean getIsClosed() { return isClosed; }
    public void setIsClosed(Boolean isClosed) { this.isClosed = isClosed; }
    
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    
    public Integer getBidCount() { return bidCount; }
    public void setBidCount(Integer bidCount) { this.bidCount = bidCount; }
} 
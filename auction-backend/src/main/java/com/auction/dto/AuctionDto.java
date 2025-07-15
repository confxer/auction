package com.auction.dto;

import java.time.LocalDateTime;

public class AuctionDto {
    private Long id;
    private String title;
    private String category;
    private String status;
    private String brand;
    private String imageUrl1;
    private String imageUrl2;
    private String imageUrl3;
    private String description;
    private Integer startPrice;
    private Integer buyNowPrice;
    private Integer bidUnit;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer minBidCount;
    private Boolean autoExtend;
    private String shippingFee;
    private String shippingType;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer highestBid;
    private Boolean isClosed;
    private String winner;
    private Integer viewCount;
    private Integer bidCount;

    // 프론트엔드 호환성을 위한 추가 필드들
    private String imageUrl; // imageUrl1을 대체
    private String imageBase64; // Base64 이미지 데이터
    private Long currentPrice; // highestBid를 Long으로 변환
    private LocalDateTime startAt; // startTime을 대체
    private LocalDateTime endAt; // endTime을 대체
    private Long ownerId; // null로 설정

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

    // 프론트엔드 호환성을 위한 메서드들
    public String getImageUrl() { 
        return imageUrl1 != null ? imageUrl1 : imageUrl; 
    }
    public void setImageUrl(String imageUrl) { 
        this.imageUrl = imageUrl;
        this.imageUrl1 = imageUrl;
    }
    
    public Long getCurrentPrice() { 
        return highestBid != null ? highestBid.longValue() : currentPrice; 
    }
    public void setCurrentPrice(Long currentPrice) { 
        this.currentPrice = currentPrice;
        this.highestBid = currentPrice != null ? currentPrice.intValue() : 0;
    }
    
    public LocalDateTime getStartAt() { 
        return startTime != null ? startTime : startAt; 
    }
    public void setStartAt(LocalDateTime startAt) { 
        this.startAt = startAt;
        this.startTime = startAt;
    }
    
    public LocalDateTime getEndAt() { 
        return endTime != null ? endTime : endAt; 
    }
    public void setEndAt(LocalDateTime endAt) { 
        this.endAt = endAt;
        this.endTime = endAt;
    }
    
    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
    
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    
    public boolean isClosed() { 
        return isClosed != null ? isClosed : false; 
    }
    public void setClosed(boolean closed) { 
        this.isClosed = closed; 
    }
}

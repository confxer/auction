package com.auction.dto;

import java.time.LocalDateTime;

public class BidDto {
    private Long id;
    private Long auctionId;
    private String bidder;
    private Long bidAmount;
    private LocalDateTime bidTime;
    private LocalDateTime createdAt;

    public BidDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public String getBidder() { return bidder; }
    public void setBidder(String bidder) { this.bidder = bidder; }

    public Long getBidAmount() { return bidAmount; }
    public void setBidAmount(Long bidAmount) { this.bidAmount = bidAmount; }

    public LocalDateTime getBidTime() { return bidTime; }
    public void setBidTime(LocalDateTime bidTime) { this.bidTime = bidTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

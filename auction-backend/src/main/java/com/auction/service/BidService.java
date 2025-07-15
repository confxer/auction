// com.auction.service.BidService.java
package com.auction.service;

import java.util.List;
import java.util.Map;

import com.auction.dto.BidDto;

public interface BidService {
    void saveBid(BidDto bid);
    
    BidDto createBid(BidDto bidDto);
    
    List<BidDto> getBidsByAuctionId(Long auctionId);
    
    List<BidDto> getBidsByUserId(Long userId);
    
    Map<String, Object> getBidStats(Long auctionId);
}

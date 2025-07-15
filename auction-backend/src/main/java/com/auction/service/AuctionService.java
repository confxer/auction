package com.auction.service;

import java.util.List;

import com.auction.dto.AuctionDto;

public interface AuctionService {
    AuctionDto createAuction(AuctionDto auctionDto);
    List<AuctionDto> getAllAuctions();
    AuctionDto getAuctionById(Long id);
    AuctionDto updateAuction(Long id, AuctionDto auctionDto);
    void deleteAuction(Long id);
    AuctionDto checkAndCloseAuction(AuctionDto auctionDto);
    List<AuctionDto> getRandomAuctions(int count);
    
    // 조회수 증가
    void incrementViewCount(Long auctionId);
    
    // 입찰수 증가
    void incrementBidCount(Long auctionId);
}

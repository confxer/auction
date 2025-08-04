package com.auction.service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.auction.dto.AuctionDto;
import com.auction.entity.Auction;

public interface AuctionService {
    AuctionDto createAuction(AuctionDto auctionDto, MultipartFile imageFile);
    AuctionDto createAuction(AuctionDto auctionDto);
    List<AuctionDto> getAllAuctions();
    AuctionDto getAuctionById(Long id);
    AuctionDto updateAuction(Long id, AuctionDto auctionDto);
    void deleteAuction(Long id);
    AuctionDto checkAndCloseAuction(AuctionDto auctionDto);
    List<AuctionDto> getRandomAuctions(int count);
    List<AuctionDto> getAuctionsByUserId(Long userId);
    
    // 즉시구매 처리
    Auction buyNow(Long id, String buyerId);
    
    // 조회수 증가
    void incrementViewCount(Long auctionId);
    
    // 입찰수 증가
    void incrementBidCount(Long auctionId);

    // ✅ endAuction 추가
    Auction endAuction(Long id);
    
    // ✅ getBuyerNickname 추가
    String getBuyerNickname(Long buyerId);
}

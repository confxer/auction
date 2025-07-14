package com.auction.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.auction.dto.AuctionDto;
import com.auction.dto.BidDto;
import com.auction.repository.BidRepository;

@Service
public class BidServiceImpl implements BidService {
    private final BidRepository bidRepository;
    private final AuctionService auctionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public BidServiceImpl(BidRepository bidRepository, AuctionService auctionService, 
                         SimpMessagingTemplate messagingTemplate, NotificationService notificationService) {
        this.bidRepository = bidRepository;
        this.auctionService = auctionService;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    @Override
    public void saveBid(BidDto bid) {
        // 입찰 저장
        bidRepository.save(bid);
        
        // 경매 정보 업데이트 (최고가 갱신 및 입찰수 증가)
        AuctionDto auction = auctionService.getAuctionById(bid.getAuctionId());
        if (auction != null) {
            Long highestBid = bidRepository.findHighestBidByAuctionId(bid.getAuctionId());
            if (highestBid == null) highestBid = 0L;
            auction.setHighestBid((int) Math.max(highestBid, auction.getStartPrice().longValue()));
            
            // 입찰수 증가
            auctionService.incrementBidCount(bid.getAuctionId());
            
            // WebSocket으로 실시간 업데이트 전송
            messagingTemplate.convertAndSend("/topic/auction-updates", auction);
            
            // 입찰 알림 전송 (경매 등록자에게)
            notificationService.sendBidNotification(
                bid.getAuctionId(), 
                auction.getTitle(), 
                bid.getBidder(), 
                bid.getBidAmount()
            );
            // 자동입찰 기능은 추후 구현 예정
        }
    }

    @Override
    public BidDto createBid(BidDto bidDto) {
        // 입찰 시간 설정
        bidDto.setBidTime(LocalDateTime.now());
        
        // 입찰 저장
        saveBid(bidDto);
        
        return bidDto;
    }

    @Override
    public List<BidDto> getBidsByAuctionId(Long auctionId) {
        return bidRepository.findByAuctionId(auctionId);
    }

    @Override
    public List<BidDto> getBidsByUserId(Long userId) {
        return bidRepository.findByUserId(userId);
    }

    @Override
    public Map<String, Object> getBidStats(Long auctionId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<BidDto> bids = getBidsByAuctionId(auctionId);
        
        stats.put("totalBids", bids.size());
        stats.put("uniqueBidders", bids.stream().map(BidDto::getBidder).distinct().count());
        
        if (!bids.isEmpty()) {
            stats.put("highestBid", bids.stream().mapToLong(BidDto::getBidAmount).max().orElse(0));
            stats.put("lowestBid", bids.stream().mapToLong(BidDto::getBidAmount).min().orElse(0));
            stats.put("averageBid", bids.stream().mapToLong(BidDto::getBidAmount).average().orElse(0));
        } else {
            stats.put("highestBid", 0);
            stats.put("lowestBid", 0);
            stats.put("averageBid", 0);
        }
        
        return stats;
    }
}

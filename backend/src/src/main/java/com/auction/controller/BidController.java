package com.auction.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.auction.dto.BidDto;
import com.auction.service.BidService;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BidController {
    
    @Autowired
    private BidService bidService;

    // 경매별 입찰 내역 조회
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<BidDto>> getBidsByAuction(@PathVariable Long auctionId) {
        try {
            List<BidDto> bids = bidService.getBidsByAuctionId(auctionId);
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 입찰 생성
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBid(@RequestBody BidDto bidDto) {
        try {
            BidDto createdBid = bidService.createBid(bidDto);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "입찰이 성공적으로 제출되었습니다.",
                "bid", createdBid
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "입찰 제출에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    // 사용자별 입찰 내역 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BidDto>> getBidsByUser(@PathVariable Long userId) {
        try {
            List<BidDto> bids = bidService.getBidsByUserId(userId);
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 입찰 통계
    @GetMapping("/stats/auction/{auctionId}")
    public ResponseEntity<Map<String, Object>> getBidStats(@PathVariable Long auctionId) {
        try {
            Map<String, Object> stats = bidService.getBidStats(auctionId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 테스트용 모의 입찰 데이터 생성
    @PostMapping("/mock/{auctionId}")
    public ResponseEntity<String> createMockBids(@PathVariable Long auctionId) {
        try {
            // 모의 입찰 데이터 생성
            String[] bidders = {"김철수", "이영희", "박민수", "최지영", "정현우", "한소영"};
            long basePrice = 1000000; // 100만원부터 시작
            
            for (int i = 0; i < 5; i++) {
                BidDto mockBid = new BidDto();
                mockBid.setAuctionId(auctionId);
                mockBid.setBidder(bidders[i % bidders.length]);
                mockBid.setBidAmount(basePrice + (i * 10000) + (long)(Math.random() * 5000));
                mockBid.setBidTime(LocalDateTime.now().minusMinutes(i * 5));
                
                bidService.createBid(mockBid);
            }
            
            return ResponseEntity.ok("모의 입찰 데이터가 생성되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("모의 데이터 생성 실패: " + e.getMessage());
        }
    }
}

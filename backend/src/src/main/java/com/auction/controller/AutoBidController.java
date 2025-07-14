package com.auction.controller;

import com.auction.dto.AutoBidDto;
import com.auction.service.AutoBidService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auto-bid")
@CrossOrigin(origins = "http://localhost:5173")
public class AutoBidController {
    private final AutoBidService autoBidService;

    public AutoBidController(AutoBidService autoBidService) {
        this.autoBidService = autoBidService;
    }

    // 자동입찰 등록/갱신
    @PostMapping("/register")
    public ResponseEntity<String> registerAutoBid(@RequestParam Long auctionId,
                                                  @RequestParam String userId,
                                                  @RequestParam int maxAmount) {
        autoBidService.registerAutoBid(auctionId, userId, maxAmount);
        return ResponseEntity.ok("자동입찰이 등록되었습니다.");
    }

    // 경매별 자동입찰자 목록
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<AutoBidDto>> getAutoBidders(@PathVariable Long auctionId) {
        return ResponseEntity.ok(autoBidService.getAutoBidders(auctionId));
    }

    // 자동입찰 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteAutoBid(@RequestParam Long auctionId,
                                                @RequestParam String userId) {
        autoBidService.deleteAutoBid(auctionId, userId);
        return ResponseEntity.ok("자동입찰이 삭제되었습니다.");
    }
} 
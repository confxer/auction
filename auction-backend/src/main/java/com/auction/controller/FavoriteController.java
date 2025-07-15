package com.auction.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.dto.FavoriteDto;
import com.auction.service.FavoriteService;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FavoriteController {
    
    @Autowired
    private FavoriteService favoriteService;
    
    // 좋아요 추가
    @PostMapping("/{auctionId}")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @PathVariable Long auctionId,
            @RequestParam String userId) {
        try {
            favoriteService.addFavorite(auctionId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "좋아요가 추가되었습니다.",
                "isFavorited", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "좋아요 추가에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    // 좋아요 제거
    @DeleteMapping("/{auctionId}")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @PathVariable Long auctionId,
            @RequestParam String userId) {
        try {
            favoriteService.removeFavorite(auctionId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "좋아요가 제거되었습니다.",
                "isFavorited", false
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "좋아요 제거에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    // 좋아요 토글
    @PostMapping("/{auctionId}/toggle")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @PathVariable Long auctionId,
            @RequestParam String userId) {
        try {
            boolean isFavorited = favoriteService.toggleFavorite(auctionId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", isFavorited ? "좋아요가 추가되었습니다." : "좋아요가 제거되었습니다.",
                "isFavorited", isFavorited
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "좋아요 토글에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    // 사용자의 좋아요 목록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FavoriteDto>> getUserFavorites(@PathVariable String userId) {
        try {
            List<FavoriteDto> favorites = favoriteService.getUserFavorites(userId);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // 특정 경매에 대한 좋아요 여부 확인
    @GetMapping("/{auctionId}/check")
    public ResponseEntity<Map<String, Object>> checkFavorite(
            @PathVariable Long auctionId,
            @RequestParam String userId) {
        try {
            boolean isFavorited = favoriteService.isFavorited(auctionId, userId);
            return ResponseEntity.ok(Map.of(
                "isFavorited", isFavorited
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "isFavorited", false
            ));
        }
    }
    
    // 사용자의 좋아요 수 조회
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Object>> getUserFavoriteCount(@PathVariable String userId) {
        try {
            int count = favoriteService.getUserFavoriteCount(userId);
            return ResponseEntity.ok(Map.of(
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "count", 0
            ));
        }
    }
    
    // 경매의 좋아요 수 조회
    @GetMapping("/{auctionId}/count")
    public ResponseEntity<Map<String, Object>> getAuctionFavoriteCount(@PathVariable Long auctionId) {
        try {
            int count = favoriteService.getAuctionFavoriteCount(auctionId);
            return ResponseEntity.ok(Map.of(
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "count", 0
            ));
        }
    }
    
    // 마감 30분 전인 좋아요 경매 조회 (알림용)
    @GetMapping("/user/{userId}/ending-soon")
    public ResponseEntity<List<FavoriteDto>> getFavoritesEndingSoon(@PathVariable String userId) {
        try {
            List<FavoriteDto> favorites = favoriteService.getFavoritesEndingSoon(userId);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
} 
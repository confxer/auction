package com.auction.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.auction.dto.FavoriteDto;
import com.auction.repository.FavoriteRepository;

@Service
public class FavoriteService {
    
    @Autowired
    private FavoriteRepository favoriteRepository;
    
    // 좋아요 추가
    public void addFavorite(Long auctionId, String userId) {
        // 이미 좋아요한 경매인지 확인
        if (!favoriteRepository.isFavorited(auctionId, userId)) {
            favoriteRepository.addFavorite(auctionId, userId);
        }
    }
    
    // 좋아요 제거
    public void removeFavorite(Long auctionId, String userId) {
        favoriteRepository.removeFavorite(auctionId, userId);
    }
    
    // 사용자의 좋아요 목록 조회
    public List<FavoriteDto> getUserFavorites(String userId) {
        return favoriteRepository.getUserFavorites(userId);
    }
    
    // 특정 경매에 대한 좋아요 여부 확인
    public boolean isFavorited(Long auctionId, String userId) {
        return favoriteRepository.isFavorited(auctionId, userId);
    }
    
    // 사용자의 좋아요 수 조회
    public int getUserFavoriteCount(String userId) {
        return favoriteRepository.getUserFavoriteCount(userId);
    }
    
    // 경매의 좋아요 수 조회
    public int getAuctionFavoriteCount(Long auctionId) {
        return favoriteRepository.getAuctionFavoriteCount(auctionId);
    }
    
    // 마감 30분 전인 좋아요 경매 조회 (알림용)
    public List<FavoriteDto> getFavoritesEndingSoon(String userId) {
        return favoriteRepository.getFavoritesEndingSoon(userId);
    }
    
    // 좋아요 토글 (추가/제거)
    public boolean toggleFavorite(Long auctionId, String userId) {
        if (favoriteRepository.isFavorited(auctionId, userId)) {
            favoriteRepository.removeFavorite(auctionId, userId);
            return false; // 좋아요 해제됨
        } else {
            favoriteRepository.addFavorite(auctionId, userId);
            return true; // 좋아요 추가됨
        }
    }
} 
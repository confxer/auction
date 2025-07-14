package com.auction.service;

import com.auction.dto.AutoBidDto;
import com.auction.repository.AutoBidRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AutoBidService {
    private final AutoBidRepository autoBidRepository;

    public AutoBidService(AutoBidRepository autoBidRepository) {
        this.autoBidRepository = autoBidRepository;
    }

    // 자동입찰 등록/갱신
    public void registerAutoBid(Long auctionId, String userId, int maxAmount) {
        AutoBidDto dto = new AutoBidDto(auctionId, userId, maxAmount);
        autoBidRepository.saveOrUpdate(dto);
    }

    // 경매별 자동입찰자 목록
    public List<AutoBidDto> getAutoBidders(Long auctionId) {
        return autoBidRepository.findByAuctionId(auctionId);
    }

    // 자동입찰 삭제
    public void deleteAutoBid(Long auctionId, String userId) {
        autoBidRepository.delete(auctionId, userId);
    }
} 
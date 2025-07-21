package com.auction.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.auction.entity.Auction;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    // 기본 CRUD 제공
    List<Auction> findByUserId(Long userId);
}

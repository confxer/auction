package com.auction.repository;

import com.auction.entity.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    // 기본 CRUD 제공
}

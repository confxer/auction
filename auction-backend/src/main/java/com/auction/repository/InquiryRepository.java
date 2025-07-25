package com.auction.repository;

import com.auction.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    // ✅ 사용자 ID로 조회
    List<Inquiry> findByUserId(String userId);

    // ✅ 상태로 필터
    List<Inquiry> findByStatus(String status);

    // ✅ 최신순 정렬
    List<Inquiry> findAllByOrderByCreatedAtDesc();

    // ✅ 카테고리 + 상태 검색
    List<Inquiry> findByCategoryAndStatus(String category, String status);
}

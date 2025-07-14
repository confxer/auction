package com.auction.service;

import com.auction.dto.CommentDto;
import java.util.List;

public interface CommentService {
    // 댓글 등록
    void saveComment(CommentDto comment);
    
    // 경매별 댓글 목록 조회
    List<CommentDto> getCommentsByAuctionId(Long auctionId);
    
    // 댓글 단일 조회
    CommentDto getCommentById(Long id);
    
    // 댓글 수정
    void updateComment(Long id, CommentDto comment);
    
    // 댓글 삭제
    void deleteComment(Long id);
    
    // 경매별 댓글 수 조회
    int getCommentCountByAuctionId(Long auctionId);
    
    // 전체 댓글 수 조회
    int getTotalCommentCount();
} 
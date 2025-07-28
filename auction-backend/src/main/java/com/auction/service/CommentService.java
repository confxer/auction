package com.auction.service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.auction.dto.CommentDto;

public interface CommentService {
    // 댓글 등록
    void saveComment(CommentDto comment);
    
    // 경매별 댓글 목록 조회
    List<CommentDto> getCommentsByAuctionId(Long auctionId);
    
    // 사용자별 댓글 목록 조회
    List<CommentDto> getCommentsByUserId(Long userId);
    
    // 댓글 단일 조회
    CommentDto getCommentById(Long id);
    
    // 댓글 수정
    void updateComment(Long id, CommentDto comment);
    
    // 댓글 삭제
    void deleteComment(Long id, Authentication authentication);
    
    // 경매별 댓글 수 조회
    int getCommentCountByAuctionId(Long auctionId);
    
    // 전체 댓글 수 조회
    int getTotalCommentCount();
    
    // 경매별 전체 댓글 soft delete
    void deleteAllByAuctionId(Long auctionId);
} 
package com.auction.service;

import com.auction.dto.CommentDto;
import com.auction.repository.CommentRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public CommentServiceImpl(CommentRepository commentRepository, SimpMessagingTemplate messagingTemplate) {
        this.commentRepository = commentRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void saveComment(CommentDto comment) {
        // 시간 설정
        LocalDateTime now = LocalDateTime.now();
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);
        
        // 댓글 저장
        commentRepository.save(comment);
        
        // WebSocket으로 실시간 댓글 업데이트 전송
        messagingTemplate.convertAndSend("/topic/comments/" + comment.getAuctionId(), comment);
    }

    @Override
    public List<CommentDto> getCommentsByAuctionId(Long auctionId) {
        return commentRepository.findByAuctionId(auctionId);
    }

    @Override
    public CommentDto getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    @Override
    public void updateComment(Long id, CommentDto comment) {
        // 기존 댓글 조회
        CommentDto existingComment = commentRepository.findById(id);
        if (existingComment == null) {
            throw new RuntimeException("댓글을 찾을 수 없습니다.");
        }
        
        // 수정 시간 업데이트
        comment.setUpdatedAt(LocalDateTime.now());
        
        // 댓글 수정
        commentRepository.update(id, comment);
        
        // WebSocket으로 실시간 댓글 업데이트 전송
        messagingTemplate.convertAndSend("/topic/comments/" + comment.getAuctionId(), comment);
    }

    @Override
    public void deleteComment(Long id) {
        // 기존 댓글 조회
        CommentDto existingComment = commentRepository.findById(id);
        if (existingComment == null) {
            throw new RuntimeException("댓글을 찾을 수 없습니다.");
        }
        
        // 댓글 삭제
        commentRepository.delete(id);
        
        // WebSocket으로 실시간 댓글 삭제 알림 전송
        CommentDto deletedComment = new CommentDto();
        deletedComment.setId(id);
        deletedComment.setAuctionId(existingComment.getAuctionId());
        deletedComment.setDeleted(true);
        
        messagingTemplate.convertAndSend("/topic/comments/" + existingComment.getAuctionId(), deletedComment);
    }

    @Override
    public int getCommentCountByAuctionId(Long auctionId) {
        return commentRepository.countByAuctionId(auctionId);
    }

    @Override
    public int getTotalCommentCount() {
        return commentRepository.countAll();
    }
} 
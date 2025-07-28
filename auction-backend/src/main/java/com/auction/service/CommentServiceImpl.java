package com.auction.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.auction.dto.CommentDto;
import com.auction.dto.UserDto;
import com.auction.repository.CommentRepository;

@Service
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    public CommentServiceImpl(CommentRepository commentRepository, SimpMessagingTemplate messagingTemplate, UserService userService) {
        this.commentRepository = commentRepository;
        this.messagingTemplate = messagingTemplate;
        this.userService = userService;
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
    public void deleteComment(Long id, Authentication authentication) {
        // 기존 댓글 조회
        CommentDto existingComment = commentRepository.findById(id);
        if (existingComment == null) {
            throw new RuntimeException("댓글을 찾을 수 없습니다.");
        }
        // 권한 체크: admin은 모두, user는 본인만
        if (authentication == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        String username = authentication.getName();
        // userService를 통해 UserDto 조회 필요 (Autowired)
        UserDto user = userService.findByUsernameDto(username);
        if (user == null) {
            throw new RuntimeException("사용자 정보를 찾을 수 없습니다.");
        }
        boolean isAdmin = "ADMIN".equals(user.getRole());
        boolean isOwner = user.getId().equals(existingComment.getUserId());
        if (!isAdmin && !isOwner) {
            throw new RuntimeException("본인 댓글만 삭제할 수 있습니다.");
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

    @Override
    public List<CommentDto> getCommentsByUserId(Long userId) {
        return commentRepository.findByUserId(userId);
    }

    @Override
    public void deleteAllByAuctionId(Long auctionId) {
        // DB에서 soft delete
        commentRepository.deleteByAuctionId(auctionId);
        // WebSocket으로 전체 삭제 알림 (프론트에서 처리할 수 있도록 auctionId만 전달)
        messagingTemplate.convertAndSend("/topic/comments/" + auctionId, "ALL_DELETED");
    }
} 
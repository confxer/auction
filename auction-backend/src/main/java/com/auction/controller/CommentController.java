package com.auction.controller;

import com.auction.dto.CommentDto;
import com.auction.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // 댓글 등록
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody CommentDto comment) {
        try {
            // 유효성 검사
            if (comment.getAuctionId() == null) {
                return ResponseEntity.badRequest().body("경매 ID가 필요합니다.");
            }
            if (comment.getAuthor() == null || comment.getAuthor().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("작성자 이름이 필요합니다.");
            }
            if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("댓글 내용이 필요합니다.");
            }
            if (comment.getContent().length() > 1000) {
                return ResponseEntity.badRequest().body("댓글은 1000자 이하여야 합니다.");
            }

            commentService.saveComment(comment);
            return ResponseEntity.ok("댓글이 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("댓글 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 경매별 댓글 목록 조회
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<CommentDto>> getCommentsByAuctionId(@PathVariable Long auctionId) {
        try {
            List<CommentDto> comments = commentService.getCommentsByAuctionId(auctionId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // 댓글 단일 조회
    @GetMapping("/{id}")
    public ResponseEntity<CommentDto> getCommentById(@PathVariable Long id) {
        try {
            CommentDto comment = commentService.getCommentById(id);
            if (comment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // 댓글 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody CommentDto comment) {
        try {
            // 유효성 검사
            if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("댓글 내용이 필요합니다.");
            }
            if (comment.getContent().length() > 1000) {
                return ResponseEntity.badRequest().body("댓글은 1000자 이하여야 합니다.");
            }

            commentService.updateComment(id, comment);
            return ResponseEntity.ok("댓글이 수정되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("댓글 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 댓글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.ok("댓글이 삭제되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("댓글 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 경매별 댓글 수 조회
    @GetMapping("/auction/{auctionId}/count")
    public ResponseEntity<Integer> getCommentCountByAuctionId(@PathVariable Long auctionId) {
        try {
            int count = commentService.getCommentCountByAuctionId(auctionId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // 전체 댓글 수 조회
    @GetMapping("/count")
    public ResponseEntity<Integer> getTotalCommentCount() {
        try {
            int count = commentService.getTotalCommentCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
} 
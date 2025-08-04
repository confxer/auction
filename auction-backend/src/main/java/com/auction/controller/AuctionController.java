package com.auction.controller;

import java.util.List;

import com.auction.dto.NotificationDto;
import com.auction.entity.Auction;
import com.auction.service.NotificationService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

import com.auction.dto.AuctionDto;
import com.auction.dto.BidDto;
import com.auction.entity.User;
import com.auction.service.AuctionService;
import com.auction.service.BidService;
import com.auction.service.UserService;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuctionController {
    private static final Logger logger = LoggerFactory.getLogger(AuctionController.class);

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private BidService bidService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    // 입찰 내역 조회
    @GetMapping("/{auctionId}/bids")
    public ResponseEntity<List<BidDto>> getBidsByAuction(@PathVariable Long auctionId) {
        try {
            logger.info("경매 {}의 입찰 내역 조회", auctionId);
            List<BidDto> bids = bidService.getBidsByAuctionId(auctionId);
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            logger.error("입찰 내역 조회 실패 - auctionId: {}", auctionId, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // 입찰 생성
    @PostMapping("/{auctionId}/bid")
    public ResponseEntity<String> createBid(@PathVariable Long auctionId, @RequestBody BidDto bidDto) {
        try {
            logger.info("경매 {}에 입찰 생성", auctionId);
            bidDto.setAuctionId(auctionId);
            bidService.createBid(bidDto);
            return ResponseEntity.ok("입찰이 성공적으로 제출되었습니다.");
        } catch (Exception e) {
            logger.error("입찰 생성 실패 - auctionId: {}", auctionId, e);
            return ResponseEntity.badRequest().body("입찰 제출에 실패했습니다: " + e.getMessage());
        }
    }

    // 경매 등록
    @PostMapping
    public ResponseEntity<AuctionDto> createAuction(@RequestPart("auction") AuctionDto auctionDto,
                                                    @RequestPart(value = "image", required = false) MultipartFile imageFile,
                                                    Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(null);
            }
            String username = authentication.getName();
            User user = userService.findByUsername(username).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            auctionDto.setUserId(user.getId());

            logger.info("새 경매 생성: {} (userId: {})", auctionDto.getTitle(), user.getId());
            AuctionDto created = auctionService.createAuction(auctionDto, imageFile);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            logger.error("경매 생성 실패", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<AuctionDto>> getAllAuctions() {
        try {
            logger.info("모든 경매 조회 시작");
            List<AuctionDto> auctions = auctionService.getAllAuctions();
            logger.info("경매 조회 완료: {}개", auctions.size());
            return ResponseEntity.ok(auctions);
        } catch (Exception e) {
            logger.error("경매 조회 실패", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/random")
    public ResponseEntity<List<AuctionDto>> getRandomAuctions(@RequestParam(defaultValue = "5") int count) {
        List<AuctionDto> randomAuctions = auctionService.getRandomAuctions(count);
        return ResponseEntity.ok(randomAuctions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionDto> getAuctionById(@PathVariable Long id) {
        try {
            logger.info("경매 조회: ID {}", id);
            AuctionDto auction = auctionService.getAuctionById(id);
            if (auction == null) {
                logger.warn("경매를 찾을 수 없음: ID {}", id);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(auction);
        } catch (Exception e) {
            logger.error("경매 조회 실패 - ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // 조회수 증가
    @PostMapping("/{id}/view")
    public ResponseEntity<String> incrementViewCount(@PathVariable Long id) {
        try {
            auctionService.incrementViewCount(id);
            return ResponseEntity.ok("조회수가 증가되었습니다.");
        } catch (Exception e) {
            logger.error("조회수 증가 실패 - id: {}", id, e);
            return ResponseEntity.status(500).body("조회수 증가에 실패했습니다: " + e.getMessage());
        }
    }

    // 경매 수정
    @PutMapping("/{id}")
    public ResponseEntity<AuctionDto> updateAuction(@PathVariable Long id, @RequestBody AuctionDto auctionDto) {
        try {
            logger.info("경매 수정: ID {}", id);
            AuctionDto updated = auctionService.updateAuction(id, auctionDto);
            if (updated == null) {
                logger.warn("수정할 경매를 찾을 수 없음: ID {}", id);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("경매 수정 실패 - ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // 관리자 경매 삭제
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAuction(@PathVariable Long id) {
        try {
            logger.info("경매 삭제: ID {}", id);
            auctionService.deleteAuction(id);
            return ResponseEntity.ok("경매와 모든 댓글이 삭제되었습니다.");
        } catch (Exception e) {
            logger.error("경매 삭제 실패 - ID: {}", id, e);
            return ResponseEntity.status(500).body("경매 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    // 경매 종료 + 낙찰자/판매자 알림
    @PostMapping("/{id}/end")
    public ResponseEntity<String> endAuction(@PathVariable Long id) {
        try {
            Auction auction = auctionService.endAuction(id);

            if (auction != null) {
                if (auction.getWinner() != null) {
                    String winnerId = auction.getWinner();
                    Long auctionId = auction.getId();
                    String title = auction.getTitle();
                    String sellerId = String.valueOf(auction.getUserId());

                    // 낙찰자 알림
                    NotificationDto winnerNotice = new NotificationDto(
                        auctionId,
                        title,
                        winnerId,
                        "WIN",
                        "🏆 '" + title + "' 경매에서 낙찰되었습니다!"
                    );
                    notificationService.sendNotification(winnerId, winnerNotice);

                    // 판매자 알림
                    NotificationDto sellerNotice = new NotificationDto(
                        auctionId,
                        title,
                        sellerId,
                        "SOLD",
                        "📦 '" + title + "' 경매가 낙찰되어 판매 완료되었습니다!"
                    );
                    notificationService.sendNotification(sellerId, sellerNotice);
                }
                return ResponseEntity.ok("경매가 종료되었습니다.");
            } else {
                return ResponseEntity.status(404).body("경매를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            logger.error("경매 종료 실패", e);
            return ResponseEntity.status(500).body("경매 종료 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 즉시구매 처리 + 알림
    @PostMapping("/{id}/buy-now")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> buyNow(@PathVariable Long id, Authentication auth,@RequestBody Map<String, Object> request) {
        try {
            Long winnerId = Long.parseLong(request.get("winnerId").toString());
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }

            String buyerId = auth.getName();
            
            if (buyerId == null || buyerId.isEmpty()) {
                return ResponseEntity.status(401).body("인증 정보가 유효하지 않습니다.");
            }

            // 경매 정보 조회 (getAuctionById는 AuctionDto를 반환)
            AuctionDto auctionDto = auctionService.getAuctionById(id);
            if (auctionDto == null) {
                return ResponseEntity.status(404).body("경매를 찾을 수 없습니다.");
            }

            // 이미 종료된 경매인지 확인
            if (auctionDto.getIsClosed() != null && auctionDto.getIsClosed()) {
                return ResponseEntity.status(400).body("이미 종료된 경매입니다.");
            }

            // 판매자가 본인 상품을 구매하는지 확인
            if (auctionDto.getUserId() != null && 
                String.valueOf(auctionDto.getUserId()).equals(buyerId)) {
                return ResponseEntity.status(400).body("자신의 상품은 구매할 수 없습니다.");
            }

            // 즉시구매 처리
            Auction updatedAuction = auctionService.buyNow(id, buyerId);
            if (updatedAuction == null) {
                return ResponseEntity.status(500).body("즉시구매 처리 중 오류가 발생했습니다.");
            }

            // 알림 전송
            String title = updatedAuction.getTitle();
            Long auctionId = updatedAuction.getId();
            String sellerId = String.valueOf(updatedAuction.getUserId());
            String winner = auctionService.getBuyerNickname(winnerId); 
            String winnerIID = String.valueOf(winnerId);
            System.out.println("sellerId: " + sellerId);
            

            try {
                // 구매자 알림
                NotificationDto buyerNotice = new NotificationDto(
                    auctionId,
                    title,
                    winner,
                    "BUY_NOW",
                    "✅ '" + title + "' 즉시구매가 완료되었습니다!"
                );
                auctionService.buyNow(auctionId, winnerIID);

                // 판매자 알림 (판매자와 구매자가 다른 경우에만 전송)
                if (!sellerId.equals(winnerIID)) {
                    NotificationDto sellerNotice = new NotificationDto(
                        auctionId,
                        title,
                        sellerId,
                        "SOLD",
                        "💰 '" + title + "' 상품이 즉시구매로 판매되었습니다. 구매자: " + buyerId
                    );
                    notificationService.sendNotification(sellerId, sellerNotice);
                }
            } catch (Exception e) {
                logger.error("알림 전송 중 오류 발생", e);
                // 알림 실패해도 트랜잭션은 커밋
            }

            return ResponseEntity.ok("즉시구매가 완료되었습니다.");
        } catch (Exception e) {
            logger.error("즉시구매 처리 중 오류 발생", e);
            return ResponseEntity.status(500).body("즉시구매 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
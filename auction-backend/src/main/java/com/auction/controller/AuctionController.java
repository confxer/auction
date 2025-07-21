package com.auction.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    // 데이터베이스 연결 테스트용 엔드포인트
    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        try {
            logger.info("데이터베이스 연결 테스트 시작");
            List<AuctionDto> auctions = auctionService.getAllAuctions();
            logger.info("데이터베이스 연결 성공! 경매 개수: {}", auctions.size());
            return ResponseEntity.ok("데이터베이스 연결 성공! 경매 개수: " + auctions.size());
        } catch (Exception e) {
            logger.error("데이터베이스 연결 실패", e);
            return ResponseEntity.status(500).body("데이터베이스 연결 실패: " + e.getMessage());
        }
    }

    // 샘플 데이터 생성 엔드포인트
    @PostMapping("/sample-data")
    public ResponseEntity<String> createSampleData() {
        try {
            logger.info("샘플 데이터 생성 시작");
            
            AuctionDto auction1 = new AuctionDto();
            auction1.setTitle("애플 맥북 프로 16인치");
            auction1.setCategory("전자제품");
            auction1.setStatus("신품");
            auction1.setBrand("Apple");
            auction1.setDescription("2023년형 애플 맥북 프로 16인치, M2 Pro 칩, 32GB RAM, 1TB SSD. 완벽한 상태입니다.");
            auction1.setStartPrice(2000000);
            auction1.setBuyNowPrice(2500000);
            auction1.setBidUnit(10000);
            auction1.setStartTime(java.time.LocalDateTime.now());
            auction1.setEndTime(java.time.LocalDateTime.now().plusDays(7));
            auction1.setMinBidCount(1);
            auction1.setAutoExtend(false);
            auction1.setShippingFee("무료");
            auction1.setShippingType("택배");
            auction1.setHighestBid(2000000);
            auction1.setLocation("서울시 강남구");
            auction1.setImageUrl1("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500");
            auction1.setIsClosed(false);
            auction1.setCreatedAt(java.time.LocalDateTime.now());
            auction1.setUpdatedAt(java.time.LocalDateTime.now());
            auctionService.createAuction(auction1, null);

            AuctionDto auction2 = new AuctionDto();
            auction2.setTitle("소니 A7M4 카메라");
            auction2.setCategory("전자제품");
            auction2.setStatus("신품");
            auction2.setBrand("Sony");
            auction2.setDescription("소니 알파 A7M4 미러리스 카메라, 33MP, 4K 비디오, 렌즈 포함. 거의 새것입니다.");
            auction2.setStartPrice(1500000);
            auction2.setBuyNowPrice(1800000);
            auction2.setBidUnit(5000);
            auction2.setStartTime(java.time.LocalDateTime.now());
            auction2.setEndTime(java.time.LocalDateTime.now().plusDays(5));
            auction2.setMinBidCount(1);
            auction2.setAutoExtend(false);
            auction2.setShippingFee("무료");
            auction2.setShippingType("택배");
            auction2.setHighestBid(1500000);
            auction2.setLocation("서울시 서초구");
            auction2.setImageUrl1("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500");
            auction2.setIsClosed(false);
            auction2.setCreatedAt(java.time.LocalDateTime.now());
            auction2.setUpdatedAt(java.time.LocalDateTime.now());
            auctionService.createAuction(auction2, null);

            logger.info("샘플 데이터 생성 완료");
            return ResponseEntity.ok("샘플 데이터 생성 완료! 2개의 경매가 추가되었습니다.");
        } catch (Exception e) {
            logger.error("샘플 데이터 생성 실패", e);
            return ResponseEntity.status(500).body("샘플 데이터 생성 실패: " + e.getMessage());
        }
    }

    // 경매별 입찰 내역 조회
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

    @PostMapping
    public ResponseEntity<AuctionDto> createAuction(@RequestPart("auction") AuctionDto auctionDto, @RequestPart(value = "image", required = false) MultipartFile imageFile, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(null); // 401 Unauthorized
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
    
    // 조회수 증가 API
    @PostMapping("/{id}/view")
    public ResponseEntity<String> incrementViewCount(@PathVariable Long id) {
        try {
            System.out.println("증가?");
            auctionService.incrementViewCount(id);
            return ResponseEntity.ok("조회수가 증가되었습니다.");
        } catch (Exception e) {
            logger.error("조회수 증가 실패 - id: {}", id, e);
            return ResponseEntity.status(500).body("조회수 증가에 실패했습니다: " + e.getMessage());
        }
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuction(@PathVariable Long id) {
        try {
            logger.info("경매 삭제: ID {}", id);
            auctionService.deleteAuction(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("경매 삭제 실패 - ID: {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }
}

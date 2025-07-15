package com.auction.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.auction.dto.AuctionDto;
import com.auction.service.AuctionService;

@Component
public class DataLoader implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);
    
    @Autowired
    private AuctionService auctionService;

    @Override
    public void run(String... args) throws Exception {
        logger.info("데이터 로더 시작 - 샘플 경매 데이터 생성");
        
        try {
            // 기존 데이터가 있는지 확인
            if (auctionService.getAllAuctions().isEmpty()) {
                createSampleAuctions();
                logger.info("샘플 경매 데이터 생성 완료");
            } else {
                logger.info("기존 데이터가 존재하여 샘플 데이터 생성을 건너뜀");
            }
        } catch (Exception e) {
            logger.error("샘플 데이터 생성 중 오류 발생", e);
        }
    }

    private void createSampleAuctions() {
        // 샘플 경매 1
        AuctionDto auction1 = new AuctionDto();
        auction1.setTitle("애플 맥북 프로 16인치");
        auction1.setCategory("전자제품");
        auction1.setStatus("진행중");
        auction1.setBrand("Apple");
        auction1.setDescription("2023년형 애플 맥북 프로 16인치, M2 Pro 칩, 32GB RAM, 1TB SSD. 완벽한 상태입니다.");
        auction1.setStartPrice(2000000);
        auction1.setHighestBid(2000000);
        auction1.setLocation("서울시 강남구");
        auction1.setImageUrl1("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500");
        auction1.setIsClosed(false);
        auctionService.createAuction(auction1);

        // 샘플 경매 2
        AuctionDto auction2 = new AuctionDto();
        auction2.setTitle("소니 A7M4 카메라");
        auction2.setCategory("전자제품");
        auction2.setStatus("진행중");
        auction2.setBrand("Sony");
        auction2.setDescription("소니 알파 A7M4 미러리스 카메라, 33MP, 4K 비디오, 렌즈 포함. 거의 새것입니다.");
        auction2.setStartPrice(1500000);
        auction2.setHighestBid(1500000);
        auction2.setLocation("서울시 서초구");
        auction2.setImageUrl1("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500");
        auction2.setIsClosed(false);
        auctionService.createAuction(auction2);

        // 샘플 경매 3
        AuctionDto auction3 = new AuctionDto();
        auction3.setTitle("로렉스 서브마리너 시계");
        auction3.setCategory("쥬얼리");
        auction3.setStatus("진행중");
        auction3.setBrand("Rolex");
        auction3.setDescription("로렉스 서브마리너 데이트저스트, 41mm, 블랙 다이얼. 정품 보증서 포함.");
        auction3.setStartPrice(8000000);
        auction3.setHighestBid(8000000);
        auction3.setLocation("서울시 중구");
        auction3.setImageUrl1("https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500");
        auction3.setIsClosed(false);
        auctionService.createAuction(auction3);

        // 샘플 경매 4
        AuctionDto auction4 = new AuctionDto();
        auction4.setTitle("닌텐도 스위치 OLED");
        auction4.setCategory("전자제품");
        auction4.setStatus("진행중");
        auction4.setBrand("Nintendo");
        auction4.setDescription("닌텐도 스위치 OLED 모델, 화이트, 조이콘 2개, 게임 5개 포함. 완벽한 상태입니다.");
        auction4.setStartPrice(300000);
        auction4.setHighestBid(300000);
        auction4.setLocation("서울시 마포구");
        auction4.setImageUrl1("https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500");
        auction4.setIsClosed(false);
        auctionService.createAuction(auction4);

        // 샘플 경매 5
        AuctionDto auction5 = new AuctionDto();
        auction5.setTitle("아이패드 프로 12.9인치");
        auction5.setCategory("전자제품");
        auction5.setStatus("진행중");
        auction5.setBrand("Apple");
        auction5.setDescription("2023년형 아이패드 프로 12.9인치, M2 칩, 256GB, Wi-Fi + Cellular. 완벽한 상태입니다.");
        auction5.setStartPrice(1200000);
        auction5.setHighestBid(1200000);
        auction5.setLocation("서울시 강남구");
        auction5.setImageUrl1("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500");
        auction5.setIsClosed(false);
        auctionService.createAuction(auction5);

        // 샘플 경매 6
        AuctionDto auction6 = new AuctionDto();
        auction6.setTitle("샤넬 클래식 플랩 백");
        auction6.setCategory("패션");
        auction6.setStatus("진행중");
        auction6.setBrand("Chanel");
        auction6.setDescription("샤넬 클래식 플랩 백 미디움, 블랙, 골드 하드웨어. 정품 보증서와 박스 포함.");
        auction6.setStartPrice(5000000);
        auction6.setHighestBid(5000000);
        auction6.setLocation("서울시 강남구");
        auction6.setImageUrl1("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500");
        auction6.setIsClosed(false);
        auctionService.createAuction(auction6);
    }
} 
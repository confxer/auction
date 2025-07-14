package com.auction.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.dto.AuctionDto;
import com.auction.dto.EventDto;
import com.auction.dto.FAQDto;
import com.auction.dto.NoticeDto;
import com.auction.service.AuctionService;
import com.auction.service.EventService;
import com.auction.service.FAQService;
import com.auction.service.NoticeService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class IntegratedController {
    
    @Autowired
    private AuctionService auctionService;
    
    @Autowired
    private NoticeService noticeService;
    
    @Autowired
    private FAQService faqService;
    
    @Autowired
    private EventService eventService;

    // 통합 데이터 조회 API
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        try {
            Map<String, Object> dashboardData = new HashMap<>();
            
            // 경매 데이터
            List<AuctionDto> auctions = auctionService.getAllAuctions();
            dashboardData.put("auctions", auctions);
            
            // 공지사항 데이터
            List<NoticeDto> notices = noticeService.getPublishedNotices();
            dashboardData.put("notices", notices);
            
            // FAQ 데이터
            List<FAQDto> faqs = faqService.getPublishedFAQs();
            dashboardData.put("faqs", faqs);
            
            // 이벤트 데이터
            List<EventDto> events = eventService.getPublishedEvents();
            dashboardData.put("events", events);
            
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 홈페이지용 데이터 조회 API
    @GetMapping("/home")
    public ResponseEntity<Map<String, Object>> getHomeData() {
        try {
            Map<String, Object> homeData = new HashMap<>();
            
            // 활성 경매 (최신 6개)
            List<AuctionDto> activeAuctions = auctionService.getAllAuctions().stream()
                .filter(auction -> !auction.getIsClosed())
                .limit(6)
                .toList();
            homeData.put("activeAuctions", activeAuctions);
            
            // 중요 공지사항 (최신 3개)
            List<NoticeDto> importantNotices = noticeService.getPublishedNotices().stream()
                .filter(notice -> notice.isImportant())
                .limit(3)
                .toList();
            homeData.put("importantNotices", importantNotices);
            
            // 중요 FAQ (최신 5개)
            List<FAQDto> importantFaqs = faqService.getPublishedFAQs().stream()
                .filter(faq -> faq.isImportant())
                .limit(5)
                .toList();
            homeData.put("importantFaqs", importantFaqs);
            
            // 진행 중인 이벤트 (최신 3개)
            List<EventDto> ongoingEvents = eventService.getOngoingEvents().stream()
                .limit(3)
                .toList();
            homeData.put("ongoingEvents", ongoingEvents);
            
            return ResponseEntity.ok(homeData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // 샘플 데이터 생성 API
    @PostMapping("/sample-data")
    public ResponseEntity<Map<String, String>> createSampleData() {
        try {
            Map<String, String> results = new HashMap<>();
            
            // 공지사항 샘플 데이터
            try {
                // 기존 데이터 확인
                List<NoticeDto> existingNotices = noticeService.getAllNotices();
                if (existingNotices.isEmpty()) {
                    NoticeDto notice1 = new NoticeDto();
                    notice1.setTitle("경매 플랫폼 오픈 안내");
                    notice1.setContent("새로운 경매 플랫폼이 오픈되었습니다. 많은 관심 부탁드립니다.");
                    notice1.setCategory("general");
                    notice1.setStatus("published");
                    notice1.setImportant(true);
                    notice1.setAuthor("관리자");
                    noticeService.createNotice(notice1);

                    NoticeDto notice2 = new NoticeDto();
                    notice2.setTitle("시스템 점검 안내");
                    notice2.setContent("매주 일요일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다.");
                    notice2.setCategory("maintenance");
                    notice2.setStatus("published");
                    notice2.setImportant(false);
                    notice2.setAuthor("관리자");
                    noticeService.createNotice(notice2);

                    NoticeDto notice3 = new NoticeDto();
                    notice3.setTitle("신규 회원 혜택 안내");
                    notice3.setContent("신규 회원 가입 시 다양한 혜택을 제공합니다.");
                    notice3.setCategory("event");
                    notice3.setStatus("published");
                    notice3.setImportant(true);
                    notice3.setAuthor("관리자");
                    noticeService.createNotice(notice3);
                    
                    results.put("notices", "공지사항 샘플 데이터 3개 생성 완료");
                } else {
                    results.put("notices", "기존 공지사항 데이터가 존재하여 건너뜀 (" + existingNotices.size() + "개)");
                }
            } catch (Exception e) {
                results.put("notices", "공지사항 샘플 데이터 생성 실패: " + e.getMessage());
            }
            
            // FAQ 샘플 데이터
            try {
                List<FAQDto> existingFaqs = faqService.getAllFAQs();
                if (existingFaqs.isEmpty()) {
                    FAQDto faq1 = new FAQDto();
                    faq1.setQuestion("경매는 어떻게 참여하나요?");
                    faq1.setAnswer("경매 페이지에서 원하는 상품을 선택하고 입찰 버튼을 클릭하여 참여할 수 있습니다.");
                    faq1.setCategory("경매");
                    faq1.setStatus("published");
                    faq1.setImportant(true);
                    faq1.setAuthor("관리자");
                    faqService.createFAQ(faq1);

                    FAQDto faq2 = new FAQDto();
                    faq2.setQuestion("입찰 취소가 가능한가요?");
                    faq2.setAnswer("입찰 후 1시간 이내에는 취소가 가능하며, 그 이후에는 취소할 수 없습니다.");
                    faq2.setCategory("입찰");
                    faq2.setStatus("published");
                    faq2.setImportant(false);
                    faq2.setAuthor("관리자");
                    faqService.createFAQ(faq2);

                    FAQDto faq3 = new FAQDto();
                    faq3.setQuestion("수수료는 얼마인가요?");
                    faq3.setAnswer("경매 수수료는 낙찰가의 5%입니다. 신규 회원은 첫 경매 시 수수료 면제 혜택을 받을 수 있습니다.");
                    faq3.setCategory("결제");
                    faq3.setStatus("published");
                    faq3.setImportant(true);
                    faq3.setAuthor("관리자");
                    faqService.createFAQ(faq3);
                    
                    results.put("faqs", "FAQ 샘플 데이터 3개 생성 완료");
                } else {
                    results.put("faqs", "기존 FAQ 데이터가 존재하여 건너뜀 (" + existingFaqs.size() + "개)");
                }
            } catch (Exception e) {
                results.put("faqs", "FAQ 샘플 데이터 생성 실패: " + e.getMessage());
            }
            
            // 이벤트 샘플 데이터
            try {
                List<EventDto> existingEvents = eventService.getAllEvents();
                if (existingEvents.isEmpty()) {
                    EventDto event1 = new EventDto();
                    event1.setTitle("신규 회원 가입 이벤트");
                    event1.setContent("신규 회원 가입 시 10,000원 할인 쿠폰을 드립니다!");
                    event1.setCategory("가입혜택");
                    event1.setStatus("published");
                    event1.setImportant(true);
                    event1.setAuthor("관리자");
                    event1.setStartDate(java.time.LocalDate.now());
                    event1.setEndDate(java.time.LocalDate.now().plusMonths(1));
                    eventService.createEvent(event1);

                    EventDto event2 = new EventDto();
                    event2.setTitle("첫 경매 참여 이벤트");
                    event2.setContent("첫 경매 참여 시 수수료 면제 혜택을 제공합니다.");
                    event2.setCategory("경매혜택");
                    event2.setStatus("published");
                    event2.setImportant(false);
                    event2.setAuthor("관리자");
                    event2.setStartDate(java.time.LocalDate.now());
                    event2.setEndDate(java.time.LocalDate.now().plusWeeks(2));
                    eventService.createEvent(event2);

                    EventDto event3 = new EventDto();
                    event3.setTitle("연말 감사제");
                    event3.setContent("한 해 동안 함께해주신 고객님들께 감사드립니다. 특별한 혜택을 준비했습니다.");
                    event3.setCategory("감사제");
                    event3.setStatus("published");
                    event3.setImportant(true);
                    event3.setAuthor("관리자");
                    event3.setStartDate(java.time.LocalDate.now().minusDays(5));
                    event3.setEndDate(java.time.LocalDate.now().plusDays(25));
                    eventService.createEvent(event3);
                    
                    results.put("events", "이벤트 샘플 데이터 3개 생성 완료");
                } else {
                    results.put("events", "기존 이벤트 데이터가 존재하여 건너뜀 (" + existingEvents.size() + "개)");
                }
            } catch (Exception e) {
                results.put("events", "이벤트 샘플 데이터 생성 실패: " + e.getMessage());
            }
            
            // 경매 샘플 데이터
            try {
                List<AuctionDto> existingAuctions = auctionService.getAllAuctions();
                if (existingAuctions.isEmpty()) {
                    AuctionDto auction1 = new AuctionDto();
                    auction1.setTitle("[샘플] 아이폰 15 Pro 경매");
                    auction1.setCategory("전자제품");
                    auction1.setStatus("active");
                    auction1.setBrand("Apple");
                    auction1.setImageUrl1("/uploads/sample_iphone15.jpg");
                    auction1.setDescription("최신 아이폰 15 Pro, 미개봉, 1원 경매!");
                    auction1.setStartPrice(1);
                    auction1.setBuyNowPrice(1500000);
                    auction1.setBidUnit(1000);
                    auction1.setStartTime(java.time.LocalDateTime.now().minusDays(1));
                    auction1.setEndTime(java.time.LocalDateTime.now().plusDays(2));
                    auction1.setMinBidCount(1);
                    auction1.setAutoExtend(true);
                    auction1.setShippingFee("무료");
                    auction1.setShippingType("택배");
                    auction1.setLocation("서울");
                    auction1.setCreatedAt(java.time.LocalDateTime.now().minusDays(1));
                    auction1.setUpdatedAt(java.time.LocalDateTime.now());
                    auction1.setHighestBid(50000);
                    auction1.setIsClosed(false);
                    auctionService.createAuction(auction1);

                    AuctionDto auction2 = new AuctionDto();
                    auction2.setTitle("[샘플] 나이키 에어맥스 한정판");
                    auction2.setCategory("패션");
                    auction2.setStatus("active");
                    auction2.setBrand("Nike");
                    auction2.setImageUrl1("/uploads/sample_nike_airmax.jpg");
                    auction2.setDescription("나이키 에어맥스 한정판, 새상품, 빠른 입찰 추천!");
                    auction2.setStartPrice(10000);
                    auction2.setBuyNowPrice(300000);
                    auction2.setBidUnit(500);
                    auction2.setStartTime(java.time.LocalDateTime.now().minusHours(5));
                    auction2.setEndTime(java.time.LocalDateTime.now().plusDays(1));
                    auction2.setMinBidCount(1);
                    auction2.setAutoExtend(false);
                    auction2.setShippingFee("3,000원");
                    auction2.setShippingType("택배");
                    auction2.setLocation("부산");
                    auction2.setCreatedAt(java.time.LocalDateTime.now().minusHours(5));
                    auction2.setUpdatedAt(java.time.LocalDateTime.now());
                    auction2.setHighestBid(25000);
                    auction2.setIsClosed(false);
                    auctionService.createAuction(auction2);

                    AuctionDto auction3 = new AuctionDto();
                    auction3.setTitle("[샘플] 삼성 세탁기 21kg");
                    auction3.setCategory("가전");
                    auction3.setStatus("active");
                    auction3.setBrand("Samsung");
                    auction3.setImageUrl1("/uploads/sample_washer.jpg");
                    auction3.setDescription("삼성 최신형 21kg 세탁기, 새상품, 무료배송!");
                    auction3.setStartPrice(50000);
                    auction3.setBuyNowPrice(900000);
                    auction3.setBidUnit(5000);
                    auction3.setStartTime(java.time.LocalDateTime.now().minusHours(2));
                    auction3.setEndTime(java.time.LocalDateTime.now().plusDays(3));
                    auction3.setMinBidCount(1);
                    auction3.setAutoExtend(true);
                    auction3.setShippingFee("무료");
                    auction3.setShippingType("택배");
                    auction3.setLocation("대전");
                    auction3.setCreatedAt(java.time.LocalDateTime.now().minusHours(2));
                    auction3.setUpdatedAt(java.time.LocalDateTime.now());
                    auction3.setHighestBid(70000);
                    auction3.setIsClosed(false);
                    auctionService.createAuction(auction3);

                    results.put("auctions", "경매 샘플 데이터 3개 생성 완료");
                } else {
                    results.put("auctions", "기존 경매 데이터가 존재하여 건너뜀 (" + existingAuctions.size() + "개)");
                }
            } catch (Exception e) {
                results.put("auctions", "경매 샘플 데이터 생성 실패: " + e.getMessage());
            }
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // API 상태 확인
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getApiStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("status", "running");
            status.put("timestamp", java.time.LocalDateTime.now());
            status.put("version", "1.0.0");
            
            // 각 서비스 상태 확인
            try {
                List<AuctionDto> auctions = auctionService.getAllAuctions();
                status.put("auctions", auctions.size());
            } catch (Exception e) {
                status.put("auctions", "error");
            }
            
            try {
                List<NoticeDto> notices = noticeService.getPublishedNotices();
                status.put("notices", notices.size());
            } catch (Exception e) {
                status.put("notices", "error");
            }
            
            try {
                List<FAQDto> faqs = faqService.getPublishedFAQs();
                status.put("faqs", faqs.size());
            } catch (Exception e) {
                status.put("faqs", "error");
            }
            
            try {
                List<EventDto> events = eventService.getPublishedEvents();
                status.put("events", events.size());
            } catch (Exception e) {
                status.put("events", "error");
            }
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
} 
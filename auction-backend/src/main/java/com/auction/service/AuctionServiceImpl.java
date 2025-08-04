package com.auction.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.context.annotation.Lazy;

import com.auction.dto.AuctionDto;
import com.auction.dto.NotificationDto;
import com.auction.entity.Auction;
import com.auction.repository.AuctionRepository;
import com.auction.repository.BidRepository;
import com.auction.repository.UserRepository;
import com.auction.repository.CustomAuctionRepository;

@Service
public class AuctionServiceImpl implements AuctionService {
  

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentService commentService;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private CustomAuctionRepository customAuctionRepository;

    private final String uploadDir = "uploads/";

    private AuctionDto toDto(Auction auction) {
        AuctionDto dto = new AuctionDto();
        dto.setId(auction.getId());
        dto.setTitle(auction.getTitle());
        dto.setCategory(auction.getCategory());
        dto.setStatus(auction.getStatus());
        dto.setBrand(auction.getBrand());
        dto.setImageUrl1(auction.getImageUrl1());
        dto.setImageUrl2(auction.getImageUrl2());
        dto.setImageUrl3(auction.getImageUrl3());
        dto.setDescription(auction.getDescription());
        dto.setStartPrice(auction.getStartPrice());
        dto.setBuyNowPrice(auction.getBuyNowPrice());
        dto.setBidUnit(auction.getBidUnit());
        dto.setStartTime(auction.getStartTime());
        dto.setEndTime(auction.getEndTime());
        dto.setMinBidCount(auction.getMinBidCount());
        dto.setAutoExtend(auction.getAutoExtend());
        dto.setShippingFee(auction.getShippingFee());
        dto.setShippingType(auction.getShippingType());
        dto.setLocation(auction.getLocation());
        dto.setCreatedAt(auction.getCreatedAt());
        dto.setUpdatedAt(auction.getUpdatedAt());
        dto.setHighestBid(auction.getHighestBid());
        dto.setIsClosed(auction.getIsClosed());
        dto.setWinner(auction.getWinner());
        dto.setViewCount(auction.getViewCount());
        dto.setBidCount(auction.getBidCount());
        dto.setUserId(auction.getUserId());

        if (auction.getUserId() != null) {
            userRepository.findById(auction.getUserId()).ifPresent(user -> dto.setSeller(user.getUsername()));
        }

        dto.setImageUrl(auction.getImageUrl1());
        dto.setCurrentPrice(auction.getHighestBid() != null ? auction.getHighestBid().longValue() : auction.getStartPrice().longValue());
        dto.setStartAt(auction.getStartTime());
        dto.setEndAt(auction.getEndTime());
        dto.setOwnerId(null);

        return dto;
    }

    private Auction toEntity(AuctionDto dto) {
        Auction auction = new Auction();
        auction.setId(dto.getId());
        auction.setTitle(dto.getTitle());
        auction.setCategory(dto.getCategory());
        auction.setStatus(dto.getStatus());
        auction.setBrand(dto.getBrand());
        auction.setImageUrl1(dto.getImageUrl1());
        auction.setImageUrl2(dto.getImageUrl2());
        auction.setImageUrl3(dto.getImageUrl3());
        auction.setDescription(dto.getDescription());
        auction.setStartPrice(dto.getStartPrice());
        auction.setBuyNowPrice(dto.getBuyNowPrice());
        auction.setBidUnit(dto.getBidUnit());
        auction.setStartTime(dto.getStartTime());
        auction.setEndTime(dto.getEndTime());
        auction.setMinBidCount(dto.getMinBidCount());
        auction.setAutoExtend(dto.getAutoExtend());
        auction.setShippingFee(dto.getShippingFee());
        auction.setShippingType(dto.getShippingType());
        auction.setLocation(dto.getLocation());
        auction.setCreatedAt(dto.getCreatedAt());
        auction.setUpdatedAt(dto.getUpdatedAt());
        auction.setHighestBid(dto.getHighestBid());
        auction.setIsClosed(dto.getIsClosed());
        auction.setWinner(dto.getWinner());
        auction.setUserId(dto.getUserId());
        return auction;
    }

    @Override
    public AuctionDto createAuction(AuctionDto dto, MultipartFile imageFile) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                }
                String ext = Optional.ofNullable(imageFile.getOriginalFilename())
                    .filter(f -> f.contains("."))
                    .map(f -> f.substring(f.lastIndexOf(".")))
                    .orElse("");
                String uniqueName = UUID.randomUUID() + ext;
                Path path = Paths.get(uploadDir + uniqueName);
                Files.copy(imageFile.getInputStream(), path);
                imageUrl = "/uploads/" + uniqueName;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        dto.setImageUrl1(imageUrl);
        Auction auction = toEntity(dto);
        return toDto(auctionRepository.save(auction));
    }

    @Override
    public AuctionDto createAuction(AuctionDto dto) {
        return createAuction(dto, null);
    }

    @Override
    public List<AuctionDto> getAllAuctions() {
        return auctionRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public AuctionDto getAuctionById(Long id) {
        return auctionRepository.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    public AuctionDto updateAuction(Long id, AuctionDto dto) {
        return auctionRepository.findById(id).map(auction -> {
            auction.setTitle(dto.getTitle());
            auction.setCategory(dto.getCategory());
            auction.setStatus(dto.getStatus());
            auction.setBrand(dto.getBrand());
            auction.setImageUrl1(dto.getImageUrl1());
            auction.setImageUrl2(dto.getImageUrl2());
            auction.setImageUrl3(dto.getImageUrl3());
            auction.setDescription(dto.getDescription());
            auction.setStartPrice(dto.getStartPrice());
            auction.setBuyNowPrice(dto.getBuyNowPrice());
            auction.setBidUnit(dto.getBidUnit());
            auction.setStartTime(dto.getStartTime());
            auction.setEndTime(dto.getEndTime());
            auction.setMinBidCount(dto.getMinBidCount());
            auction.setAutoExtend(dto.getAutoExtend());
            auction.setShippingFee(dto.getShippingFee());
            auction.setShippingType(dto.getShippingType());
            auction.setLocation(dto.getLocation());
            auction.setUpdatedAt(LocalDateTime.now());
            auction.setHighestBid(dto.getHighestBid());
            auction.setIsClosed(dto.getIsClosed());
            auction.setWinner(dto.getWinner());
            return toDto(auctionRepository.save(auction));
        }).orElse(null);
    }

    @Override
    public void deleteAuction(Long id) {
        commentService.deleteAllByAuctionId(id);
        auctionRepository.deleteById(id);
    }

    @Override
    public AuctionDto checkAndCloseAuction(AuctionDto dto) {
        if (Boolean.TRUE.equals(dto.getIsClosed())) {
            dto.setStatus("종료");
            dto.setClosed(true);
        }
        return dto;
    }

    @Override
    public List<AuctionDto> getRandomAuctions(int count) {
        List<AuctionDto> all = getAllAuctions();
        Collections.shuffle(all);
        return all.stream().limit(count).collect(Collectors.toList());
    }

    @Override
    public void incrementViewCount(Long auctionId) {
        auctionRepository.findById(auctionId).ifPresent(a -> {
            a.setViewCount(a.getViewCount() != null ? a.getViewCount() + 1 : 1);
            auctionRepository.save(a);
        });
    }

    @Override
    public void incrementBidCount(Long auctionId) {
        auctionRepository.findById(auctionId).ifPresent(a -> {
            a.setBidCount(a.getBidCount() != null ? a.getBidCount() + 1 : 1);
            auctionRepository.save(a);
        });
    }

    @Override
    public List<AuctionDto> getAuctionsByUserId(Long userId) {
        return auctionRepository.findByUserId(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Lazy
    @Autowired
    private NotificationService notificationService;

    @Override
    public Auction buyNow(Long id, String buyerId) {
        return auctionRepository.findById(id).map(a -> {
            // 이미 종료된 경매인지 확인
            if (a.getIsClosed() != null && a.getIsClosed()) {
                throw new IllegalStateException("이미 종료된 경매입니다.");
            }
            
            // 판매자가 본인 상품을 구매하는지 확인
            if (a.getUserId() != null && String.valueOf(a.getUserId()).equals(buyerId)) {
                throw new IllegalStateException("자신의 상품은 구매할 수 없습니다.");
            }
            
            // Update auction details
            a.setHighestBid(a.getBuyNowPrice());
            a.setStatus("종료");
            a.setIsClosed(true);
            a.setWinner(buyerId); // Set the winner to the buyer
            
            // Save the updated auction
            Auction updatedAuction = auctionRepository.save(a);
            
            // Send notification to both buyer and seller
            if (notificationService != null) {
                try {
                    // Get seller ID
                    String sellerId = String.valueOf(a.getUserId());
                    
                    // Send notification to buyer
                    NotificationDto buyerNotice = new NotificationDto(
                        a.getId(),
                        a.getTitle(),
                        buyerId,
                        "BUY_NOW",
                        "✅ '" + a.getTitle() + "' 즉시구매가 완료되었습니다!"
                    );
                    notificationService.sendNotification(buyerId, buyerNotice);
                    
                    // Send notification to seller if not buying from themselves
                    if (!sellerId.equals(buyerId)) {
                        NotificationDto sellerNotice = new NotificationDto(
                            a.getId(),
                            a.getTitle(),
                            sellerId,
                            "SOLD",
                            "💰 '" + a.getTitle() + "' 상품이 즉시구매로 판매되었습니다. 구매자: " + buyerId
                        );
                        notificationService.sendNotification(sellerId, sellerNotice);
                    }
                } catch (Exception e) {
                    // Log the error but don't fail the operation
                    System.err.println("Error sending buy now notifications: " + e.getMessage());
                }
            }
            
            return updatedAuction;
        }).orElse(null);
    }

    @Override
    public Auction endAuction(Long id) {
        return auctionRepository.findById(id).map(a -> {
            a.setStatus("종료");
            a.setIsClosed(true);

            if (a.getWinner() == null) {
                String highestBidder = bidRepository.findByAuctionId(id)
                    .stream()
                    .findFirst()
                    .map(bid -> bid.getBidder())
                    .orElse(null);
                a.setWinner(highestBidder);
            }

            return auctionRepository.save(a);
        }).orElse(null);
    }

    @Override
    public String getBuyerNickname(Long buyerId) {
        return customAuctionRepository.getBuyerNickname(buyerId);
    }
}

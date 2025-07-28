package com.auction.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.auction.dto.AuctionDto;
import com.auction.entity.Auction;
import com.auction.repository.AuctionRepository;
import com.auction.repository.UserRepository;

@Service
public class AuctionServiceImpl implements AuctionService {
    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentService commentService;

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
        // seller(username) 세팅 추가
        if (auction.getUserId() != null) {
            userRepository.findById(auction.getUserId()).ifPresent(user -> dto.setSeller(user.getUsername()));
        }
        // 프론트엔드 호환성을 위한 필드 설정
        dto.setImageUrl(auction.getImageUrl1());
        dto.setCurrentPrice(auction.getHighestBid() != null ? auction.getHighestBid().longValue() : auction.getStartPrice().longValue());
        dto.setStartAt(auction.getStartTime());
        dto.setEndAt(auction.getEndTime());
        dto.setOwnerId(null); // 실제로는 owner 정보가 없음
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
        auction.setUserId(dto.getUserId()); // userId 세팅 추가
        return auction;
    }

    @Override
    public AuctionDto createAuction(AuctionDto auctionDto, MultipartFile imageFile) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // Ensure upload directory exists
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                }

                String originalFilename = imageFile.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
                Path filePath = Paths.get(uploadDir + uniqueFilename);
                Files.copy(imageFile.getInputStream(), filePath);
                imageUrl = "/uploads/" + uniqueFilename;
            } catch (IOException e) {
                // Proper error handling should be implemented here
                e.printStackTrace();
            }
        }

        auctionDto.setImageUrl1(imageUrl);
        Auction auction = toEntity(auctionDto);
        Auction saved = auctionRepository.save(auction);
        return toDto(saved);
    }

    @Override
    public AuctionDto createAuction(AuctionDto auctionDto) {
        return createAuction(auctionDto, null);
    }

    @Override
    public List<AuctionDto> getAllAuctions() {
        return auctionRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public AuctionDto getAuctionById(Long id) {
        Optional<Auction> auction = auctionRepository.findById(id);
        return auction.map(this::toDto).orElse(null);
    }

    @Override
    public AuctionDto updateAuction(Long id, AuctionDto auctionDto) {
        Optional<Auction> auctionOpt = auctionRepository.findById(id);
        if (auctionOpt.isPresent()) {
            Auction auction = auctionOpt.get();
            auction.setTitle(auctionDto.getTitle());
            auction.setCategory(auctionDto.getCategory());
            auction.setStatus(auctionDto.getStatus());
            auction.setBrand(auctionDto.getBrand());
            auction.setImageUrl1(auctionDto.getImageUrl1());
            auction.setImageUrl2(auctionDto.getImageUrl2());
            auction.setImageUrl3(auctionDto.getImageUrl3());
            auction.setDescription(auctionDto.getDescription());
            auction.setStartPrice(auctionDto.getStartPrice());
            auction.setBuyNowPrice(auctionDto.getBuyNowPrice());
            auction.setBidUnit(auctionDto.getBidUnit());
            auction.setStartTime(auctionDto.getStartTime());
            auction.setEndTime(auctionDto.getEndTime());
            auction.setMinBidCount(auctionDto.getMinBidCount());
            auction.setAutoExtend(auctionDto.getAutoExtend());
            auction.setShippingFee(auctionDto.getShippingFee());
            auction.setShippingType(auctionDto.getShippingType());
            auction.setLocation(auctionDto.getLocation());
            auction.setUpdatedAt(java.time.LocalDateTime.now());
            auction.setHighestBid(auctionDto.getHighestBid());
            auction.setIsClosed(auctionDto.getIsClosed());
            auction.setWinner(auctionDto.getWinner());
            Auction updated = auctionRepository.save(auction);
            return toDto(updated);
        }
        return null;
    }

    @Override
    public void deleteAuction(Long id) {
        // 경매의 모든 댓글 soft delete
        commentService.deleteAllByAuctionId(id);
        // 경매 삭제
        auctionRepository.deleteById(id);
    }

    @Override
    public AuctionDto checkAndCloseAuction(AuctionDto auctionDto) {
        // 경매 종료 조건 체크 및 상태 변경 예시
        if (auctionDto.getIsClosed() != null && auctionDto.getIsClosed()) {
            auctionDto.setStatus("종료");
            auctionDto.setClosed(true);
            // 실제 DB 반영 필요시 auctionRepository.save(...) 등 추가 가능
        }
        return auctionDto;
    }

    @Override
    public List<AuctionDto> getRandomAuctions(int count) {
        List<AuctionDto> all = getAllAuctions();
        Collections.shuffle(all);
        return all.stream().limit(count).collect(Collectors.toList());
    }
    
    @Override
    public void incrementViewCount(Long auctionId) {
        Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
        if (auctionOpt.isPresent()) {
            Auction auction = auctionOpt.get();
            Integer currentViewCount = auction.getViewCount();
            auction.setViewCount(currentViewCount != null ? currentViewCount + 1 : 1);
            auctionRepository.save(auction);
        }
    }
    
    @Override
    public void incrementBidCount(Long auctionId) {
        Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
        if (auctionOpt.isPresent()) {
            Auction auction = auctionOpt.get();
            Integer currentBidCount = auction.getBidCount();
            auction.setBidCount(currentBidCount != null ? currentBidCount + 1 : 1);
            auctionRepository.save(auction);
        }
    }

    @Override
    public List<AuctionDto> getAuctionsByUserId(Long userId) {
        List<Auction> auctions = auctionRepository.findByUserId(userId);
        return auctions.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void buyNow(Long id) {
        Optional<Auction> auctionOpt = auctionRepository.findById(id);
        if (auctionOpt.isPresent()) {
            Auction auction = auctionOpt.get();
            auction.setHighestBid(auction.getBuyNowPrice());
            auction.setStatus("종료");
            auction.setIsClosed(true);
            auctionRepository.save(auction);
        }
    }
}
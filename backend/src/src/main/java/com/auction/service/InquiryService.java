package com.auction.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.auction.dto.InquiryDto;
import com.auction.dto.NotificationDto;
import com.auction.repository.InquiryRepository;

@Service
public class InquiryService {
    private final InquiryRepository inquiryRepository;
    private final NotificationService notificationService;
    private final PrivateMessageService privateMessageService;

    public InquiryService(InquiryRepository inquiryRepository, NotificationService notificationService, PrivateMessageService privateMessageService) {
        this.inquiryRepository = inquiryRepository;
        this.notificationService = notificationService;
        this.privateMessageService = privateMessageService;
    }

    public void createInquiry(InquiryDto dto) {
        dto.setCreatedAt(LocalDateTime.now());
        if (dto.getStatus() == null) {
            dto.setStatus("pending"); // 기본값은 대기
        }
        if (dto.getPriority() == null) {
            dto.setPriority("normal"); // 기본값은 일반
        }
        inquiryRepository.save(dto);
    }

    public List<InquiryDto> getAllInquiries() {
        return inquiryRepository.findAll();
    }

    public List<InquiryDto> getUserInquiries(String userId) {
        return inquiryRepository.findByUserId(userId);
    }

    public List<InquiryDto> getInquiriesByCategory(String category) {
        return inquiryRepository.findByCategory(category);
    }

    public List<InquiryDto> getInquiriesByStatus(String status) {
        return inquiryRepository.findByStatus(status);
    }

    public List<InquiryDto> getInquiriesByPriority(String priority) {
        return inquiryRepository.findByPriority(priority);
    }

    public List<InquiryDto> getPendingInquiries() {
        return inquiryRepository.findPendingInquiries();
    }

    public List<InquiryDto> getUrgentInquiries() {
        return inquiryRepository.findUrgentInquiries();
    }

    public List<InquiryDto> searchInquiriesByTitle(String searchTerm) {
        return inquiryRepository.findByTitleContaining(searchTerm);
    }

    public List<InquiryDto> searchInquiriesByContent(String searchTerm) {
        return inquiryRepository.findByContentContaining(searchTerm);
    }

    public List<InquiryDto> searchInquiries(String searchTerm) {
        // 제목과 내용 모두에서 검색
        List<InquiryDto> titleResults = inquiryRepository.findByTitleContaining(searchTerm);
        List<InquiryDto> contentResults = inquiryRepository.findByContentContaining(searchTerm);
        
        // 중복 제거 (ID 기준)
        Map<Long, InquiryDto> uniqueResults = new HashMap<>();
        titleResults.forEach(inquiry -> uniqueResults.put(inquiry.getId(), inquiry));
        contentResults.forEach(inquiry -> uniqueResults.put(inquiry.getId(), inquiry));
        
        return uniqueResults.values().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    public InquiryDto getInquiry(Long id) {
        return inquiryRepository.findById(id);
    }

    public void answerInquiry(Long id, String answer, String answerer) {
        inquiryRepository.updateAnswer(id, answer, answerer);
        sendAnswerNotification(id, answer);
    }

    public void answerInquiry(Long id, String answer, String status, String answerer) {
        inquiryRepository.updateAnswerAndStatus(id, answer, status, answerer);
        sendAnswerNotification(id, answer);
    }

    public void updateStatus(Long id, String status) {
        inquiryRepository.updateStatus(id, status);
    }

    public void updatePriority(Long id, String priority) {
        inquiryRepository.updatePriority(id, priority);
    }

    public void deleteInquiry(Long id) {
        inquiryRepository.delete(id);
    }

    // 답변 알림 발송
    private void sendAnswerNotification(Long inquiryId, String answer) {
        InquiryDto inquiry = inquiryRepository.findById(inquiryId);
        if (inquiry != null && inquiry.getUserId() != null) {
            // 1. 실시간 알림
            NotificationDto notification = new NotificationDto(
                null, // auctionId 없음
                "1:1문의 답변",
                inquiry.getUserId(),
                "INQUIRY_ANSWER",
                String.format("'%s' 문의에 답변이 등록되었습니다.", inquiry.getTitle())
            );
            notificationService.saveAndNotify(notification);
            
            // 2. 쪽지
            privateMessageService.sendMessage(
                null, // auctionId 없음
                "admin", // 관리자 ID(고정)
                "관리자",
                inquiry.getUserId(),
                inquiry.getUserName() != null ? inquiry.getUserName() : "문의자",
                "1:1문의 답변",
                String.format("문의 제목: %s\n\n답변: %s", inquiry.getTitle(), answer)
            );
        }
    }

    // 통계 정보 반환
    public Map<String, Object> getInquiryStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalInquiries", inquiryRepository.findAll().size());
        stats.put("pendingInquiries", inquiryRepository.countPendingInquiries());
        stats.put("urgentInquiries", inquiryRepository.countUrgentInquiries());
        stats.put("averageResponseTime", inquiryRepository.getAverageResponseTime());
        
        // 상태별 통계
        Map<String, Long> statusStats = new HashMap<>();
        statusStats.put("pending", inquiryRepository.countByStatus("pending"));
        statusStats.put("in_progress", inquiryRepository.countByStatus("in_progress"));
        statusStats.put("answered", inquiryRepository.countByStatus("answered"));
        statusStats.put("closed", inquiryRepository.countByStatus("closed"));
        stats.put("statusStats", statusStats);
        
        // 우선순위별 통계
        Map<String, Long> priorityStats = new HashMap<>();
        priorityStats.put("low", inquiryRepository.countByPriority("low"));
        priorityStats.put("normal", inquiryRepository.countByPriority("normal"));
        priorityStats.put("high", inquiryRepository.countByPriority("high"));
        priorityStats.put("urgent", inquiryRepository.countByPriority("urgent"));
        stats.put("priorityStats", priorityStats);
        
        // 카테고리별 통계
        Map<String, Long> categoryStats = new HashMap<>();
        categoryStats.put("general", inquiryRepository.countByCategory("general"));
        categoryStats.put("technical", inquiryRepository.countByCategory("technical"));
        categoryStats.put("payment", inquiryRepository.countByCategory("payment"));
        categoryStats.put("delivery", inquiryRepository.countByCategory("delivery"));
        categoryStats.put("account", inquiryRepository.countByCategory("account"));
        categoryStats.put("complaint", inquiryRepository.countByCategory("complaint"));
        categoryStats.put("suggestion", inquiryRepository.countByCategory("suggestion"));
        stats.put("categoryStats", categoryStats);
        
        return stats;
    }
} 
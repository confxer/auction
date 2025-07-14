package com.auction.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.auction.dto.FAQDto;
import com.auction.repository.FAQRepository;

@Service
public class FAQService {
    private final FAQRepository faqRepository;

    public FAQService(FAQRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    public void createFAQ(FAQDto dto) {
        dto.setCreatedAt(LocalDateTime.now());
        dto.setViews(0); // 초기 조회수 0으로 설정
        if (dto.getStatus() == null) {
            dto.setStatus("published"); // 기본값을 published로 변경
        }
        if (dto.getAuthor() == null) {
            dto.setAuthor("관리자"); // 기본 작성자
        }
        if (dto.getCategory() == null) {
            dto.setCategory("general"); // 기본 카테고리
        }
        faqRepository.save(dto);
    }

    public List<FAQDto> getAllFAQs() {
        return faqRepository.findAll();
    }

    public List<FAQDto> getPublishedFAQs() {
        return faqRepository.findPublishedFAQs();
    }

    public List<FAQDto> getFAQsByCategory(String category) {
        return faqRepository.findByCategory(category);
    }

    public List<FAQDto> getFAQsByStatus(String status) {
        return faqRepository.findByStatus(status);
    }

    public List<FAQDto> searchFAQsByQuestion(String searchTerm) {
        return faqRepository.findByQuestionContaining(searchTerm);
    }

    public FAQDto getFAQ(Long id) {
        return faqRepository.findById(id);
    }

    public FAQDto getFAQAndIncrementViews(Long id) {
        FAQDto faq = faqRepository.findById(id);
        if (faq != null) {
            faqRepository.incrementViews(id);
            faq.setViews(faq.getViews() + 1);
        }
        return faq;
    }

    public void updateFAQ(FAQDto dto) {
        dto.setUpdatedAt(LocalDateTime.now());
        faqRepository.update(dto);
    }

    public void deleteFAQ(Long id) {
        faqRepository.delete(id);
    }

    public void publishFAQ(Long id) {
        FAQDto faq = faqRepository.findById(id);
        if (faq != null) {
            faq.setStatus("published");
            faq.setUpdatedAt(LocalDateTime.now());
            faqRepository.update(faq);
        }
    }

    public void unpublishFAQ(Long id) {
        FAQDto faq = faqRepository.findById(id);
        if (faq != null) {
            faq.setStatus("draft");
            faq.setUpdatedAt(LocalDateTime.now());
            faqRepository.update(faq);
        }
    }

    public void toggleImportant(Long id) {
        FAQDto faq = faqRepository.findById(id);
        if (faq != null) {
            faq.setImportant(!faq.isImportant());
            faq.setUpdatedAt(LocalDateTime.now());
            faqRepository.update(faq);
        }
    }

    // 통계 정보 반환
    public Map<String, Object> getFAQStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFAQs", faqRepository.findAll().size());
        stats.put("publishedFAQs", faqRepository.countByStatus("published"));
        stats.put("draftFAQs", faqRepository.countByStatus("draft"));
        stats.put("importantFAQs", faqRepository.countImportantFAQs());
        stats.put("totalViews", faqRepository.getTotalViews());
        
        // 카테고리별 통계
        Map<String, Long> categoryStats = new HashMap<>();
        categoryStats.put("auction", faqRepository.countByCategory("auction"));
        categoryStats.put("payment", faqRepository.countByCategory("payment"));
        categoryStats.put("delivery", faqRepository.countByCategory("delivery"));
        categoryStats.put("refund", faqRepository.countByCategory("refund"));
        categoryStats.put("account", faqRepository.countByCategory("account"));
        stats.put("categoryStats", categoryStats);
        
        return stats;
    }
} 
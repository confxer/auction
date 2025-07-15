package com.auction.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.auction.dto.NoticeDto;
import com.auction.repository.NoticeRepository;

@Service
public class NoticeService {
    private final NoticeRepository noticeRepository;

    public NoticeService(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    public void createNotice(NoticeDto dto) {
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
        noticeRepository.save(dto);
    }

    public List<NoticeDto> getAllNotices() {
        return noticeRepository.findAll();
    }

    public List<NoticeDto> getPublishedNotices() {
        return noticeRepository.findPublishedNotices();
    }

    public List<NoticeDto> getNoticesByCategory(String category) {
        return noticeRepository.findByCategory(category);
    }

    public List<NoticeDto> getNoticesByStatus(String status) {
        return noticeRepository.findByStatus(status);
    }

    public List<NoticeDto> searchNoticesByTitle(String searchTerm) {
        return noticeRepository.findByTitleContaining(searchTerm);
    }

    public NoticeDto getNotice(Long id) {
        return noticeRepository.findById(id);
    }

    public NoticeDto getNoticeAndIncrementViews(Long id) {
        NoticeDto notice = noticeRepository.findById(id);
        if (notice != null) {
            noticeRepository.incrementViews(id);
            notice.setViews(notice.getViews() + 1);
        }
        return notice;
    }

    public void updateNotice(NoticeDto dto) {
        dto.setUpdatedAt(LocalDateTime.now());
        noticeRepository.update(dto);
    }

    public void deleteNotice(Long id) {
        noticeRepository.delete(id);
    }

    public void publishNotice(Long id) {
        NoticeDto notice = noticeRepository.findById(id);
        if (notice != null) {
            notice.setStatus("published");
            notice.setUpdatedAt(LocalDateTime.now());
            noticeRepository.update(notice);
        }
    }

    public void unpublishNotice(Long id) {
        NoticeDto notice = noticeRepository.findById(id);
        if (notice != null) {
            notice.setStatus("draft");
            notice.setUpdatedAt(LocalDateTime.now());
            noticeRepository.update(notice);
        }
    }

    public void toggleImportant(Long id) {
        NoticeDto notice = noticeRepository.findById(id);
        if (notice != null) {
            notice.setImportant(!notice.isImportant());
            notice.setUpdatedAt(LocalDateTime.now());
            noticeRepository.update(notice);
        }
    }

    // 통계 정보 반환
    public Map<String, Object> getNoticeStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalNotices", noticeRepository.findAll().size());
        stats.put("publishedNotices", noticeRepository.countByStatus("published"));
        stats.put("draftNotices", noticeRepository.countByStatus("draft"));
        stats.put("importantNotices", noticeRepository.countImportantNotices());
        stats.put("totalViews", noticeRepository.getTotalViews());
        
        // 카테고리별 통계
        Map<String, Long> categoryStats = new HashMap<>();
        categoryStats.put("important", noticeRepository.countByCategory("important"));
        categoryStats.put("event", noticeRepository.countByCategory("event"));
        categoryStats.put("maintenance", noticeRepository.countByCategory("maintenance"));
        categoryStats.put("guide", noticeRepository.countByCategory("guide"));
        categoryStats.put("update", noticeRepository.countByCategory("update"));
        stats.put("categoryStats", categoryStats);
        
        return stats;
    }
} 
package com.auction.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.auction.dto.EventDto;
import com.auction.repository.EventRepository;

@Service
public class EventService {
    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public void createEvent(EventDto dto) {
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
        if (dto.getStartDate() == null) {
            dto.setStartDate(LocalDate.now()); // 기본 시작일
        }
        if (dto.getEndDate() == null) {
            dto.setEndDate(LocalDate.now().plusDays(30)); // 기본 종료일 (30일 후)
        }
        eventRepository.save(dto);
    }

    public List<EventDto> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<EventDto> getPublishedEvents() {
        return eventRepository.findPublishedEvents();
    }

    public List<EventDto> getOngoingEvents() {
        return eventRepository.findOngoingEvents();
    }

    public List<EventDto> getEventsByCategory(String category) {
        return eventRepository.findByCategory(category);
    }

    public List<EventDto> getEventsByStatus(String status) {
        return eventRepository.findByStatus(status);
    }

    public List<EventDto> searchEventsByTitle(String searchTerm) {
        return eventRepository.findByTitleContaining(searchTerm);
    }

    public EventDto getEvent(Long id) {
        return eventRepository.findById(id);
    }

    public EventDto getEventAndIncrementViews(Long id) {
        EventDto event = eventRepository.findById(id);
        if (event != null) {
            eventRepository.incrementViews(id);
            event.setViews(event.getViews() + 1);
        }
        return event;
    }

    public void updateEvent(EventDto dto) {
        dto.setUpdatedAt(LocalDateTime.now());
        eventRepository.update(dto);
    }

    public void deleteEvent(Long id) {
        eventRepository.delete(id);
    }

    public void publishEvent(Long id) {
        EventDto event = eventRepository.findById(id);
        if (event != null) {
            event.setStatus("published");
            event.setUpdatedAt(LocalDateTime.now());
            eventRepository.update(event);
        }
    }

    public void unpublishEvent(Long id) {
        EventDto event = eventRepository.findById(id);
        if (event != null) {
            event.setStatus("draft");
            event.setUpdatedAt(LocalDateTime.now());
            eventRepository.update(event);
        }
    }

    public void toggleImportant(Long id) {
        EventDto event = eventRepository.findById(id);
        if (event != null) {
            event.setImportant(!event.isImportant());
            event.setUpdatedAt(LocalDateTime.now());
            eventRepository.update(event);
        }
    }

    // 통계 정보 반환
    public Map<String, Object> getEventStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", eventRepository.findAll().size());
        stats.put("publishedEvents", eventRepository.countByStatus("published"));
        stats.put("draftEvents", eventRepository.countByStatus("draft"));
        stats.put("importantEvents", eventRepository.countImportantEvents());
        stats.put("totalViews", eventRepository.getTotalViews());
        
        // 카테고리별 통계
        Map<String, Long> categoryStats = new HashMap<>();
        categoryStats.put("promotion", eventRepository.countByCategory("promotion"));
        categoryStats.put("seasonal", eventRepository.countByCategory("seasonal"));
        categoryStats.put("thanksgiving", eventRepository.countByCategory("thanksgiving"));
        categoryStats.put("holiday", eventRepository.countByCategory("holiday"));
        categoryStats.put("special", eventRepository.countByCategory("special"));
        stats.put("categoryStats", categoryStats);
        
        return stats;
    }
} 
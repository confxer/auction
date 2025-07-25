package com.auction.service;

import com.auction.dto.InquiryDto;
import com.auction.entity.Inquiry;
import com.auction.repository.InquiryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InquiryServiceImpl implements InquiryService {

    private final InquiryRepository inquiryRepository;

    public InquiryServiceImpl(InquiryRepository inquiryRepository) {
        this.inquiryRepository = inquiryRepository;
    }

    @Override
    public InquiryDto createInquiry(InquiryDto dto) {
        Inquiry inquiry = toEntity(dto);
        inquiry.setStatus("대기");
        inquiry.setCreatedAt(LocalDateTime.now());
        return toDto(inquiryRepository.save(inquiry));
    }

    @Override
    public List<InquiryDto> getAllInquiries() {
        return inquiryRepository.findAll()
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InquiryDto getInquiry(Long id) {
        return inquiryRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("해당 문의가 존재하지 않습니다."));
    }

    @Override
    public void answerInquiry(Long id, String answer, String answerer) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 문의가 존재하지 않습니다."));
        inquiry.setAnswer(answer);
        inquiry.setAnswerer(answerer);
        inquiry.setAnsweredAt(LocalDateTime.now());
        inquiry.setStatus("완료");
        inquiry.setUpdatedAt(LocalDateTime.now());
        inquiryRepository.save(inquiry);
    }

    @Override
    public void updateStatus(Long id, String status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 문의가 존재하지 않습니다."));
        inquiry.setStatus(status);
        inquiry.setUpdatedAt(LocalDateTime.now());
        inquiryRepository.save(inquiry);
    }

    @Override
    public void deleteInquiry(Long id) {
        inquiryRepository.deleteById(id);
    }
    @Override
public List<InquiryDto> getMyInquiries(Long userId) {
    return inquiryRepository.findAll().stream()
            .filter(inquiry -> inquiry.getUserId().equals(String.valueOf(userId)))
            .map(this::toDto)
            .collect(Collectors.toList());
}


    // DTO <-> Entity 변환 메서드
    private InquiryDto toDto(Inquiry entity) {
        InquiryDto dto = new InquiryDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setUserName(entity.getUserName());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setCategory(entity.getCategory());
        dto.setPriority(entity.getPriority());
        dto.setStatus(entity.getStatus());
        dto.setAnswer(entity.getAnswer());
        dto.setAnswerer(entity.getAnswerer());
        dto.setAnsweredAt(entity.getAnsweredAt());
        dto.setAttachmentUrl(entity.getAttachmentUrl());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private Inquiry toEntity(InquiryDto dto) {
        Inquiry entity = new Inquiry();
        entity.setUserId(dto.getUserId());
        entity.setUserName(dto.getUserName());
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        entity.setCategory(dto.getCategory());
        entity.setPriority(dto.getPriority());
        entity.setAttachmentUrl(dto.getAttachmentUrl());
        return entity;
    }
}

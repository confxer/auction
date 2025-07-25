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

    // ✅ 1. 문의 등록
    @Override
    @Transactional
    public InquiryDto createInquiry(InquiryDto dto) {
        Inquiry inquiry = toEntity(dto);
        inquiry.setStatus("대기");
        inquiry.setCreatedAt(LocalDateTime.now());
        Inquiry saved = inquiryRepository.save(inquiry);
        return toDto(saved);
    }

    // ✅ 2. 전체 문의 목록 (관리자)
    @Override
    @Transactional(readOnly = true)
    public List<InquiryDto> getAllInquiries() {
        return inquiryRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ✅ 3. 단일 문의 조회
    @Override
    @Transactional(readOnly = true)
    public InquiryDto getInquiry(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 문의가 존재하지 않습니다."));
        return toDto(inquiry);
    }

    // ✅ 4. 답변 작성 (관리자)
    @Override
    @Transactional
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

    // ✅ 5. 문의 상태 변경
    @Override
    @Transactional
    public void updateStatus(Long id, String status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 문의가 존재하지 않습니다."));
        inquiry.setStatus(status);
        inquiry.setUpdatedAt(LocalDateTime.now());
        inquiryRepository.save(inquiry);
    }

    // ✅ 6. 문의 삭제
    @Override
    @Transactional
    public void deleteInquiry(Long id) {
        if (!inquiryRepository.existsById(id)) {
            throw new RuntimeException("삭제할 문의가 존재하지 않습니다.");
        }
        inquiryRepository.deleteById(id);
    }

    // ✅ 7. 내 문의 목록
    @Override
    @Transactional(readOnly = true)
    public List<InquiryDto> getMyInquiries(Long userId) {
        return inquiryRepository.findAll().stream()
                .filter(inquiry -> inquiry.getUserId().equals(String.valueOf(userId)))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ✅ Entity -> DTO 변환
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

    // ✅ DTO -> Entity 변환
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

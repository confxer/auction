package com.auction.service;

import java.util.List;

import com.auction.dto.InquiryDto;

public interface InquiryService {
    InquiryDto createInquiry(InquiryDto dto);
    List<InquiryDto> getAllInquiries();
    InquiryDto getInquiry(Long id);
    void answerInquiry(Long id, String answer, String answerer);
    void updateStatus(Long id, String status);
    void deleteInquiry(Long id);
    List<InquiryDto> getMyInquiries(Long userId);

}

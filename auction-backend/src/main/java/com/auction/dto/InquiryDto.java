package com.auction.dto;

import java.time.LocalDateTime;

public class InquiryDto {
    private Long id;
    private String userId;
    private String userName; // 사용자 이름
    private String title;
    private String content;
    private String category; // general, technical, payment, delivery, account, complaint, suggestion
    private String status; // pending, in_progress, answered, closed
    private String priority; // low, normal, high, urgent
    private String answer;
    private String answerer; // 답변자
    private LocalDateTime answeredAt; // 답변일시
    private String attachmentUrl; // 첨부파일 URL
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InquiryDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    
    public String getAnswerer() { return answerer; }
    public void setAnswerer(String answerer) { this.answerer = answerer; }
    
    public LocalDateTime getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(LocalDateTime answeredAt) { this.answeredAt = answeredAt; }
    
    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 
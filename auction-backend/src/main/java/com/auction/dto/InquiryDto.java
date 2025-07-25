package com.auction.dto;

import java.time.LocalDateTime;

public class InquiryDto {
    private Long id;
    private String userId;
    private String userName;
    private String title;
    private String content;
    private String category;
    private String priority;      // e.g., "normal", "high"
    private String answer;
    private String answerer;
    private LocalDateTime answeredAt;
    private String attachmentUrl;
    private String status;        // e.g., "대기", "완료"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InquiryDto() {}

    // ✨ Builder 준비용 생성자
    public InquiryDto(Long id, String userId, String userName, String title, String content,
                      String category, String priority, String answer, String answerer,
                      LocalDateTime answeredAt, String attachmentUrl, String status,
                      LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.title = title;
        this.content = content;
        this.category = category;
        this.priority = priority;
        this.answer = answer;
        this.answerer = answerer;
        this.answeredAt = answeredAt;
        this.attachmentUrl = attachmentUrl;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ✅ Getter & Setter
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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

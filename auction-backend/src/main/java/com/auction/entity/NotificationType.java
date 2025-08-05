package com.auction.entity;

public enum NotificationType {
    BID_PLACED("입찰 알림"),
    WIN("낙찰 알림"),
    LOSE("패찰 알림"),
    END("경매 종료"),
    SOLD("판매 완료"),
    BUY_NOW("즉시구매"),
    GENERAL("일반 알림");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

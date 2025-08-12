package com.auction.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayConfirmDto {
    private String paymentKey;
    private String orderId;
    private Long amount;
}
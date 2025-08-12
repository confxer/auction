package com.auction.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class PayConfirmDto {
    private String paymentKey;
    private String orderId;
    private Long amount;
}
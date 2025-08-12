package com.auction.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayValidDto {
    private String orderId;
    private Long amount;

    @Override
    public String toString(){
        return "orderId: " + orderId + ", amount: " +amount;  
    }
}
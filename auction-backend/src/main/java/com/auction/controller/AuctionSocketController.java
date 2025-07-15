package com.auction.controller;

import com.auction.dto.AuctionDto;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AuctionSocketController {

    // 메시지 받기: /app/bid
    // 메시지 브로드캐스트: /topic/auction-updates
    @MessageMapping("/bid")
    @SendTo("/topic/auction-updates")
    public AuctionDto broadcastBid(AuctionDto auctionDto) {
        return auctionDto; // 단순히 응답 브로드캐스트
    }
}

package com.auction.controller;

import com.auction.service.PayService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PayController {

    private final PayService payService;

    // PayPal 주문 생성
    @PostMapping("/create-order")
    public Mono<ResponseEntity<String>> createOrder(@RequestBody Map<String, Long> payload) {
        Long amount = payload.get("amount");
        return payService.createOrder(amount)
                .map(orderId -> ResponseEntity.ok(orderId))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().body(e.getMessage())));
    }

    // PayPal 주문 캡처 (결제 승인)
    @PostMapping("/capture-order")
    public Mono<ResponseEntity<JsonNode>> captureOrder(@RequestBody Map<String, String> payload) {
        String orderId = payload.get("orderId");
        return payService.captureOrder(orderId)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(500).build()));
    }
}
package com.auction.controller;

import com.auction.dto.PayConfirmDto;
import com.auction.dto.PayValidDto;
import com.auction.service.PayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PayController {

    private final PayService paymentService;

    // 결제 정보 사전 등록 및 검증
    @PostMapping("/validate")
    public ResponseEntity<Void> validatePayment(@RequestBody PayValidDto requestDto) {
        //System.out.println("11111111111111111111111111111111111111111111:" + requestDto.toString);
        paymentService.validateAndSavePayment(requestDto);
        return ResponseEntity.ok().build();
    }

    // 결제 승인
    @PostMapping("/confirm")
    public ResponseEntity<String> confirmPayment(@RequestBody PayConfirmDto requestDto) {
        // 클라이언트에서 받은 정보로 최종 승인 요청
        return ResponseEntity.ok(paymentService.confirmPayment(requestDto));
    }
}
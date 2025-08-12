package com.auction.service;

import com.auction.dto.PayConfirmDto;
import com.auction.dto.PayValidDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap; // 임시 저장소, 실제 프로덕션에서는 Redis나 DB 사용

@Service
@RequiredArgsConstructor
public class PayService {

    @Value("${toss.payments.secret-key}")
    private String secretKey;

    @Value("${toss.payments.confirm-url}")
    private String confirmUrl;

    private final WebClient webClient = WebClient.create();

    // 임시 저장소. 실제 환경에서는 절대 사용 금지.
    // ConcurrentHashMap은 스레드-안전하지만, 서버가 재시작되면 데이터가 소실된다.
    // 반드시 Redis, Memcached 또는 데이터베이스를 사용해야 한다.
    private final ConcurrentHashMap<String, Long> paymentAmountStorage = new ConcurrentHashMap<>();

    /**
     * 결제 요청 데이터 사전 저장 및 검증
     * @param requestDto (orderId, amount)
     */
    public void validateAndSavePayment(PayValidDto requestDto) {
        System.out.println("1111111111111111111111111111111111111111111111111111"+requestDto.getAmount());
        System.out.println("1111111111111111111111111111111111111111111111111111"+requestDto.getOrderId());
        if (requestDto.getAmount() <= 0) {
            throw new IllegalArgumentException("결제 금액은 0보다 커야 합니다.");
        }
        // DB나 Redis에 orderId를 키로, amount를 값으로 저장
        paymentAmountStorage.put(requestDto.getOrderId(), requestDto.getAmount());
    }

    /**
     * 결제 승인
     * @param requestDto (paymentKey, orderId, amount)
     * @return 최종 결제 정보
     */
    public String confirmPayment(PayConfirmDto requestDto) {
        // 1. 사전 저장된 결제 금액과 현재 요청된 결제 금액이 일치하는지 확인
        Long savedAmount = paymentAmountStorage.get(requestDto.getOrderId());
        if (savedAmount == null || !savedAmount.equals(requestDto.getAmount())) {
            // 금액이 다르거나, 사전 등록된 정보가 없으면 위변조 시도일 가능성이 높다.
            throw new IllegalArgumentException("결제 정보가 일치하지 않습니다.");
        }

        // 2. 토스페이먼츠에 결제 승인 요청
        String encodedAuth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));

        return webClient.post()
                .uri(confirmUrl)
                .header("Authorization", "Basic " + encodedAuth)
                .header("Content-Type", "application/json")
                .bodyValue(requestDto)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    clientResponse -> clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                        // 여기서 에러를 적절히 로깅하고 처리해야 한다.
                        System.err.println("Error from Toss Payments: " + errorBody);
                        return Mono.error(new RuntimeException("Toss Payments 승인 실패: " + errorBody));
                    })
                )
                .bodyToMono(String.class)
                .doOnSuccess(responseBody -> {
                    // 성공 시, DB에 결제 정보 최종 저장 및 주문 상태 업데이트
                    // 저장 후 임시 데이터는 삭제
                    paymentAmountStorage.remove(requestDto.getOrderId());
                    System.out.println("Payment Confirmed: " + responseBody);
                })
                .block(); // 비동기 응답을 동기적으로 기다린다.
    }
}
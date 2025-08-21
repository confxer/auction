package com.auction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.JsonNode; // JsonNode import

import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayService {

    @Value("${paypal.client-id}")
    private String clientId;

    @Value("${paypal.secret}")
    private String secret;

    @Value("${paypal.base-url}")
    private String baseUrl;

    private final WebClient webClient = WebClient.create();

    /**
     * PayPal Access Token을 발급받는 메서드
     * @return Access Token Mono
     */
    private Mono<String> getAccessToken() {
        String auth = Base64.getEncoder().encodeToString((clientId + ":" + secret).getBytes());
        return webClient.post()
                .uri(baseUrl + "/v1/oauth2/token")
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .bodyValue("grant_type=client_credentials")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(tokenResponse -> tokenResponse.get("access_token").asText());
    }

    /**
     * PayPal 주문 생성
     * @param amount 결제 금액
     * @return 생성된 PayPal 주문 ID
     */
    public Mono<String> createOrder(Long amount) {
        // 실제 프로덕션 코드에서는 amount 유효성 검증이 필요합니다.
        if (amount <= 0) {
            return Mono.error(new IllegalArgumentException("결제 금액은 0보다 커야 합니다."));
        }

        return getAccessToken().flatMap(token -> {
            Map<String, Object> purchaseUnit = Map.of(
                "amount", Map.of(
                    "currency_code", "USD", // PayPal은 KRW를 지원하지 않을 수 있으므로 USD로 설정 (테스트)
                    "value", amount.toString()
                )
            );
            Map<String, Object> requestBody = Map.of(
                "intent", "CAPTURE",
                "purchase_units", new Object[]{purchaseUnit}
            );

            return webClient.post()
                    .uri(baseUrl + "/v2/checkout/orders")
                    .header("Authorization", "Bearer " + token)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .map(response -> response.get("id").asText());
        });
    }

    /**
     * PayPal 주문 캡처 (결제 승인)
     * @param orderId 캡처할 주문 ID
     * @return 캡처 결과
     */
    public Mono<JsonNode> captureOrder(String orderId) {
        return getAccessToken().flatMap(token ->
            webClient.post()
                    .uri(baseUrl + "/v2/checkout/orders/" + orderId + "/capture")
                    .header("Authorization", "Bearer " + token)
                    .header("Content-Type", "application/json")
                    .retrieve()
                     // 에러 처리
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(new RuntimeException("PayPal Capture Failed: " + errorBody)))
                    )
                    .bodyToMono(JsonNode.class)
                    .doOnSuccess(response -> {
                        // 결제 성공!
                        // 1. 여기서 데이터베이스에 주문 상태를 '결제 완료'로 업데이트해야 합니다.
                        // 2. response 내용을 확인하여 결제가 정상적으로 완료되었는지 (status == "COMPLETED") 확인합니다.
                        System.out.println("Payment Capture Success: " + response.toString());
                    })
        );
    }
}
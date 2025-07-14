package com.auction.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 임시로 관리자 권한 체크 비활성화
        /*
        registry.addInterceptor(new AdminCheckInterceptor())
            .addPathPatterns(
                "/api/faq/admin", "/api/faq/admin/*",
                "/api/notice/admin", "/api/notice/admin/*",
                "/api/event/admin", "/api/event/admin/*",
                "/api/inquiry/admin", "/api/inquiry/admin/*"
            )
            .excludePathPatterns(
                "/api/auctions/**",  // 경매 API는 제외
                "/api/faq/published", "/api/faq/published/*",  // 공개 FAQ는 제외
                "/api/notice/published", "/api/notice/published/*",  // 공개 공지는 제외
                "/api/event/published", "/api/event/published/*"  // 공개 이벤트는 제외
            )
            .order(1);
        */
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /api/uploads/** → 실제 uploads 폴더 매핑
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:uploads/");
        // 기존 /uploads/**도 유지
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }

    // 관리자 전용 API에만 적용 (POST, PUT, DELETE)
    private static class AdminCheckInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            String method = request.getMethod();
            String uri = request.getRequestURI();
            
            // 경매 API는 건드리지 않음
            if (uri.startsWith("/api/auctions")) {
                return true;
            }
            
            // 공개 API는 건드리지 않음
            if (uri.contains("/published")) {
                return true;
            }
            
            // 관리자 API에서 POST, PUT, DELETE만 체크
            boolean isAdminApi = (
                uri.startsWith("/api/faq/admin") ||
                uri.startsWith("/api/notice/admin") ||
                uri.startsWith("/api/event/admin") ||
                uri.startsWith("/api/inquiry/admin")
            );
            
            if (isAdminApi && (method.equals("POST") || method.equals("PUT") || method.equals("DELETE"))) {
                String adminHeader = request.getHeader("X-ADMIN");
                if (!"true".equals(adminHeader)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("관리자만 가능합니다.");
                    return false;
                }
            }
            return true;
        }
    }
}

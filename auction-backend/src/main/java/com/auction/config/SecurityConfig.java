package com.auction.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.auction.util.JwtUtil;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtUtil jwtUtil;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 🔓 인증 없이 접근 가능한 URL
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(
                    "/actuator/**",
                    "/api/public/**", 
                    "/api/auctions", 
                    "/api/auctions/*", 
                    "/api/auctions/*/view", 
                    "/api/bids/**", 
                    "/ws-auction/**", 
                    "/api/dashboard", 
                    "/api/sample-data",
                    "/api/uploads/**",
                    "/api/users/check-nickname"
                ).permitAll()

                // 🔐 관리자 전용 접근
                .requestMatchers("/actuator/**").hasAuthority("ADMIN")
                .requestMatchers("/api/event/admin/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/inquiry/*/answer").hasAuthority("ADMIN") // ✅ 관리자 답변 등록
                .requestMatchers("/api/inquiry/admin/**").hasAuthority("ADMIN") // ✅ 관리자 전용 목록 등

                // 🧑 사용자/관리자 공용 API
                .requestMatchers(
                    "/api/favorites/**", 
                    "/api/auctions/**", 
                    "/api/inquiry/**",  // 일반 사용자도 가능
                    "/api/comments/**", 
                    "/api/notifications/**", 
                    "/api/private-message/**"
                ).hasAnyAuthority("USER", "ADMIN")

                // 📢 이벤트 관련 공개 API
                .requestMatchers(
                    "/api/event/published",
                    "/api/event/published/**",
                    "/api/event/ongoing",
                    "/api/event/category/**",
                    "/api/event/search"
                ).permitAll()

                // 🔒 그 외 모든 요청은 인증 필요
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

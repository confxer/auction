package com.auction.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.auction.dto.UserDto;
import com.auction.entity.User;

public interface UserService {
    User register(UserDto userDto);
    User login(String usernameOrEmail, String password);
    Optional<User> authenticate(String usernameOrEmail, String password);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    
    // 🔐 인증 관련 메서드
    UserDto save(UserDto userDto);
    UserDto findByUsernameDto(String username);
    UserDto findByEmailDto(String email);
    UserDto findByEmailVerificationToken(String token);
    UserDto findById(Long id);
    
    // 🔄 Refresh Token 관련
    void updateRefreshToken(Long userId, String refreshToken);
    void clearRefreshToken(String username);
    
    // 📊 로그인 이력 관련
    void updateLastLogin(Long userId, String ip);
    void verifyEmail(Long userId);
    void updateEmailVerificationToken(Long userId, String token);
    
    // 👥 사용자 관리 (관리자용)
    List<UserDto> findAll();
    UserDto updateRole(Long userId, String role);
    UserDto updateStatus(Long userId, Boolean isActive);
    Map<String, Object> getSystemStats();
} 
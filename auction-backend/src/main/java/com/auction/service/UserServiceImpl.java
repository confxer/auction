package com.auction.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.auction.dto.UserDto;
import com.auction.entity.User;
import com.auction.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public User register(UserDto userDto) {
        User user = new User();
        user.setUsername(userDto.getUsername());
        // 평문 비밀번호로 저장
        user.setPassword(userDto.getPassword());
        user.setEmail(userDto.getEmail());
        user.setRole("USER"); // 기본값 USER
        return userRepository.save(user);
    }

    @Override
    public User login(String username, String password) {
        java.util.Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        User user = userOpt.get();
        // 평문 비밀번호 비교
        if (!password.equals(user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        return user;
    }

    @Override
    public Optional<User> authenticate(String usernameOrEmail, String password) {
        // 사용자명 또는 이메일로 사용자 찾기
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(usernameOrEmail);
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // 평문 비밀번호 비교
            if (password.equals(user.getPassword())) {
                return userOpt;
            }
        }
        
        return Optional.empty();
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // 🔐 인증 관련 메서드 구현
    @Override
    public UserDto save(UserDto userDto) {
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        // 비밀번호를 BCrypt로 암호화하여 저장
        user.setPassword(userDto.getPassword());
        user.setNickname(userDto.getNickname());
        user.setAddress(userDto.getAddress());
        user.setPhone(userDto.getPhone());
        user.setSocialType(userDto.getSocialType());
        user.setRole(userDto.getRole());
        user.setIsActive(userDto.getIsActive());
        user.setEmailVerified(userDto.getEmailVerified());
        user.setEmailVerificationToken(userDto.getEmailVerificationToken());
        user.setEmailVerificationExpiry(userDto.getEmailVerificationExpiry());
        user.setRefreshToken(userDto.getRefreshToken());
        user.setRefreshTokenExpiry(userDto.getRefreshTokenExpiry());
        user.setLastLoginAt(userDto.getLastLoginAt());
        user.setLastLoginIp(userDto.getLastLoginIp());
        
        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    @Override
    public UserDto findByUsernameDto(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.map(this::convertToDto).orElse(null);
    }

    @Override
    public UserDto findByEmailDto(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.map(this::convertToDto).orElse(null);
    }

    @Override
    public UserDto findByEmailVerificationToken(String token) {
        Optional<User> userOpt = userRepository.findByEmailVerificationToken(token);
        return userOpt.map(this::convertToDto).orElse(null);
    }

    @Override
    public UserDto findById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        return userOpt.map(this::convertToDto).orElse(null);
    }

    // 🔄 Refresh Token 관련 메서드 구현
    @Override
    public void updateRefreshToken(Long userId, String refreshToken) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRefreshToken(refreshToken);
            user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
            userRepository.save(user);
        }
    }

    @Override
    public void clearRefreshToken(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
        }
    }

    // 📊 로그인 이력 관련 메서드 구현
    @Override
    public void updateLastLogin(Long userId, String ip) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginIp(ip);
            userRepository.save(user);
        }
    }

    @Override
    public void verifyEmail(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationExpiry(null);
            userRepository.save(user);
        }
    }

    @Override
    public void updateEmailVerificationToken(Long userId, String token) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEmailVerificationToken(token);
            user.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);
        }
    }

    // 👥 사용자 관리 (관리자용) 메서드 구현
    @Override
    public List<UserDto> findAll() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public UserDto updateRole(Long userId, String role) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(role);
            User savedUser = userRepository.save(user);
            return convertToDto(savedUser);
        }
        return null;
    }

    @Override
    public UserDto updateStatus(Long userId, Boolean isActive) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(isActive);
            User savedUser = userRepository.save(user);
            return convertToDto(savedUser);
        }
        return null;
    }

    @Override
    public Map<String, Object> getSystemStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long todayLogins = userRepository.countByLastLoginAtAfter(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0));
        
        return Map.of(
            "totalUsers", totalUsers,
            "activeUsers", activeUsers,
            "todayLogins", todayLogins,
            "totalAuctions", 0L // TODO: AuctionRepository에서 가져오기
        );
    }

    // 🔄 Entity <-> DTO 변환 메서드
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPassword(user.getPassword());
        dto.setNickname(user.getNickname());
        dto.setAddress(user.getAddress());
        dto.setPhone(user.getPhone());
        dto.setSocialType(user.getSocialType());
        dto.setIsActive(user.getIsActive());
        dto.setRole(user.getRole());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setEmailVerificationToken(user.getEmailVerificationToken());
        dto.setEmailVerificationExpiry(user.getEmailVerificationExpiry());
        dto.setRefreshToken(user.getRefreshToken());
        dto.setRefreshTokenExpiry(user.getRefreshTokenExpiry());
        dto.setLastLoginAt(user.getLastLoginAt());
        dto.setLastLoginIp(user.getLastLoginIp());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
} 
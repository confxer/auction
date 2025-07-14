package com.auction.service;

import com.auction.entity.LoginHistory;
import com.auction.entity.User;
import com.auction.repository.LoginHistoryRepository;
import com.auction.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class LoginHistoryService {

    @Autowired
    private LoginHistoryRepository loginHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;

    public void recordLoginAttempt(String username, String ip, String userAgent, String status, String failureReason) {
        LoginHistory loginHistory = new LoginHistory();
        
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            loginHistory.setUser(user);
        }
        
        loginHistory.setLoginAt(LocalDateTime.now());
        loginHistory.setLoginIp(ip);
        loginHistory.setUserAgent(userAgent);
        loginHistory.setStatus(status);
        loginHistory.setFailureReason(failureReason);
        
        loginHistoryRepository.save(loginHistory);
    }

    public List<LoginHistory> getUserLoginHistory(Long userId) {
        return loginHistoryRepository.findByUserIdOrderByLoginAtDesc(userId);
    }

    public List<LoginHistory> getRecentLoginHistory(int limit) {
        return loginHistoryRepository.findTop10ByOrderByLoginAtDesc();
    }

    public long getFailedLoginAttempts(String username, LocalDateTime since) {
        return loginHistoryRepository.countByUsernameAndStatusAndLoginAtAfter(username, "FAILED", since);
    }

    public Map<String, Object> getFailedLoginStats() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        long failedAttempts24h = loginHistoryRepository.countByStatusAndLoginAtAfter("FAILED", last24Hours);
        
        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
        long failedAttempts7d = loginHistoryRepository.countByStatusAndLoginAtAfter("FAILED", last7Days);
        
        return Map.of(
            "failedAttempts24h", failedAttempts24h,
            "failedAttempts7d", failedAttempts7d,
            "last24Hours", last24Hours,
            "last7Days", last7Days
        );
    }
} 
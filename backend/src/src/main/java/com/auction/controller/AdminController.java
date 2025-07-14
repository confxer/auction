package com.auction.controller;

import com.auction.dto.UserDto;
import com.auction.entity.LoginHistory;
import com.auction.service.UserService;
import com.auction.service.LoginHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private LoginHistoryService loginHistoryService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> req) {
        String role = req.get("role");
        if (role == null || (!role.equals("USER") && !role.equals("ADMIN"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "유효하지 않은 역할입니다."));
        }
        
        UserDto updatedUser = userService.updateRole(id, role);
        if (updatedUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> req) {
        Boolean isActive = req.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "활성 상태가 필요합니다."));
        }
        
        UserDto updatedUser = userService.updateStatus(id, isActive);
        if (updatedUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/login-history")
    public ResponseEntity<List<LoginHistory>> getLoginHistory() {
        List<LoginHistory> history = loginHistoryService.getRecentLoginHistory(50);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/login-history/user/{userId}")
    public ResponseEntity<List<LoginHistory>> getUserLoginHistory(@PathVariable Long userId) {
        List<LoginHistory> history = loginHistoryService.getUserLoginHistory(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = userService.getSystemStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/failed-logins")
    public ResponseEntity<Map<String, Object>> getFailedLoginStats() {
        Map<String, Object> stats = loginHistoryService.getFailedLoginStats();
        return ResponseEntity.ok(stats);
    }
} 
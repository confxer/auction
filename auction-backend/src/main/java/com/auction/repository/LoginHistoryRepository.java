package com.auction.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.auction.entity.LoginHistory;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    @Query("SELECT lh FROM LoginHistory lh WHERE lh.user.id = :userId ORDER BY lh.loginAt DESC")
    List<LoginHistory> findByUserIdOrderByLoginAtDesc(@Param("userId") Long userId);

    @Query("SELECT lh FROM LoginHistory lh ORDER BY lh.loginAt DESC LIMIT 10")
    List<LoginHistory> findTop10ByOrderByLoginAtDesc();

    @Query("SELECT COUNT(lh) FROM LoginHistory lh WHERE lh.user.username = :username AND lh.status = :status AND lh.loginAt > :since")
    long countByUsernameAndStatusAndLoginAtAfter(@Param("username") String username, 
                                                @Param("status") String status, 
                                                @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(lh) FROM LoginHistory lh WHERE lh.status = :status AND lh.loginAt > :since")
    long countByStatusAndLoginAtAfter(@Param("status") String status, 
                                     @Param("since") LocalDateTime since);
} 
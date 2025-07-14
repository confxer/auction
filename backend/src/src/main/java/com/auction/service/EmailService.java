package com.auction.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("[경매 시스템] 이메일 인증");
        message.setText("안녕하세요!\n\n" +
                "경매 시스템 회원가입을 완료하려면 아래 링크를 클릭해주세요:\n\n" +
                "http://localhost:5173/verify-email?token=" + token + "\n\n" +
                "이 링크는 24시간 후에 만료됩니다.\n\n" +
                "감사합니다.");
        
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("[경매 시스템] 비밀번호 재설정");
        message.setText("안녕하세요!\n\n" +
                "비밀번호 재설정을 요청하셨습니다.\n\n" +
                "아래 링크를 클릭하여 새 비밀번호를 설정해주세요:\n\n" +
                "http://localhost:5173/reset-password?token=" + token + "\n\n" +
                "이 링크는 1시간 후에 만료됩니다.\n\n" +
                "요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.\n\n" +
                "감사합니다.");
        
        mailSender.send(message);
    }
} 
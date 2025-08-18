// package com.auction.service;

// import java.util.Random;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.mail.SimpleMailMessage;
// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.stereotype.Service;

// @Service
// public class EmailService {
//     private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

//     @Autowired
//     private JavaMailSender mailSender;

//     public String sendVerificationEmail(String email) {
//         // 6자리 인증 코드 생성
//         String verificationCode = generateVerificationCode();
        
//         SimpleMailMessage message = new SimpleMailMessage();
//         message.setTo(email);
//         message.setSubject("[경매 시스템] 이메일 인증 코드");
//         message.setText("안녕하세요!\n\n" +
//                 "이메일 인증을 위한 인증 코드입니다:\n\n" +
//                 "인증 코드: " + verificationCode + "\n\n" +
//                 "이 코드는 10분 후에 만료됩니다.\n\n" +
//                 "감사합니다.");
        
//         try {
//             mailSender.send(message);
//             logger.info("인증 코드 이메일 발송 성공: {}", email);
//         } catch (Exception e) {
//             logger.error("인증 코드 이메일 발송 실패: {}, 오류: {}", email, e.getMessage());
//             // 개발용: 콘솔에 인증 코드 출력
//             logger.info("=== 개발용 인증 코드 (콘솔 출력) ===");
//             logger.info("이메일: {}", email);
//             logger.info("인증 코드: {}", verificationCode);
//             logger.info("================================");
//         }
        
//         return verificationCode;
//     }

//     public void sendVerificationEmail(String email, String token) {
//         SimpleMailMessage message = new SimpleMailMessage();
//         message.setTo(email);
//         message.setSubject("[경매 시스템] 이메일 인증");
//         message.setText("안녕하세요!\n\n" +
//                 "경매 시스템 회원가입을 완료하려면 아래 링크를 클릭해주세요:\n\n" +
//                 "http://auction-react-bucket-20250804-prj.s3-website.ap-northeast-2.amazonaws.com/verify-email?token=" + token + "\n\n" +
//                 "이 링크는 24시간 후에 만료됩니다.\n\n" +
//                 "감사합니다.");
        
//         try {
//             mailSender.send(message);
//             logger.info("이메일 인증 메일 발송 성공: {}", email);
//         } catch (Exception e) {
//             logger.error("이메일 인증 메일 발송 실패: {}, 오류: {}", email, e.getMessage());
//             // 개발용: 콘솔에 인증 토큰 출력
//             logger.info("=== 개발용 인증 토큰 (콘솔 출력) ===");
//             logger.info("이메일: {}", email);
//             logger.info("인증 토큰: {}", token);
//             logger.info("인증 URL: http://auction-react-bucket-20250804-prj.s3-website.ap-northeast-2.amazonaws.com/verify-email?token=" + token);
//             logger.info("=====================================");
//         }
//     }

//     public void sendPasswordResetEmail(String email, String token) {
//         SimpleMailMessage message = new SimpleMailMessage();
//         message.setTo(email);
//         message.setSubject("[경매 시스템] 비밀번호 재설정");
//         message.setText("안녕하세요!\n\n" +
//                 "비밀번호 재설정을 요청하셨습니다.\n\n" +
//                 "아래 링크를 클릭하여 새 비밀번호를 설정해주세요:\n\n" +
//                 "http://auction-react-bucket-20250804-prj.s3-website.ap-northeast-2.amazonaws.com/reset-password?token=" + token + "\n\n" +
//                 "이 링크는 1시간 후에 만료됩니다.\n\n" +
//                 "요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.\n\n" +
//                 "감사합니다.");
        
//         try {
//             mailSender.send(message);
//             logger.info("비밀번호 재설정 메일 발송 성공: {}", email);
//         } catch (Exception e) {
//             logger.error("비밀번호 재설정 메일 발송 실패: {}, 오류: {}", email, e.getMessage());
//         }
//     }

//     private String generateVerificationCode() {
//         Random random = new Random();
//         StringBuilder code = new StringBuilder();
//         for (int i = 0; i < 6; i++) {
//             code.append(random.nextInt(10));
//         }
//         return code.toString();
//     }
// } 
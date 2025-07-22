package com.auction.service;

import com.auction.entity.Report;
import com.auction.repository.ReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ReportService {
    private final ReportRepository reportRepository;
    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Transactional
    public void submitReport(Report report) {
        if (report.getAuctionId() == null || report.getReporter() == null || report.getReason() == null) {
            throw new IllegalArgumentException("필수값 누락");
        }
        report.setStatus("PENDING");
        reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @Transactional
    public void updateReportStatus(Long id, String status) {
        if (!("APPROVED".equals(status) || "REJECTED".equals(status))) {
            throw new IllegalArgumentException("잘못된 상태값");
        }
        reportRepository.updateStatus(id, status);
    }
}

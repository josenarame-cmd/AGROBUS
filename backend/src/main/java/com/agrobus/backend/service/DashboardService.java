package com.agrobus.backend.service;

import com.agrobus.backend.dto.DashboardDTO;
import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.entity.Loan;
import com.agrobus.backend.entity.Agent;
import com.agrobus.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FarmerRepository farmerRepository;
    private final LoanRepository loanRepository;
    private final AgentRepository agentRepository;
    private final AgriculturalInputRepository inputRepository;
    private final RepaymentRepository repaymentRepository;
    private final NotificationRepository notificationRepository;

    public DashboardDTO getDashboardData() {
        // Loan trends by month
        List<Map<String, Object>> loanTrends = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<Object[]> trendData = loanRepository.getLoanTrendsByMonth();
        for (Object[] row : trendData) {
            Map<String, Object> item = new HashMap<>();
            int monthIndex = ((Number) row[0]).intValue() - 1;
            item.put("month", months[monthIndex]);
            item.put("count", ((Number) row[1]).longValue());
            loanTrends.add(item);
        }

        // Repayment trends
        List<Map<String, Object>> repaymentTrends = new ArrayList<>();
        List<Object[]> repData = repaymentRepository.getRepaymentTrendsByMonth();
        for (Object[] row : repData) {
            Map<String, Object> item = new HashMap<>();
            int monthIndex = ((Number) row[0]).intValue() - 1;
            item.put("month", months[monthIndex]);
            item.put("amount", row[1]);
            repaymentTrends.add(item);
        }

        // Loans by status
        List<Map<String, Object>> loansByStatus = new ArrayList<>();
        List<Object[]> statusData = loanRepository.getLoanCountByStatus();
        for (Object[] row : statusData) {
            Map<String, Object> item = new HashMap<>();
            item.put("status", row[0].toString());
            item.put("count", ((Number) row[1]).longValue());
            loansByStatus.add(item);
        }

        // Stock by category
        List<Map<String, Object>> stockByCategory = new ArrayList<>();
        List<Object[]> stockData = inputRepository.getStockByCategory();
        for (Object[] row : stockData) {
            Map<String, Object> item = new HashMap<>();
            item.put("category", row[0].toString());
            item.put("quantity", ((Number) row[1]).longValue());
            stockByCategory.add(item);
        }

        // Recent activities from notifications
        List<Map<String, Object>> recentActivities = new ArrayList<>();
        notificationRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10))
                .forEach(n -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", n.getId());
                    item.put("title", n.getTitle());
                    item.put("message", n.getMessage());
                    item.put("type", n.getType());
                    item.put("createdAt", n.getCreatedAt());
                    recentActivities.add(item);
                });

        return DashboardDTO.builder()
                .totalFarmers(farmerRepository.count())
                .activeFarmers(farmerRepository.countByStatus(Farmer.Status.ACTIVE))
                .totalAgents(agentRepository.count())
                .activeAgents(agentRepository.countByStatus(Agent.Status.ACTIVE))
                .totalLoans(loanRepository.count())
                .pendingLoans(loanRepository.countByStatus(Loan.LoanStatus.PENDING))
                .approvedLoans(loanRepository.countByStatus(Loan.LoanStatus.APPROVED))
                .repaidLoans(loanRepository.countByStatus(Loan.LoanStatus.REPAID))
                .deliveredLoans(loanRepository.countByStatus(Loan.LoanStatus.DELIVERED))
                .rejectedLoans(loanRepository.countByStatus(Loan.LoanStatus.REJECTED))
                .totalDisbursed(loanRepository.getTotalApprovedAmount())
                .totalRepaid(loanRepository.getTotalRepaidAmount())
                .outstandingBalance(loanRepository.getTotalOutstandingBalance())
                .totalInputsDistributed(inputRepository.getTotalDistributed())
                .lowStockItems(inputRepository.findLowStockInputs().size())
                .loanTrends(loanTrends)
                .repaymentTrends(repaymentTrends)
                .loansByStatus(loansByStatus)
                .stockByCategory(stockByCategory)
                .recentActivities(recentActivities)
                .build();
    }
}

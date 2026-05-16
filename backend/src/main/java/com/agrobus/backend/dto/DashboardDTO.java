package com.agrobus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardDTO {
    private long totalFarmers;
    private long activeFarmers;
    private long totalAgents;
    private long activeAgents;
    private long totalLoans;
    private long pendingLoans;
    private long approvedLoans;
    private long repaidLoans;
    private long deliveredLoans;
    private long rejectedLoans;
    private BigDecimal totalDisbursed;
    private BigDecimal totalRepaid;
    private BigDecimal outstandingBalance;
    private long totalInputsDistributed;
    private long lowStockItems;
    private List<Map<String, Object>> loanTrends;
    private List<Map<String, Object>> repaymentTrends;
    private List<Map<String, Object>> loansByStatus;
    private List<Map<String, Object>> stockByCategory;
    private List<Map<String, Object>> recentActivities;
}

package com.agrobus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Personal financial summary returned to a logged-in FARMER.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerDashboardDTO {

    private Long farmerId;
    private String fullName;
    private Integer creditScore;
    private String district;
    private String cropType;

    private long totalLoans;
    private long pendingLoans;
    private long approvedLoans;
    private long deliveredLoans;
    private long repaidLoans;
    private long rejectedLoans;

    private BigDecimal totalBorrowed;
    private BigDecimal totalRepaid;
    private BigDecimal outstandingBalance;

    private long totalFarms;
}

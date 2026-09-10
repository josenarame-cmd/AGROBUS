package com.agrobus.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    @JsonIgnoreProperties({"agent", "hibernateLazyInitializer"})
    private Farmer farmer;

    @NotBlank
    private String cropType;

    @NotBlank
    private String requestedInputs;

    private Double quantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal estimatedCost;

    private Double farmSize;

    private String season;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanStatus status;

    @Column(precision = 12, scale = 2)
    private BigDecimal amountRepaid;

    @Column(precision = 12, scale = 2)
    private BigDecimal remainingBalance;

    private String rejectionReason;

    @Column(updatable = false)
    private LocalDateTime requestDate;

    private LocalDateTime approvalDate;
    private LocalDateTime deliveryDate;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = LoanStatus.PENDING;
        if (amountRepaid == null) amountRepaid = BigDecimal.ZERO;
        if (remainingBalance == null && estimatedCost != null) remainingBalance = estimatedCost;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum LoanStatus { PENDING, APPROVED, REJECTED, DELIVERED, REPAID }
}

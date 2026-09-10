package com.agrobus.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "farmers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String fullName;

    @NotBlank
    @Column(unique = true)
    private String nationalId;

    @NotBlank
    @Column(unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @NotBlank
    private String district;

    private String sector;

    private Double farmSize;

    private String cropType;

    private Integer creditScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    /**
     * Optional link to the User account that owns this farmer profile.
     * Set when a FARMER user self-registers or when an admin links an existing
     * User account to a Farmer record. Allows the authenticated FARMER to
     * look up their own Farmer record by userId.
     */
    @Column(name = "user_id")
    private Long userId;

    /**
     * The field agent responsible for this farmer.
     * Ignore the back-reference list on Agent to avoid infinite recursion.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    @JsonIgnoreProperties({"assignedFarmers", "user", "hibernateLazyInitializer"})
    private Agent agent;

    @Column(updatable = false)
    private LocalDateTime registrationDate;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        registrationDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = Status.ACTIVE;
        if (creditScore == null) creditScore = 500;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Credit score helpers ────────────────────────────────────────────────

    private static final int SCORE_REPAYMENT_BONUS  =  10;
    private static final int SCORE_REJECTION_PENALTY = 20;
    private static final int SCORE_MIN = 300;
    private static final int SCORE_MAX = 850;

    public void applyRepaymentBonus() {
        creditScore = Math.min(SCORE_MAX, (creditScore == null ? 500 : creditScore) + SCORE_REPAYMENT_BONUS);
    }

    public void applyRejectionPenalty() {
        creditScore = Math.max(SCORE_MIN, (creditScore == null ? 500 : creditScore) - SCORE_REJECTION_PENALTY);
    }

    public enum Gender { MALE, FEMALE, OTHER }
    public enum Status { ACTIVE, INACTIVE }
}

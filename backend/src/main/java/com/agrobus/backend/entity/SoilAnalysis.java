package com.agrobus.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "soil_analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoilAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farmer_user_id", nullable = false)
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id")
    private Farm farm;

    @Column(nullable = false)
    private String sampleId;

    private String imageReference;

    private String soilType;
    private Double confidence;
    private String confidenceLevel;
    private Boolean reviewRequired;
    private String reviewStatus;
    private String reviewerResult;
    private String reviewerNotes;

    private String district;
    private String sector;
    private Double latitude;
    private Double longitude;

    private String season;
    private String currentCrop;
    private String previousCrop;
    private String plannedCrop;
    private String notes;

    @Column(length = 1000)
    private String disclaimer;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

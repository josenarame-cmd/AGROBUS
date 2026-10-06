package com.agrobus.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "crops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Crop {

    public enum CropStatus {
        PLANNED, PLANTED, GROWING, HARVESTED, SOLD, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // A crop belongs to a specific farm plot
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    // Explicitly link the crop back to the Farmer (User ID) for fast ownership checks
    @Column(name = "owner_user_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String cropType;

    private String variety;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CropStatus status;

    private Double areaPlantedHectares;

    private LocalDate expectedPlantingDate;
    private LocalDate actualPlantingDate;

    private LocalDate expectedHarvestDate;
    private LocalDate actualHarvestDate;

    // Harvest yield in KG
    private Double yieldKg;
    
    // Any relevant notes or tags
    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = CropStatus.PLANNED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

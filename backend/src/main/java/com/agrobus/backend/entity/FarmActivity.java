package com.agrobus.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmActivity {

    public enum ActivityType {
        SOIL_PREP, PLANTING, WEEDING, FERTILIZER, PEST_OBSERVATION, DISEASE_OBSERVATION, HARVESTING, OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType activityType;

    @Column(nullable = false)
    private LocalDate activityDate;

    private String description;

    private Double cost; // Associated cost with the activity
    private Double quantityUsed; // e.g. Kg of fertilizer
    private String unit;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

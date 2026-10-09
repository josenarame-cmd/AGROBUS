package com.agrobus.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "crop_recommendation_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropRecommendationRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String crop;

    private String suitableSoilTypes;
    private String locationConditions;
    private String season;
    private String waterRequirements;

    @ManyToOne
    @JoinColumn(name = "knowledge_source_id")
    private AgriculturalKnowledgeSource source;

    private Boolean active;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

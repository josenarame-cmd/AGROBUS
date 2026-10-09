package com.agrobus.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agricultural_knowledge_sources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgriculturalKnowledgeSource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    private String organization;
    private String sourceType;
    private String referenceUrl;
    private String location;
    private String crop;

    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private String version;
    private String status; // e.g. DRAFT, PROTOTYPE, VALIDATED

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

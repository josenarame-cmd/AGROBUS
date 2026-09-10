package com.agrobus.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "agricultural_inputs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgriculturalInput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String inputName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    private Integer quantityAvailable;

    private Integer quantityDistributed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer"})
    private Supplier supplier;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;

    private LocalDate expirationDate;

    private Integer lowStockThreshold;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (quantityDistributed == null) quantityDistributed = 0;
        if (lowStockThreshold == null) lowStockThreshold = 50;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Category { SEEDS, FERTILIZERS, PESTICIDES }

    public boolean isLowStock() {
        return quantityAvailable != null && quantityAvailable <= lowStockThreshold;
    }
}

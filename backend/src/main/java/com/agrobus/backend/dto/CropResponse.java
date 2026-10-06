package com.agrobus.backend.dto;

import com.agrobus.backend.entity.Crop.CropStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CropResponse {
    private Long id;
    private Long farmId;
    private String farmName; // useful for display
    private String cropType;
    private String variety;
    private CropStatus status;
    private Double areaPlantedHectares;
    private LocalDate expectedPlantingDate;
    private LocalDate actualPlantingDate;
    private LocalDate expectedHarvestDate;
    private LocalDate actualHarvestDate;
    private Double yieldKg;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

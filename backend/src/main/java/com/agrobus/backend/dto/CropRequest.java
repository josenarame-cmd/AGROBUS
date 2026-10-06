package com.agrobus.backend.dto;

import com.agrobus.backend.entity.Crop.CropStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CropRequest {

    @NotNull(message = "Farm ID is required")
    private Long farmId;

    @NotBlank(message = "Crop type is required")
    private String cropType;

    private String variety;

    private CropStatus status;

    @Positive(message = "Area planted must be positive")
    private Double areaPlantedHectares;

    private LocalDate expectedPlantingDate;
    private LocalDate actualPlantingDate;
    private LocalDate expectedHarvestDate;
    private LocalDate actualHarvestDate;

    @Positive(message = "Yield must be positive")
    private Double yieldKg;

    private String notes;
}

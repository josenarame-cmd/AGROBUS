package com.agrobus.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AIRecommendationRequest {
    private Long farmId;

    @NotBlank
    private String soilType;

    @DecimalMin("3.5")
    @DecimalMax("9.5")
    private Double soilPh;

    @DecimalMin("0")
    @DecimalMax("100")
    private Double soilMoisture;

    @DecimalMin("0")
    @DecimalMax("60")
    private Double temperatureC;

    @DecimalMin("0")
    @DecimalMax("5000")
    private Double expectedRainfallMm;

    private String season;

    @Positive
    private Double farmSizeHectares;
}

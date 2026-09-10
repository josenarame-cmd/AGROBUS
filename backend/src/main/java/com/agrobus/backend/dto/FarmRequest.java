package com.agrobus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class FarmRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String district;

    private String sector;
    private String cell;
    private String village;

    @Positive
    private Double sizeHectares;

    private String primaryCrop;
    private String notes;
}
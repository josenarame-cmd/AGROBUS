package com.agrobus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FarmerProfileUpdateRequest {

    @NotBlank(message = "National ID cannot be blank")
    private String nationalId;

    @NotBlank(message = "District cannot be blank")
    private String district;

    private String sector;
    
    private Double farmSize;
    
    private String cropType;
    
    private String gender;
}

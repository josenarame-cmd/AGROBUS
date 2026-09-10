package com.agrobus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO for creating a new loan request.
 * Decouples the REST layer from the Loan entity so internal fields
 * (status, balances, dates) cannot be set by the caller.
 */
@Data
public class LoanRequest {

    @NotNull(message = "Farmer ID is required")
    private Long farmerId;

    @NotBlank(message = "Crop type is required")
    private String cropType;

    @NotBlank(message = "Requested inputs description is required")
    private String requestedInputs;

    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Estimated cost is required")
    @Positive(message = "Estimated cost must be positive")
    private BigDecimal estimatedCost;

    @Positive(message = "Farm size must be positive")
    private Double farmSize;

    private String season;
}

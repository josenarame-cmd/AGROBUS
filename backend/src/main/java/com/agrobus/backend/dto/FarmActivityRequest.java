package com.agrobus.backend.dto;

import com.agrobus.backend.entity.FarmActivity;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FarmActivityRequest {
    @NotNull
    private Long cropId;

    @NotNull
    private FarmActivity.ActivityType activityType;

    @NotNull
    private LocalDate activityDate;

    private String description;
    private Double cost;
    private Double quantityUsed;
    private String unit;
}

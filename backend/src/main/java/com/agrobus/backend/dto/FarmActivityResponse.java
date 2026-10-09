package com.agrobus.backend.dto;

import com.agrobus.backend.entity.FarmActivity;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class FarmActivityResponse {
    private Long id;
    private Long cropId;
    private FarmActivity.ActivityType activityType;
    private LocalDate activityDate;
    private String description;
    private Double cost;
    private Double quantityUsed;
    private String unit;
    private LocalDateTime createdAt;
}

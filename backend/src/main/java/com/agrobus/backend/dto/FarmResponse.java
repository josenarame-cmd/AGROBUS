package com.agrobus.backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class FarmResponse {
    Long id;
    String name;
    String district;
    String sector;
    String cell;
    String village;
    Double sizeHectares;
    String primaryCrop;
    String notes;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
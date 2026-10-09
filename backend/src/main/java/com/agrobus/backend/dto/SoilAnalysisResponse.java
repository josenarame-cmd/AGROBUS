package com.agrobus.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SoilAnalysisResponse {
    private Long id;
    private String sampleId;
    private String soilType;
    private Double confidence;
    private String confidenceLevel;
    private Boolean reviewRequired;
    private String disclaimer;
    private String district;
    private String sector;
    private String currentCrop;
    private LocalDateTime createdAt;
    // ...other fields as necessary...
}

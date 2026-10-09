package com.agrobus.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class SoilAnalysisRequest {
    private MultipartFile image;
    private Long farmId;
    private String district;
    private String sector;
    private Double latitude;
    private Double longitude;
    private String season;
    private String currentCrop;
    private String previousCrop;
    private String plannedCrop;
    private String notes;
}

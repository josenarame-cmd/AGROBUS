package com.agrobus.backend.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class AIRecommendationResponse {
    String engine;
    String farmName;
    String district;
    String recommendedCrop;
    int confidence;
    String summary;
    List<String> reasons;
    List<InputRecommendation> inputs;
    List<CropAlternative> alternatives;
    List<String> nextSteps;

    @Value
    @Builder
    public static class InputRecommendation {
        String name;
        String category;
        String quantity;
        String purpose;
    }

    @Value
    @Builder
    public static class CropAlternative {
        String crop;
        int score;
        String note;
    }
}

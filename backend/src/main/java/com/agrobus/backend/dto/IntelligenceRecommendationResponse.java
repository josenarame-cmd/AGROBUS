package com.agrobus.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class IntelligenceRecommendationResponse {
    private String farmId;
    private String recommendationType;
    private String recommendationStatus;
    private List<String> recommendations;
    private List<String> dataSources;
    private String explanation;
    private Boolean requiresHumanReview;

    // Summary Metrics
    private FarmSummary summary;

    // Timeline
    private List<TimelineEvent> timeline;

    @Data
    @Builder
    public static class FarmSummary {
        private int totalCrops;
        private int totalActivities;
        private int totalInputsUsed;
        private int soilAnalysesCount;
        private int totalHarvests;
    }

    @Data
    @Builder
    public static class TimelineEvent {
        private String date;
        private String type; // e.g., CROP_PLANTED, ACTIVITY, SOIL_ANALYSIS, HARVEST
        private String title;
        private String description;
    }
}

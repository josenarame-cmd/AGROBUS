package com.agrobus.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * Full structured intelligence summary for a given farm.
 * Used by the premium AI Intelligence workspace.
 */
@Data
@Builder
public class FarmIntelligenceSummaryDTO {

    private Long farmId;
    private String farmName;
    private String district;
    private String sector;
    private Double sizeHectares;

    // ── Counts ────────────────────────────────────────────────────────────────
    private int soilAnalysesCount;
    private int activeCropsCount;
    private int totalActivitiesCount;
    private int totalInputsUsed;
    private int harvestRecordsCount;
    private int newInsightsCount;

    // ── Data readiness / completeness ─────────────────────────────────────────
    private DataReadiness dataReadiness;

    // ── Timeline (chronological farm story) ──────────────────────────────────
    private List<TimelineEvent> timeline;

    // ── Recommendations ───────────────────────────────────────────────────────
    private String recommendationStatus;  // NO_DATA | NEEDS_MORE_DATA | AVAILABLE
    private String explanation;

    // ── Performance (only rendered when sufficient data exists) ───────────────
    private FarmPerformance performance;

    // ─── Nested types ────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class DataReadiness {
        private boolean hasFarmProfile;
        private boolean hasCropCycle;
        private boolean hasSoilAnalysis;
        private boolean hasInputRecords;
        private boolean hasActivities;
        private boolean hasHarvestRecords;
        private int completenessPercent;  // 0-100
    }

    @Data
    @Builder
    public static class TimelineEvent {
        private String date;
        private String type;        // SOIL_ANALYSIS | CROP_PLANTED | ACTIVITY | HARVEST
        private String eventIcon;   // emoji or icon key
        private String title;
        private String description;
        private String confidenceLevel; // only for SOIL_ANALYSIS events
    }

    @Data
    @Builder
    public static class FarmPerformance {
        private boolean sufficientData;
        private String insufficientDataMessage;
        // When sufficientData == true
        private Double harvestedKgTotal;
        private Double totalInputCost;
        private Integer totalActivitiesLogged;
    }
}

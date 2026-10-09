package com.agrobus.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * Admin-facing platform intelligence overview.
 * Aggregated stats — no personal farmer data exposed.
 */
@Data
@Builder
public class AdminIntelligenceDTO {
    private long totalFarmsWithAIData;
    private long totalSoilAnalyses;
    private long totalCropCycles;
    private long totalActivityRecords;
    private long totalInputUsageRecords;
    private long totalHarvestRecords;
    private int platformDataCompleteness; // 0-100 %

    // Distribution data for charts
    private Map<String, Long> soilTypeDistribution;   // e.g. {"Clay":12,"Sandy":8}
    private Map<String, Long> cropTypeDistribution;   // e.g. {"Maize":15,"Beans":10}
    private Map<String, Long> activityTypeDistribution;
    private List<ConfidenceDistributionPoint> soilConfidenceDistribution;

    // Data quality notes
    private List<String> dataQualityNotes;

    @Data
    @Builder
    public static class ConfidenceDistributionPoint {
        private String level;  // HIGH | MEDIUM | LOW
        private long count;
    }
}

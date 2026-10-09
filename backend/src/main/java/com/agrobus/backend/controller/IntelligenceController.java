package com.agrobus.backend.controller;

import com.agrobus.backend.dto.AdminIntelligenceDTO;
import com.agrobus.backend.dto.FarmIntelligenceSummaryDTO;
import com.agrobus.backend.dto.IntelligenceRecommendationResponse;
import com.agrobus.backend.entity.*;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class IntelligenceController {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final SoilAnalysisRepository soilAnalysisRepository;
    private final CropRecommendationRuleRepository ruleRepository;
    private final CropRepository cropRepository;
    private final FarmActivityRepository activityRepository;

    // ─── Backward-compatible legacy endpoint ──────────────────────────────────

    @GetMapping("/api/farmer/intelligence/farm/{farmId}")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<IntelligenceRecommendationResponse> getFarmIntelligence(
            @PathVariable Long farmId, Authentication authentication) {

        User user = resolveUser(authentication);
        Farm farm = farmRepository.findByIdAndOwnerId(farmId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found"));

        List<SoilAnalysis> analyses = soilAnalysisRepository.findByFarmerIdOrderByCreatedAtDesc(user.getId())
                .stream().filter(a -> a.getFarm() != null && a.getFarm().getId().equals(farm.getId())).toList();

        List<Crop> crops = cropRepository.findByFarmIdAndOwnerIdOrderByCreatedAtDesc(farm.getId(), user.getId());

        List<FarmActivity> activities = new ArrayList<>();
        int inputUsageCount = 0;
        int harvestCount = 0;

        for (Crop crop : crops) {
            List<FarmActivity> cropActs = activityRepository.findByCropIdOrderByActivityDateDesc(crop.getId());
            activities.addAll(cropActs);
            for (FarmActivity act : cropActs) {
                if (act.getActivityType() == FarmActivity.ActivityType.FERTILIZER || act.getQuantityUsed() != null) inputUsageCount++;
                if (act.getActivityType() == FarmActivity.ActivityType.HARVESTING) harvestCount++;
            }
            if (crop.getStatus() == Crop.CropStatus.HARVESTED || crop.getStatus() == Crop.CropStatus.SOLD) harvestCount++;
        }

        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        List<IntelligenceRecommendationResponse.TimelineEvent> timeline = new ArrayList<>();

        for (SoilAnalysis a : analyses) {
            timeline.add(IntelligenceRecommendationResponse.TimelineEvent.builder()
                .date(a.getCreatedAt().toLocalDate().format(fmt))
                .type("SOIL_ANALYSIS").title("Soil AI Assessment")
                .description("Visual prediction: " + a.getSoilType() + " (Confidence: " + String.format("%.0f", (a.getConfidence() * 100)) + "%)").build());
        }
        for (Crop c : crops) {
            timeline.add(IntelligenceRecommendationResponse.TimelineEvent.builder()
                .date(c.getCreatedAt().toLocalDate().format(fmt))
                .type("CROP_PLANTED").title("Crop Cycle Started")
                .description("Planted " + c.getCropType() + " (" + (c.getVariety() != null ? c.getVariety() : "Unknown variety") + ")").build());
        }
        for (FarmActivity act : activities) {
            timeline.add(IntelligenceRecommendationResponse.TimelineEvent.builder()
                .date(act.getActivityDate().format(fmt))
                .type("ACTIVITY").title(act.getActivityType().name().replace("_", " "))
                .description(act.getDescription() != null ? act.getDescription() : "Action recorded on crop.").build());
        }

        timeline.sort(Comparator.comparing(IntelligenceRecommendationResponse.TimelineEvent::getDate).reversed());
        if (timeline.size() > 10) timeline = timeline.subList(0, 10);

        List<CropRecommendationRule> activeRules = ruleRepository.findByActiveTrue();
        IntelligenceRecommendationResponse response = IntelligenceRecommendationResponse.builder()
                .farmId(farm.getId().toString())
                .recommendationType("CROP").requiresHumanReview(true)
                .recommendations(new ArrayList<>()).dataSources(new ArrayList<>())
                .summary(IntelligenceRecommendationResponse.FarmSummary.builder()
                        .totalCrops(crops.size()).totalActivities(activities.size())
                        .totalInputsUsed(inputUsageCount).soilAnalysesCount(analyses.size()).totalHarvests(harvestCount).build())
                .timeline(timeline).build();

        if (activeRules.isEmpty()) {
            response.setRecommendationStatus("NO_VALIDATED_DATA");
            response.setExplanation("Valid agricultural rules are required to safely prescribe crop and input recommendations. AGROBUS ensures recommendations are rooted in certified science rather than synthetic predictions. Keep logging your farm activities—once localized rules update, your personalized timeline will automatically yield recommendations.");
        } else {
            response.setRecommendationStatus("PROTOTYPE");
            response.setExplanation("Recommendations generated from configured agricultural profiles.");
        }

        return ResponseEntity.ok(response);
    }

    // ─── NEW: Rich farm intelligence summary ──────────────────────────────────

    @GetMapping("/api/farmer/intelligence/farms/{farmId}/summary")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<FarmIntelligenceSummaryDTO> getFarmSummary(
            @PathVariable Long farmId, Authentication authentication) {

        User user = resolveUser(authentication);
        Farm farm = farmRepository.findByIdAndOwnerId(farmId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found or access denied"));

        List<SoilAnalysis> analyses = soilAnalysisRepository.findByFarmerIdOrderByCreatedAtDesc(user.getId())
                .stream().filter(a -> a.getFarm() != null && a.getFarm().getId().equals(farmId)).toList();

        List<Crop> crops = cropRepository.findByFarmIdAndOwnerIdOrderByCreatedAtDesc(farmId, user.getId());
        List<Crop> activeCrops = crops.stream()
                .filter(c -> c.getStatus() == Crop.CropStatus.PLANTED || c.getStatus() == Crop.CropStatus.GROWING)
                .toList();

        List<FarmActivity> allActivities = new ArrayList<>();
        int inputUsageCount = 0;
        int harvestCount = 0;
        double totalYieldKg = 0;
        double totalInputCost = 0;

        for (Crop crop : crops) {
            List<FarmActivity> cropActs = activityRepository.findByCropIdOrderByActivityDateDesc(crop.getId());
            allActivities.addAll(cropActs);
            for (FarmActivity act : cropActs) {
                if (act.getActivityType() == FarmActivity.ActivityType.FERTILIZER || act.getQuantityUsed() != null) inputUsageCount++;
                if (act.getActivityType() == FarmActivity.ActivityType.HARVESTING) harvestCount++;
                if (act.getCost() != null) totalInputCost += act.getCost();
            }
            if (crop.getStatus() == Crop.CropStatus.HARVESTED || crop.getStatus() == Crop.CropStatus.SOLD) harvestCount++;
            if (crop.getYieldKg() != null) totalYieldKg += crop.getYieldKg();
        }

        // Build timeline
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        List<FarmIntelligenceSummaryDTO.TimelineEvent> timeline = new ArrayList<>();

        for (SoilAnalysis a : analyses) {
            timeline.add(FarmIntelligenceSummaryDTO.TimelineEvent.builder()
                .date(a.getCreatedAt().toLocalDate().format(fmt))
                .type("SOIL_ANALYSIS").eventIcon("🧪")
                .title("Soil AI Assessment")
                .description("Visual prediction: " + a.getSoilType()
                    + " — Confidence: " + String.format("%.0f", (a.getConfidence() * 100)) + "%")
                .confidenceLevel(a.getConfidenceLevel())
                .build());
        }
        for (Crop c : crops) {
            timeline.add(FarmIntelligenceSummaryDTO.TimelineEvent.builder()
                .date(c.getCreatedAt().toLocalDate().format(fmt))
                .type("CROP_PLANTED").eventIcon("🌱")
                .title("Crop Cycle Started")
                .description(c.getCropType() + (c.getVariety() != null ? " — " + c.getVariety() : "") + " (" + c.getStatus() + ")")
                .build());
        }
        for (FarmActivity act : allActivities) {
            String icon = activityIcon(act.getActivityType());
            timeline.add(FarmIntelligenceSummaryDTO.TimelineEvent.builder()
                .date(act.getActivityDate().format(fmt))
                .type("ACTIVITY").eventIcon(icon)
                .title(formatActivityType(act.getActivityType()))
                .description(act.getDescription() != null ? act.getDescription() : "Farm activity recorded.")
                .build());
        }

        timeline.sort(Comparator.comparing(FarmIntelligenceSummaryDTO.TimelineEvent::getDate).reversed());
        if (timeline.size() > 20) timeline = timeline.subList(0, 20);

        // Data readiness
        boolean hasFarm = true;
        boolean hasCrop = !crops.isEmpty();
        boolean hasSoil = !analyses.isEmpty();
        boolean hasInputs = inputUsageCount > 0;
        boolean hasActivities = !allActivities.isEmpty();
        boolean hasHarvest = harvestCount > 0;

        int completeness = calculateCompleteness(hasFarm, hasCrop, hasSoil, hasInputs, hasActivities, hasHarvest);

        FarmIntelligenceSummaryDTO.DataReadiness readiness = FarmIntelligenceSummaryDTO.DataReadiness.builder()
                .hasFarmProfile(hasFarm).hasCropCycle(hasCrop).hasSoilAnalysis(hasSoil)
                .hasInputRecords(hasInputs).hasActivities(hasActivities).hasHarvestRecords(hasHarvest)
                .completenessPercent(completeness).build();

        // Performance
        FarmIntelligenceSummaryDTO.FarmPerformance performance;
        if (harvestCount == 0 && allActivities.isEmpty()) {
            performance = FarmIntelligenceSummaryDTO.FarmPerformance.builder()
                    .sufficientData(false)
                    .insufficientDataMessage("Not enough historical data yet. Keep recording farm activities to unlock more useful insights.")
                    .build();
        } else {
            performance = FarmIntelligenceSummaryDTO.FarmPerformance.builder()
                    .sufficientData(true)
                    .harvestedKgTotal(totalYieldKg)
                    .totalInputCost(totalInputCost)
                    .totalActivitiesLogged(allActivities.size())
                    .build();
        }

        // Recommendation status
        String recStatus = completeness < 30 ? "NO_DATA" : completeness < 60 ? "NEEDS_MORE_DATA" : "AVAILABLE";
        String explanation = switch (recStatus) {
            case "NO_DATA" -> "Start by logging a crop cycle and recording some farm activities.";
            case "NEEDS_MORE_DATA" -> "Keep recording activities and soil analyses to unlock personalized insights.";
            default -> "Your farm has enough history to generate contextual insights.";
        };

        return ResponseEntity.ok(FarmIntelligenceSummaryDTO.builder()
                .farmId(farm.getId()).farmName(farm.getName())
                .district(farm.getDistrict()).sector(farm.getSector())
                .sizeHectares(farm.getSizeHectares())
                .soilAnalysesCount(analyses.size())
                .activeCropsCount(activeCrops.size())
                .totalActivitiesCount(allActivities.size())
                .totalInputsUsed(inputUsageCount)
                .harvestRecordsCount(harvestCount)
                .newInsightsCount(0)  // reserved for future ML-generated insights
                .dataReadiness(readiness)
                .timeline(timeline)
                .recommendationStatus(recStatus)
                .explanation(explanation)
                .performance(performance)
                .build());
    }

    // ─── NEW: Admin platform intelligence overview ─────────────────────────────

    @GetMapping("/api/admin/intelligence/overview")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<AdminIntelligenceDTO> getAdminOverview() {

        List<SoilAnalysis> allAnalyses = soilAnalysisRepository.findAll();
        List<Crop> allCrops = cropRepository.findAll();
        List<FarmActivity> allActivities = activityRepository.findAll();
        List<Farm> allFarms = farmRepository.findAll();

        // Farms that have at least one soil analysis
        Set<Long> farmsWithAI = allAnalyses.stream()
                .filter(a -> a.getFarm() != null)
                .map(a -> a.getFarm().getId())
                .collect(Collectors.toSet());

        // Soil type distribution (anonymised counts)
        Map<String, Long> soilDist = allAnalyses.stream()
                .filter(a -> a.getSoilType() != null)
                .collect(Collectors.groupingBy(SoilAnalysis::getSoilType, Collectors.counting()));

        // Crop type distribution (anonymised counts)
        Map<String, Long> cropDist = allCrops.stream()
                .filter(c -> c.getCropType() != null)
                .collect(Collectors.groupingBy(Crop::getCropType, Collectors.counting()));

        // Activity type distribution
        Map<String, Long> actDist = allActivities.stream()
                .collect(Collectors.groupingBy(a -> a.getActivityType().name(), Collectors.counting()));

        // Confidence distribution
        Map<String, Long> confDist = allAnalyses.stream()
                .filter(a -> a.getConfidenceLevel() != null)
                .collect(Collectors.groupingBy(SoilAnalysis::getConfidenceLevel, Collectors.counting()));

        List<AdminIntelligenceDTO.ConfidenceDistributionPoint> confPoints = confDist.entrySet().stream()
                .map(e -> AdminIntelligenceDTO.ConfidenceDistributionPoint.builder()
                        .level(e.getKey()).count(e.getValue()).build())
                .toList();

        // Data quality
        List<String> notes = new ArrayList<>();
        long noSoilAnalysis = allFarms.size() - farmsWithAI.size();
        if (noSoilAnalysis > 0) notes.add(noSoilAnalysis + " farm(s) have no soil analysis on record.");
        long noCrops = allFarms.stream().filter(f -> cropRepository.findByFarmIdOrderByCreatedAtDesc(f.getId()).isEmpty()).count();
        if (noCrops > 0) notes.add(noCrops + " farm(s) have no crop cycles recorded.");

        long inputRecords = allActivities.stream().filter(a ->
                a.getActivityType() == FarmActivity.ActivityType.FERTILIZER || a.getQuantityUsed() != null).count();
        long harvestRecords = allActivities.stream().filter(a ->
                a.getActivityType() == FarmActivity.ActivityType.HARVESTING).count()
                + allCrops.stream().filter(c ->
                c.getStatus() == Crop.CropStatus.HARVESTED || c.getStatus() == Crop.CropStatus.SOLD).count();

        // Completeness: percentage of farms with >=3 of 5 data pillars
        long farmsWith3Plus = allFarms.stream().filter(f -> {
            int score = 0;
            if (!cropRepository.findByFarmIdOrderByCreatedAtDesc(f.getId()).isEmpty()) score++;
            if (farmsWithAI.contains(f.getId())) score++;
            if (!activityRepository.findAll().stream().filter(a ->
                    a.getCrop() != null && cropRepository.findByFarmIdOrderByCreatedAtDesc(f.getId())
                            .stream().anyMatch(c -> c.getId().equals(a.getCrop().getId()))).toList().isEmpty()) score++;
            return score >= 2;
        }).count();
        int completeness = allFarms.isEmpty() ? 0 : (int)((farmsWith3Plus * 100) / allFarms.size());

        return ResponseEntity.ok(AdminIntelligenceDTO.builder()
                .totalFarmsWithAIData(farmsWithAI.size())
                .totalSoilAnalyses(allAnalyses.size())
                .totalCropCycles(allCrops.size())
                .totalActivityRecords(allActivities.size())
                .totalInputUsageRecords(inputRecords)
                .totalHarvestRecords(harvestRecords)
                .platformDataCompleteness(completeness)
                .soilTypeDistribution(soilDist)
                .cropTypeDistribution(cropDist)
                .activityTypeDistribution(actDist)
                .soilConfidenceDistribution(confPoints)
                .dataQualityNotes(notes)
                .build());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private int calculateCompleteness(boolean farm, boolean crop, boolean soil, boolean inputs, boolean activities, boolean harvest) {
        int score = 0;
        if (farm) score += 20;
        if (crop) score += 20;
        if (soil) score += 20;
        if (inputs) score += 15;
        if (activities) score += 15;
        if (harvest) score += 10;
        return score;
    }

    private String activityIcon(FarmActivity.ActivityType type) {
        return switch (type) {
            case SOIL_PREP -> "🌍";
            case PLANTING -> "🌱";
            case WEEDING -> "🌿";
            case FERTILIZER -> "🧪";
            case PEST_OBSERVATION -> "🐛";
            case DISEASE_OBSERVATION -> "⚠️";
            case HARVESTING -> "🌾";
            default -> "📋";
        };
    }

    private String formatActivityType(FarmActivity.ActivityType type) {
        return switch (type) {
            case SOIL_PREP -> "Soil Preparation";
            case PLANTING -> "Planting";
            case WEEDING -> "Weeding";
            case FERTILIZER -> "Fertilizer Application";
            case PEST_OBSERVATION -> "Pest Observation";
            case DISEASE_OBSERVATION -> "Disease Observation";
            case HARVESTING -> "Harvest Activity";
            default -> "Farm Activity";
        };
    }
}

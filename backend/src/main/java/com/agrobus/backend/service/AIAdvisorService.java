package com.agrobus.backend.service;

import com.agrobus.backend.dto.AIRecommendationRequest;
import com.agrobus.backend.dto.AIRecommendationResponse;
import com.agrobus.backend.entity.Farm;
import com.agrobus.backend.entity.User;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.FarmRepository;
import com.agrobus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Explainable AgroBus prototype recommendation engine.
 *
 * The model scores crops against structured farm/soil conditions instead of
 * pretending to have trained on a hidden dataset. This makes the hackathon
 * prototype deterministic, explainable and easy to replace with a trained
 * ML model later.
 */
@Service
@RequiredArgsConstructor
public class AIAdvisorService {
        private final FarmRepository farmRepository;
        private final UserRepository userRepository;

        private record CropProfile(String crop, Set<String> soils, double minPh, double maxPh,
                        double minMoisture, double maxMoisture, double minTemp,
                        double maxTemp, double minRain, double maxRain,
                        String seed, String fertilizer, String protection) {
        }

        private static final List<CropProfile> CROPS = List.of(
                        new CropProfile("Maize", Set.of("loam", "clay loam", "sandy loam"), 5.5, 7.2, 35, 70, 18, 32,
                                        500, 1200,
                                        "20–25 kg seed/ha", "NPK + nitrogen top-dressing",
                                        "Scout early for fall armyworm"),
                        new CropProfile("Beans", Set.of("loam", "sandy loam"), 5.5, 7.0, 30, 65, 15, 28, 400, 1000,
                                        "60–90 kg seed/ha", "NPK/phosphorus-rich fertilizer",
                                        "Monitor bean pests and fungal disease"),
                        new CropProfile("Irish potatoes", Set.of("loam", "sandy loam"), 5.0, 6.5, 45, 80, 12, 24, 500,
                                        1400,
                                        "1.5–2.5 t certified seed/ha", "NPK + soil-test-based fertilizer",
                                        "Use clean seed and scout for late blight"),
                        new CropProfile("Sorghum", Set.of("loam", "clay loam", "sandy loam"), 5.5, 8.0, 25, 60, 20, 35,
                                        350, 800,
                                        "8–12 kg seed/ha", "Balanced NPK", "Monitor birds and sorghum pests"),
                        new CropProfile("Rice", Set.of("clay", "clay loam"), 5.0, 7.5, 60, 95, 20, 35, 900, 1800,
                                        "30–50 kg seed/ha", "Nitrogen + phosphorus + potassium",
                                        "Maintain water and monitor rice pests"));

        public AIRecommendationResponse recommend(Authentication authentication, AIRecommendationRequest request) {
                User user = currentUser(authentication);
                Farm farm = null;
                if (request.getFarmId() != null) {
                        farm = farmRepository.findByIdAndOwnerId(request.getFarmId(), user.getId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Farm not found"));
                }

                String soil = normalize(request.getSoilType());
                double ph = value(request.getSoilPh(), 6.2);
                double moisture = value(request.getSoilMoisture(), 45);
                double temperature = value(request.getTemperatureC(), 23);
                double rainfall = value(request.getExpectedRainfallMm(), 800);

                List<AIRecommendationResponse.CropAlternative> alternatives = new ArrayList<>();
                Map<String, CropProfile> profiles = new HashMap<>();
                for (CropProfile crop : CROPS) {
                        int score = score(crop, soil, ph, moisture, temperature, rainfall);
                        profiles.put(crop.crop(), crop);
                        alternatives.add(AIRecommendationResponse.CropAlternative.builder()
                                        .crop(crop.crop()).score(score)
                                        .note(explainFit(crop, soil, ph, moisture, temperature, rainfall)).build());
                }
                alternatives.sort(
                                Comparator.comparingInt(AIRecommendationResponse.CropAlternative::getScore).reversed());

                AIRecommendationResponse.CropAlternative best = alternatives.get(0);
                CropProfile profile = profiles.get(best.getCrop());
                int confidence = Math.max(55, Math.min(96, 55 + best.getScore() / 2));
                List<String> reasons = reasons(profile, soil, ph, moisture, temperature, rainfall);
                double hectares = value(request.getFarmSizeHectares(),
                                farm != null && farm.getSizeHectares() != null ? farm.getSizeHectares() : 1.0);

                List<AIRecommendationResponse.InputRecommendation> inputs = List.of(
                                AIRecommendationResponse.InputRecommendation.builder().name("Seed").category("SEEDS")
                                                .quantity(scaleQuantity(profile.seed(), hectares))
                                                .purpose("Establish the recommended crop on the registered farm")
                                                .build(),
                                AIRecommendationResponse.InputRecommendation.builder().name(profile.fertilizer())
                                                .category("FERTILIZERS")
                                                .quantity("Plan from soil test and local extension guidance")
                                                .purpose("Supply nutrients for the crop").build(),
                                AIRecommendationResponse.InputRecommendation.builder().name("Crop protection")
                                                .category("PROTECTION")
                                                .quantity("As needed after field scouting")
                                                .purpose(profile.protection()).build());

                List<String> nextSteps = List.of(
                                "Confirm the recommendation with a local agronomist or extension officer.",
                                "Check AgroBus input availability and compare suppliers before ordering.",
                                "Use fresh soil/sensor readings when available to improve the next recommendation.");

                return AIRecommendationResponse.builder()
                                .engine("AgroBus Explainable AI v1")
                                .farmName(farm != null ? farm.getName() : "Farm assessment")
                                .district(farm != null ? farm.getDistrict() : "Not linked")
                                .recommendedCrop(best.getCrop())
                                .confidence(confidence)
                                .summary("Based on the farm conditions provided, " + best.getCrop()
                                                + " has the strongest match in the AgroBus prototype model.")
                                .reasons(reasons)
                                .inputs(inputs)
                                .alternatives(alternatives.subList(0, Math.min(3, alternatives.size())))
                                .nextSteps(nextSteps)
                                .build();
        }

        private int score(CropProfile c, String soil, double ph, double moisture, double temp, double rain) {
                int score = 0;
                if (c.soils().contains(soil))
                        score += 30;
                else if (soil.contains("loam") && c.soils().stream().anyMatch(s -> s.contains("loam")))
                        score += 18;
                score += rangeScore(ph, c.minPh(), c.maxPh(), 20);
                score += rangeScore(moisture, c.minMoisture(), c.maxMoisture(), 15);
                score += rangeScore(temp, c.minTemp(), c.maxTemp(), 15);
                score += rangeScore(rain, c.minRain(), c.maxRain(), 20);
                return Math.min(100, score);
        }

        private int rangeScore(double value, double min, double max, int points) {
                if (value >= min && value <= max)
                        return points;
                double distance = value < min ? min - value : value - max;
                double tolerance = Math.max((max - min) * 0.75, 1);
                return Math.max(0, (int) Math.round(points * (1 - Math.min(1, distance / tolerance))));
        }

        private String explainFit(CropProfile c, String soil, double ph, double moisture, double temp, double rain) {
                int score = score(c, soil, ph, moisture, temp, rain);
                return score >= 75 ? "Strong match for the supplied conditions."
                                : score >= 55 ? "Moderate match; validate local conditions."
                                                : "Lower match with the supplied conditions.";
        }

        private List<String> reasons(CropProfile c, String soil, double ph, double moisture, double temp, double rain) {
                List<String> reasons = new ArrayList<>();
                reasons.add("Soil type " + soil + (c.soils().contains(soil) ? " matches the crop profile."
                                : " is outside the preferred soil profile."));
                reasons.add(String.format(Locale.US, "pH %.1f is %s the preferred %.1f–%.1f range.", ph,
                                ph >= c.minPh() && ph <= c.maxPh() ? "inside" : "outside", c.minPh(), c.maxPh()));
                reasons.add(String.format(Locale.US,
                                "Moisture %.0f%% and temperature %.1f°C were included in the crop score.", moisture,
                                temp));
                reasons.add(String.format(Locale.US, "Expected rainfall %.0f mm was included in the seasonal fit.",
                                rain));
                return reasons;
        }

        private String scaleQuantity(String base, double hectares) {
                if (base.contains("20–25"))
                        return String.format(Locale.US, "%.0f–%.0f kg", 20 * hectares, 25 * hectares);
                if (base.contains("60–90"))
                        return String.format(Locale.US, "%.0f–%.0f kg", 60 * hectares, 90 * hectares);
                if (base.contains("1.5–2.5"))
                        return String.format(Locale.US, "%.1f–%.1f tonnes", 1.5 * hectares, 2.5 * hectares);
                if (base.contains("8–12"))
                        return String.format(Locale.US, "%.0f–%.0f kg", 8 * hectares, 12 * hectares);
                if (base.contains("30–50"))
                        return String.format(Locale.US, "%.0f–%.0f kg", 30 * hectares, 50 * hectares);
                return base;
        }

        private double value(Double value, double fallback) {
                return value == null ? fallback : value;
        }

        private String normalize(String value) {
                return value == null ? "loam" : value.trim().toLowerCase(Locale.ROOT);
        }

        private User currentUser(Authentication authentication) {
                return userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new UsernameNotFoundException("Authenticated user not found"));
        }
}

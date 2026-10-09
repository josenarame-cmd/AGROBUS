package com.agrobus.backend.service;

import com.agrobus.backend.dto.SoilAnalysisRequest;
import com.agrobus.backend.dto.SoilAnalysisResponse;
import com.agrobus.backend.entity.Farm;
import com.agrobus.backend.entity.SoilAnalysis;
import com.agrobus.backend.entity.User;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.FarmRepository;
import com.agrobus.backend.repository.SoilAnalysisRepository;
import com.agrobus.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SoilAnalysisService {
    private final SoilAnalysisRepository soilAnalysisRepository;
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String AI_SERVICE_URL = "http://127.0.0.1:8001/api/v1/soil/predict";

    public SoilAnalysisResponse analyzeSoil(Authentication authentication, SoilAnalysisRequest request) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Farm farm = null;
        if (request.getFarmId() != null) {
            farm = farmRepository.findById(request.getFarmId()).orElse(null);
        }

        // Call AI Service
        JsonNode aiResponse;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileAsResource = new ByteArrayResource(request.getImage().getBytes()) {
                @Override
                public String getFilename() {
                    return request.getImage().getOriginalFilename() != null ? request.getImage().getOriginalFilename() : "image.jpg";
                }
            };
            body.add("file", fileAsResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(AI_SERVICE_URL, requestEntity, String.class);
            aiResponse = objectMapper.readTree(response.getBody());

        } catch (Exception e) {
            log.error("AI Service failure", e);
            throw new RuntimeException("Could not analyze soil using AI Service. Ensure the AI service is running at " + AI_SERVICE_URL);
        }

        // Parse AI result
        JsonNode predictionNode = aiResponse.get("prediction");
        String predictedSoilType = predictionNode.get("soil_type").asText();
        double confidencePct = predictionNode.get("confidence_pct").asDouble();
        boolean reviewRequired = predictionNode.get("review_required").asBoolean();
        String disclaimer = aiResponse.get("disclaimer").asText();

        String confLevel = "LOW";
        if (confidencePct >= 80) confLevel = "HIGH";
        else if (confidencePct >= 50) confLevel = "MEDIUM";

        // Create Entity
        SoilAnalysis analysis = SoilAnalysis.builder()
                .farmer(user)
                .farm(farm)
                .sampleId("RW-KAR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .imageReference(request.getImage().getOriginalFilename())
                .soilType(predictedSoilType)
                .confidence(confidencePct)
                .confidenceLevel(confLevel)
                .reviewRequired(reviewRequired)
                .disclaimer(disclaimer)
                .district(request.getDistrict())
                .sector(request.getSector())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .season(request.getSeason())
                .currentCrop(request.getCurrentCrop())
                .previousCrop(request.getPreviousCrop())
                .plannedCrop(request.getPlannedCrop())
                .notes(request.getNotes())
                .build();

        analysis = soilAnalysisRepository.save(analysis);
        return mapToDto(analysis);
    }

    public List<SoilAnalysisResponse> getFarmerAnalyses(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return soilAnalysisRepository.findByFarmerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private SoilAnalysisResponse mapToDto(SoilAnalysis entity) {
        return SoilAnalysisResponse.builder()
                .id(entity.getId())
                .sampleId(entity.getSampleId())
                .soilType(entity.getSoilType())
                .confidence(entity.getConfidence())
                .confidenceLevel(entity.getConfidenceLevel())
                .reviewRequired(entity.getReviewRequired())
                .disclaimer(entity.getDisclaimer())
                .district(entity.getDistrict())
                .sector(entity.getSector())
                .currentCrop(entity.getCurrentCrop())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

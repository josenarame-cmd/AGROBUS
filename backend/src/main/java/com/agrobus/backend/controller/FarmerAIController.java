package com.agrobus.backend.controller;

import com.agrobus.backend.dto.AIRecommendationRequest;
import com.agrobus.backend.dto.AIRecommendationResponse;
import com.agrobus.backend.service.AIAdvisorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/ai")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FarmerAIController {
    private final AIAdvisorService advisorService;

    @PostMapping("/recommend")
    public ResponseEntity<AIRecommendationResponse> recommend(
            @Valid @RequestBody AIRecommendationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(advisorService.recommend(authentication, request));
    }
}

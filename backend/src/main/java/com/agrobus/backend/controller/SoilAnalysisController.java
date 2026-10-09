package com.agrobus.backend.controller;

import com.agrobus.backend.dto.SoilAnalysisRequest;
import com.agrobus.backend.dto.SoilAnalysisResponse;
import com.agrobus.backend.service.SoilAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/soil-analysis")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SoilAnalysisController {
    private final SoilAnalysisService soilAnalysisService;

    @PostMapping
    public ResponseEntity<SoilAnalysisResponse> analyzeSoil(
            Authentication authentication,
            @ModelAttribute SoilAnalysisRequest request) {
        return ResponseEntity.ok(soilAnalysisService.analyzeSoil(authentication, request));
    }

    @GetMapping
    public ResponseEntity<List<SoilAnalysisResponse>> getAnalyses(Authentication authentication) {
        return ResponseEntity.ok(soilAnalysisService.getFarmerAnalyses(authentication));
    }
}

package com.agrobus.backend.controller;

import com.agrobus.backend.dto.FarmRequest;
import com.agrobus.backend.dto.FarmResponse;
import com.agrobus.backend.service.FarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/farms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FarmerFarmController {
    private final FarmService farmService;

    @GetMapping
    public ResponseEntity<List<FarmResponse>> getMyFarms(Authentication authentication) {
        return ResponseEntity.ok(farmService.getMyFarms(authentication));
    }

    @PostMapping
    public ResponseEntity<FarmResponse> create(@Valid @RequestBody FarmRequest request, Authentication authentication) {
        return ResponseEntity.ok(farmService.create(authentication, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FarmResponse> update(@PathVariable Long id, @Valid @RequestBody FarmRequest request, Authentication authentication) {
        return ResponseEntity.ok(farmService.update(authentication, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        farmService.delete(authentication, id);
        return ResponseEntity.noContent().build();
    }
}
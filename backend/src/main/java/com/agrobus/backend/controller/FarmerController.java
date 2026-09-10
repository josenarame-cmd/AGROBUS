package com.agrobus.backend.controller;

import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.service.FarmerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farmers")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class FarmerController {

    private final FarmerService farmerService;

    @PostMapping
    public ResponseEntity<Farmer> createFarmer(@Valid @RequestBody Farmer farmer) {
        return ResponseEntity.ok(farmerService.createFarmer(farmer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Farmer> updateFarmer(@PathVariable Long id, @Valid @RequestBody Farmer farmer) {
        return ResponseEntity.ok(farmerService.updateFarmer(id, farmer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarmer(@PathVariable Long id) {
        farmerService.deleteFarmer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Farmer> getFarmer(@PathVariable Long id) {
        return ResponseEntity.ok(farmerService.getFarmerById(id));
    }

    @GetMapping
    public ResponseEntity<Page<Farmer>> searchFarmers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String cropType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(farmerService.searchFarmers(search, district, cropType,
                PageRequest.of(page, size, Sort.by("registrationDate").descending())));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Farmer>> getAllFarmers() {
        return ResponseEntity.ok(farmerService.getAllFarmers());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistricts() {
        return ResponseEntity.ok(farmerService.getDistinctDistricts());
    }

    @GetMapping("/crop-types")
    public ResponseEntity<List<String>> getCropTypes() {
        return ResponseEntity.ok(farmerService.getDistinctCropTypes());
    }

    @GetMapping("/unassigned")
    public ResponseEntity<List<Farmer>> getUnassignedFarmers() {
        return ResponseEntity.ok(farmerService.getUnassignedFarmers());
    }

    /**
     * Links a User account to a Farmer record — allows that user to access
     * the /api/farmer/* self-service endpoints.
     */
    @PutMapping("/{farmerId}/link-user")
    public ResponseEntity<Farmer> linkUser(@PathVariable Long farmerId,
                                            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(farmerService.linkUserToFarmer(farmerId, body.get("userId")));
    }
}

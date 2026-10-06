package com.agrobus.backend.controller;

import com.agrobus.backend.dto.CropRequest;
import com.agrobus.backend.dto.CropResponse;
import com.agrobus.backend.entity.User;
import com.agrobus.backend.repository.UserRepository;
import com.agrobus.backend.service.CropService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/crops")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasRole('FARMER')")
public class FarmerCropController {

    private final CropService cropService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CropResponse>> getAllCrops(Authentication auth) {
        Long ownerId = resolveUserId(auth);
        return ResponseEntity.ok(cropService.getAllCropsForOwner(ownerId));
    }

    /** Returns crops that belong to a specific farm — ownership is verified against the JWT. */
    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<CropResponse>> getCropsByFarm(@PathVariable Long farmId, Authentication auth) {
        Long ownerId = resolveUserId(auth);
        return ResponseEntity.ok(cropService.getCropsForFarm(farmId, ownerId));
    }

    /** Returns crops filtered by lifecycle status for the authenticated farmer. */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CropResponse>> getCropsByStatus(@PathVariable String status, Authentication auth) {
        Long ownerId = resolveUserId(auth);
        return ResponseEntity.ok(cropService.getCropsByStatus(ownerId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CropResponse> getCrop(@PathVariable Long id, Authentication auth) {
        Long ownerId = resolveUserId(auth);
        return ResponseEntity.ok(cropService.getCrop(id, ownerId));
    }

    @PostMapping
    public ResponseEntity<CropResponse> createCrop(@Valid @RequestBody CropRequest request, Authentication auth) {
        Long ownerId = resolveUserId(auth);
        return ResponseEntity.ok(cropService.createCrop(request, ownerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CropResponse> updateCrop(
            @PathVariable Long id,
            @Valid @RequestBody CropRequest request,
            Authentication auth) {
        Long ownerId = resolveUserId(auth);
        return ResponseEntity.ok(cropService.updateCrop(id, request, ownerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCrop(@PathVariable Long id, Authentication auth) {
        Long ownerId = resolveUserId(auth);
        cropService.deleteCrop(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user.getId();
    }
}

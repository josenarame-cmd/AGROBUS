package com.agrobus.backend.controller;

import com.agrobus.backend.dto.FarmActivityRequest;
import com.agrobus.backend.dto.FarmActivityResponse;
import com.agrobus.backend.entity.User;
import com.agrobus.backend.repository.UserRepository;
import com.agrobus.backend.service.FarmActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/activities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FarmActivityController {

    private final FarmActivityService activityService;
    private final UserRepository userRepository;

    @GetMapping("/crop/{cropId}")
    public ResponseEntity<List<FarmActivityResponse>> getActivitiesForCrop(@PathVariable Long cropId, Authentication auth) {
        Long ownerId = resolveUserId(auth);
        return ResponseEntity.ok(activityService.getActivitiesForCrop(cropId, ownerId));
    }

    @PostMapping
    public ResponseEntity<FarmActivityResponse> createActivity(@Valid @RequestBody FarmActivityRequest request, Authentication auth) {
        Long ownerId = resolveUserId(auth);
        return ResponseEntity.ok(activityService.createActivity(request, ownerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id, Authentication auth) {
        Long ownerId = resolveUserId(auth);
        activityService.deleteActivity(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user.getId();
    }
}

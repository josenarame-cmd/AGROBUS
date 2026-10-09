package com.agrobus.backend.service;

import com.agrobus.backend.dto.FarmActivityRequest;
import com.agrobus.backend.dto.FarmActivityResponse;
import com.agrobus.backend.entity.Crop;
import com.agrobus.backend.entity.FarmActivity;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.CropRepository;
import com.agrobus.backend.repository.FarmActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FarmActivityService {

    private final FarmActivityRepository activityRepository;
    private final CropRepository cropRepository;

    public List<FarmActivityResponse> getActivitiesForCrop(Long cropId, Long ownerId) {
        // Validate crop ownership
        Crop crop = cropRepository.findByIdAndOwnerId(cropId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found or access denied"));

        return activityRepository.findByCropIdOrderByActivityDateDesc(crop.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FarmActivityResponse createActivity(FarmActivityRequest request, Long ownerId) {
        Crop crop = cropRepository.findByIdAndOwnerId(request.getCropId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found or access denied"));

        FarmActivity activity = FarmActivity.builder()
                .crop(crop)
                .activityType(request.getActivityType())
                .activityDate(request.getActivityDate())
                .description(request.getDescription())
                .cost(request.getCost())
                .quantityUsed(request.getQuantityUsed())
                .unit(request.getUnit())
                .build();

        return toResponse(activityRepository.save(activity));
    }

    public void deleteActivity(Long activityId, Long ownerId) {
        FarmActivity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found"));
        // Ensure the current user owns the crop that this activity traces back to
        if (!activity.getCrop().getOwnerId().equals(ownerId)) {
            throw new ResourceNotFoundException("Activity not found or access denied");
        }
        activityRepository.delete(activity);
    }

    private FarmActivityResponse toResponse(FarmActivity act) {
        return FarmActivityResponse.builder()
                .id(act.getId())
                .cropId(act.getCrop().getId())
                .activityType(act.getActivityType())
                .activityDate(act.getActivityDate())
                .description(act.getDescription())
                .cost(act.getCost())
                .quantityUsed(act.getQuantityUsed())
                .unit(act.getUnit())
                .createdAt(act.getCreatedAt())
                .build();
    }
}

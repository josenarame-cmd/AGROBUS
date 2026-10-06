package com.agrobus.backend.service;

import com.agrobus.backend.dto.CropRequest;
import com.agrobus.backend.dto.CropResponse;
import com.agrobus.backend.entity.Crop;
import com.agrobus.backend.entity.Farm;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.CropRepository;
import com.agrobus.backend.repository.FarmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CropService {

    private final CropRepository cropRepository;
    private final FarmRepository farmRepository;

    public List<CropResponse> getAllCropsForOwner(Long ownerId) {
        return cropRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Returns crops for a specific farm, verifying the farm belongs to the owner. */
    public List<CropResponse> getCropsForFarm(Long farmId, Long ownerId) {
        // Verify farm ownership first
        farmRepository.findByIdAndOwnerId(farmId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found or access denied"));
        return cropRepository.findByFarmIdAndOwnerIdOrderByCreatedAtDesc(farmId, ownerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Returns crops filtered by lifecycle status for the authenticated farmer. */
    public List<CropResponse> getCropsByStatus(Long ownerId, String statusStr) {
        try {
            Crop.CropStatus status = Crop.CropStatus.valueOf(statusStr.toUpperCase());
            return cropRepository.findByOwnerIdAndStatusOrderByCreatedAtDesc(ownerId, status)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            // Unknown status — return empty list rather than a 500 error
            return List.of();
        }
    }

    public CropResponse getCrop(Long id, Long ownerId) {
        Crop crop = getCropOwnedBy(id, ownerId);
        return toResponse(crop);
    }

    public CropResponse createCrop(CropRequest request, Long ownerId) {
        Farm farm = farmRepository.findByIdAndOwnerId(request.getFarmId(), ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found or access denied"));

        Crop crop = Crop.builder()
                .farm(farm)
                .ownerId(ownerId)
                .cropType(request.getCropType())
                .variety(request.getVariety())
                .status(request.getStatus() != null ? request.getStatus() : Crop.CropStatus.PLANNED)
                .areaPlantedHectares(request.getAreaPlantedHectares())
                .expectedPlantingDate(request.getExpectedPlantingDate())
                .actualPlantingDate(request.getActualPlantingDate())
                .expectedHarvestDate(request.getExpectedHarvestDate())
                .actualHarvestDate(request.getActualHarvestDate())
                .yieldKg(request.getYieldKg())
                .notes(request.getNotes())
                .build();

        Crop savedCrop = cropRepository.save(crop);
        return toResponse(savedCrop);
    }

    public CropResponse updateCrop(Long id, CropRequest request, Long ownerId) {
        Crop crop = getCropOwnedBy(id, ownerId);

        // If shifting to a different farm, verify new farm ownership
        if (!crop.getFarm().getId().equals(request.getFarmId())) {
            Farm newFarm = farmRepository.findByIdAndOwnerId(request.getFarmId(), ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Farm not found or access denied"));
            crop.setFarm(newFarm);
        }

        crop.setCropType(request.getCropType());
        crop.setVariety(request.getVariety());
        if (request.getStatus() != null) {
            crop.setStatus(request.getStatus());
        }
        crop.setAreaPlantedHectares(request.getAreaPlantedHectares());
        crop.setExpectedPlantingDate(request.getExpectedPlantingDate());
        crop.setActualPlantingDate(request.getActualPlantingDate());
        crop.setExpectedHarvestDate(request.getExpectedHarvestDate());
        crop.setActualHarvestDate(request.getActualHarvestDate());
        crop.setYieldKg(request.getYieldKg());
        crop.setNotes(request.getNotes());

        return toResponse(cropRepository.save(crop));
    }

    public void deleteCrop(Long id, Long ownerId) {
        Crop crop = getCropOwnedBy(id, ownerId);
        cropRepository.delete(crop);
    }

    private Crop getCropOwnedBy(Long id, Long ownerId) {
        return cropRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found or access denied"));
    }

    private CropResponse toResponse(Crop crop) {
        return CropResponse.builder()
                .id(crop.getId())
                .farmId(crop.getFarm().getId())
                .farmName(crop.getFarm().getName())
                .cropType(crop.getCropType())
                .variety(crop.getVariety())
                .status(crop.getStatus())
                .areaPlantedHectares(crop.getAreaPlantedHectares())
                .expectedPlantingDate(crop.getExpectedPlantingDate())
                .actualPlantingDate(crop.getActualPlantingDate())
                .expectedHarvestDate(crop.getExpectedHarvestDate())
                .actualHarvestDate(crop.getActualHarvestDate())
                .yieldKg(crop.getYieldKg())
                .notes(crop.getNotes())
                .createdAt(crop.getCreatedAt())
                .updatedAt(crop.getUpdatedAt())
                .build();
    }
}

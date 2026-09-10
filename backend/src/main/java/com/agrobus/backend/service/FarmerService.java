package com.agrobus.backend.service;

import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerRepository farmerRepository;

    @Transactional
    public Farmer createFarmer(Farmer farmer) {
        if (farmerRepository.existsByNationalId(farmer.getNationalId())) {
            throw new IllegalArgumentException("National ID already registered");
        }
        if (farmerRepository.existsByPhone(farmer.getPhone())) {
            throw new IllegalArgumentException("Phone number already registered");
        }
        return farmerRepository.save(farmer);
    }

    @Transactional
    public Farmer updateFarmer(Long id, Farmer farmerDetails) {
        Farmer farmer = getFarmerById(id);
        farmer.setFullName(farmerDetails.getFullName());
        farmer.setPhone(farmerDetails.getPhone());
        farmer.setGender(farmerDetails.getGender());
        farmer.setDistrict(farmerDetails.getDistrict());
        farmer.setSector(farmerDetails.getSector());
        farmer.setFarmSize(farmerDetails.getFarmSize());
        farmer.setCropType(farmerDetails.getCropType());
        farmer.setStatus(farmerDetails.getStatus());
        // Allow updating the userId link
        if (farmerDetails.getUserId() != null) {
            farmer.setUserId(farmerDetails.getUserId());
        }
        return farmerRepository.save(farmer);
    }

    @Transactional
    public void deleteFarmer(Long id) {
        if (!farmerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Farmer not found with id: " + id);
        }
        farmerRepository.deleteById(id);
    }

    public Farmer getFarmerById(Long id) {
        return farmerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with id: " + id));
    }

    public Farmer getFarmerByUserId(Long userId) {
        return farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No farmer profile linked to user id: " + userId));
    }

    public Page<Farmer> searchFarmers(String search, String district, String cropType, Pageable pageable) {
        return farmerRepository.searchFarmers(search, district, cropType, pageable);
    }

    public List<Farmer> getAllFarmers() {
        return farmerRepository.findAll();
    }

    public List<String> getDistinctDistricts() {
        return farmerRepository.findDistinctDistricts();
    }

    public List<String> getDistinctCropTypes() {
        return farmerRepository.findDistinctCropTypes();
    }

    public List<Farmer> getUnassignedFarmers() {
        return farmerRepository.findByAgentIsNull();
    }

    /**
     * Links an existing User account to an existing Farmer record.
     * Used when an admin wants to give a Farmer their own login.
     */
    @Transactional
    public Farmer linkUserToFarmer(Long farmerId, Long userId) {
        Farmer farmer = getFarmerById(farmerId);
        farmer.setUserId(userId);
        return farmerRepository.save(farmer);
    }
}

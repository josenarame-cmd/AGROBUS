package com.agrobus.backend.service;

import com.agrobus.backend.dto.FarmRequest;
import com.agrobus.backend.dto.FarmResponse;
import com.agrobus.backend.entity.Farm;
import com.agrobus.backend.entity.User;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.FarmRepository;
import com.agrobus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmService {
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;

    public List<FarmResponse> getMyFarms(Authentication authentication) {
        User owner = currentUser(authentication);
        return farmRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId()).stream().map(this::toResponse).toList();
    }

    public FarmResponse create(Authentication authentication, FarmRequest request) {
        User owner = currentUser(authentication);
        Farm farm = Farm.builder().owner(owner).name(request.getName().trim()).district(request.getDistrict().trim())
                .sector(clean(request.getSector())).cell(clean(request.getCell())).village(clean(request.getVillage())).sizeHectares(request.getSizeHectares())
                .primaryCrop(clean(request.getPrimaryCrop())).notes(clean(request.getNotes())).build();
        return toResponse(farmRepository.save(farm));
    }

    public FarmResponse update(Authentication authentication, Long id, FarmRequest request) {
        User owner = currentUser(authentication);
        Farm farm = farmRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found"));
        farm.setName(request.getName().trim());
        farm.setDistrict(request.getDistrict().trim());
        farm.setSector(clean(request.getSector()));
        farm.setCell(clean(request.getCell()));
        farm.setVillage(clean(request.getVillage()));
        farm.setSizeHectares(request.getSizeHectares());
        farm.setPrimaryCrop(clean(request.getPrimaryCrop()));
        farm.setNotes(clean(request.getNotes()));
        return toResponse(farmRepository.save(farm));
    }

    public void delete(Authentication authentication, Long id) {
        User owner = currentUser(authentication);
        Farm farm = farmRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found"));
        farmRepository.delete(farm);
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Authenticated user not found"));
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private FarmResponse toResponse(Farm farm) {
        return FarmResponse.builder().id(farm.getId()).name(farm.getName()).district(farm.getDistrict()).sector(farm.getSector()).cell(farm.getCell())
                .village(farm.getVillage()).sizeHectares(farm.getSizeHectares()).primaryCrop(farm.getPrimaryCrop()).notes(farm.getNotes())
                .createdAt(farm.getCreatedAt()).updatedAt(farm.getUpdatedAt()).build();
    }
}
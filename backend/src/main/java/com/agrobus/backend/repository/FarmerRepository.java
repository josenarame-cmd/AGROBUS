package com.agrobus.backend.repository;

import com.agrobus.backend.entity.Farmer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Page<Farmer> findByFullNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Farmer> findByDistrict(String district, Pageable pageable);
    Page<Farmer> findByCropType(String cropType, Pageable pageable);
    Page<Farmer> findByDistrictAndCropType(String district, String cropType, Pageable pageable);
    long countByStatus(Farmer.Status status);
    boolean existsByNationalId(String nationalId);
    boolean existsByPhone(String phone);

    @Query("SELECT DISTINCT f.district FROM Farmer f")
    List<String> findDistinctDistricts();

    @Query("SELECT DISTINCT f.cropType FROM Farmer f WHERE f.cropType IS NOT NULL")
    List<String> findDistinctCropTypes();

    @Query("SELECT f FROM Farmer f WHERE " +
           "(:search IS NULL OR LOWER(f.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR f.phone LIKE CONCAT('%', :search, '%') OR f.nationalId LIKE CONCAT('%', :search, '%')) AND " +
           "(:district IS NULL OR f.district = :district) AND " +
           "(:cropType IS NULL OR f.cropType = :cropType)")
    Page<Farmer> searchFarmers(@Param("search") String search, @Param("district") String district, @Param("cropType") String cropType, Pageable pageable);

    List<Farmer> findByAgentId(Long agentId);
    List<Farmer> findByAgentIsNull();
}

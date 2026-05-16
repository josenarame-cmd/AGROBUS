package com.agrobus.backend.repository;

import com.agrobus.backend.entity.AgriculturalInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AgriculturalInputRepository extends JpaRepository<AgriculturalInput, Long> {
    List<AgriculturalInput> findByCategory(AgriculturalInput.Category category);

    @Query("SELECT a FROM AgriculturalInput a WHERE a.quantityAvailable <= a.lowStockThreshold")
    List<AgriculturalInput> findLowStockInputs();

    @Query("SELECT a.category, SUM(a.quantityAvailable) FROM AgriculturalInput a GROUP BY a.category")
    List<Object[]> getStockByCategory();

    @Query("SELECT COALESCE(SUM(a.quantityDistributed), 0) FROM AgriculturalInput a")
    long getTotalDistributed();
}

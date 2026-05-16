package com.agrobus.backend.repository;

import com.agrobus.backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByStatus(Supplier.Status status);
}

package com.agrobus.backend.repository;

import com.agrobus.backend.entity.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    Page<Loan> findByStatus(Loan.LoanStatus status, Pageable pageable);
    List<Loan> findByFarmerId(Long farmerId);
    long countByStatus(Loan.LoanStatus status);

    @Query("SELECT COALESCE(SUM(l.estimatedCost), 0) FROM Loan l WHERE l.status IN ('APPROVED', 'DELIVERED', 'REPAID')")
    BigDecimal getTotalApprovedAmount();

    @Query("SELECT COALESCE(SUM(l.amountRepaid), 0) FROM Loan l")
    BigDecimal getTotalRepaidAmount();

    @Query("SELECT COALESCE(SUM(l.remainingBalance), 0) FROM Loan l WHERE l.status IN ('APPROVED', 'DELIVERED')")
    BigDecimal getTotalOutstandingBalance();

    @Query("SELECT l FROM Loan l ORDER BY l.requestDate DESC")
    Page<Loan> findRecentLoans(Pageable pageable);

    @Query("SELECT MONTH(l.requestDate) as month, COUNT(l) as count FROM Loan l WHERE YEAR(l.requestDate) = YEAR(CURRENT_DATE) GROUP BY MONTH(l.requestDate) ORDER BY month")
    List<Object[]> getLoanTrendsByMonth();

    @Query("SELECT l.status, COUNT(l) FROM Loan l GROUP BY l.status")
    List<Object[]> getLoanCountByStatus();
}

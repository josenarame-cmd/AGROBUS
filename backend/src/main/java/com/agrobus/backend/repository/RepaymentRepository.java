package com.agrobus.backend.repository;

import com.agrobus.backend.entity.Repayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface RepaymentRepository extends JpaRepository<Repayment, Long> {
    List<Repayment> findByLoanId(Long loanId);
    List<Repayment> findByFarmerId(Long farmerId);

    @Query("SELECT COALESCE(SUM(r.amountPaid), 0) FROM Repayment r")
    BigDecimal getTotalRepayments();

    @Query("SELECT MONTH(r.paymentDate) as month, SUM(r.amountPaid) as total FROM Repayment r WHERE YEAR(r.paymentDate) = YEAR(CURRENT_DATE) GROUP BY MONTH(r.paymentDate) ORDER BY month")
    List<Object[]> getRepaymentTrendsByMonth();
}

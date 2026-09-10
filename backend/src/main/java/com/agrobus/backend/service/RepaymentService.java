package com.agrobus.backend.service;

import com.agrobus.backend.entity.Loan;
import com.agrobus.backend.entity.Notification;
import com.agrobus.backend.entity.Repayment;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.LoanRepository;
import com.agrobus.backend.repository.RepaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class RepaymentService {

    private final RepaymentRepository repaymentRepository;
    private final LoanRepository loanRepository;
    private final NotificationService notificationService;
    private final LoanService loanService;

    /**
     * @Lazy on LoanService breaks the circular dependency:
     *   LoanService → RepaymentService (credit score bonus)
     *   RepaymentService → LoanService (fetch loan / apply bonus)
     */
    public RepaymentService(RepaymentRepository repaymentRepository,
                            LoanRepository loanRepository,
                            NotificationService notificationService,
                            @Lazy LoanService loanService) {
        this.repaymentRepository = repaymentRepository;
        this.loanRepository = loanRepository;
        this.notificationService = notificationService;
        this.loanService = loanService;
    }

    @Transactional
    public Repayment recordRepayment(Repayment repayment) {
        Loan loan = loanRepository.findById(repayment.getLoan().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        if (loan.getStatus() == Loan.LoanStatus.REPAID) {
            throw new IllegalStateException("This loan has already been fully repaid.");
        }
        if (loan.getStatus() == Loan.LoanStatus.REJECTED || loan.getStatus() == Loan.LoanStatus.PENDING) {
            throw new IllegalStateException("Cannot record repayment for a loan in status: " + loan.getStatus());
        }

        BigDecimal newRepaid  = loan.getAmountRepaid().add(repayment.getAmountPaid());
        BigDecimal newBalance = loan.getEstimatedCost().subtract(newRepaid);

        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Payment exceeds remaining balance. Remaining: " + loan.getRemainingBalance());
        }

        loan.setAmountRepaid(newRepaid);
        loan.setRemainingBalance(newBalance);

        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
            loan.setStatus(Loan.LoanStatus.REPAID);

            // ── Credit score bonus on full repayment ───────────────────────
            loanService.applyRepaymentBonus(loan.getFarmer());

            notificationService.createNotification(
                    "Loan Fully Repaid",
                    "Loan #" + loan.getId() + " has been fully repaid. Well done!",
                    Notification.NotificationType.SYSTEM,
                    loan.getFarmer().getId(), "FARMER"
            );
        }

        loanRepository.save(loan);
        repayment.setRemainingBalance(newBalance);
        repayment.setFarmer(loan.getFarmer());
        return repaymentRepository.save(repayment);
    }

    public List<Repayment> getRepaymentsByLoan(Long loanId) {
        return repaymentRepository.findByLoanId(loanId);
    }

    public List<Repayment> getRepaymentsByFarmer(Long farmerId) {
        return repaymentRepository.findByFarmerId(farmerId);
    }

    public List<Repayment> getAllRepayments() {
        return repaymentRepository.findAll();
    }

    public BigDecimal getTotalRepayments() {
        return repaymentRepository.getTotalRepayments();
    }
}

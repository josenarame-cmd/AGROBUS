package com.agrobus.backend.service;

import com.agrobus.backend.entity.Loan;
import com.agrobus.backend.entity.Notification;
import com.agrobus.backend.entity.Repayment;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.LoanRepository;
import com.agrobus.backend.repository.RepaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RepaymentService {

    private final RepaymentRepository repaymentRepository;
    private final LoanRepository loanRepository;
    private final NotificationService notificationService;

    public Repayment recordRepayment(Repayment repayment) {
        Loan loan = loanRepository.findById(repayment.getLoan().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        BigDecimal newRepaid = loan.getAmountRepaid().add(repayment.getAmountPaid());
        BigDecimal newBalance = loan.getEstimatedCost().subtract(newRepaid);

        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Payment exceeds remaining balance");
        }

        loan.setAmountRepaid(newRepaid);
        loan.setRemainingBalance(newBalance);

        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
            loan.setStatus(Loan.LoanStatus.REPAID);
            notificationService.createNotification(
                    "Loan Fully Repaid",
                    "Loan #" + loan.getId() + " has been fully repaid.",
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

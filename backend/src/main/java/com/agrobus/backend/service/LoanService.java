package com.agrobus.backend.service;

import com.agrobus.backend.entity.Loan;
import com.agrobus.backend.entity.Notification;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final NotificationService notificationService;

    public Loan createLoan(Loan loan) {
        loan.setStatus(Loan.LoanStatus.PENDING);
        loan.setAmountRepaid(BigDecimal.ZERO);
        loan.setRemainingBalance(loan.getEstimatedCost());
        Loan saved = loanRepository.save(loan);

        notificationService.createNotification(
                "New Loan Request",
                "Farmer " + loan.getFarmer().getFullName() + " requested a loan of " + loan.getEstimatedCost(),
                Notification.NotificationType.SYSTEM,
                null, "ADMIN"
        );

        return saved;
    }

    public Loan approveLoan(Long id) {
        Loan loan = getLoanById(id);
        loan.setStatus(Loan.LoanStatus.APPROVED);
        loan.setApprovalDate(LocalDateTime.now());
        Loan saved = loanRepository.save(loan);

        notificationService.createNotification(
                "Loan Approved",
                "Your loan request #" + loan.getId() + " has been approved!",
                Notification.NotificationType.LOAN_APPROVAL,
                loan.getFarmer().getId(), "FARMER"
        );

        return saved;
    }

    public Loan rejectLoan(Long id, String reason) {
        Loan loan = getLoanById(id);
        loan.setStatus(Loan.LoanStatus.REJECTED);
        loan.setRejectionReason(reason);
        Loan saved = loanRepository.save(loan);

        notificationService.createNotification(
                "Loan Rejected",
                "Your loan request #" + loan.getId() + " has been rejected. Reason: " + reason,
                Notification.NotificationType.LOAN_REJECTION,
                loan.getFarmer().getId(), "FARMER"
        );

        return saved;
    }

    public Loan markDelivered(Long id) {
        Loan loan = getLoanById(id);
        loan.setStatus(Loan.LoanStatus.DELIVERED);
        loan.setDeliveryDate(LocalDateTime.now());
        Loan saved = loanRepository.save(loan);

        notificationService.createNotification(
                "Inputs Delivered",
                "Agricultural inputs for loan #" + loan.getId() + " have been delivered.",
                Notification.NotificationType.INPUT_DELIVERY,
                loan.getFarmer().getId(), "FARMER"
        );

        return saved;
    }

    public Loan getLoanById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + id));
    }

    public Page<Loan> getAllLoans(Pageable pageable) {
        return loanRepository.findAll(pageable);
    }

    public Page<Loan> getLoansByStatus(Loan.LoanStatus status, Pageable pageable) {
        return loanRepository.findByStatus(status, pageable);
    }

    public List<Loan> getLoansByFarmer(Long farmerId) {
        return loanRepository.findByFarmerId(farmerId);
    }

    public Page<Loan> getRecentLoans(Pageable pageable) {
        return loanRepository.findRecentLoans(pageable);
    }
}

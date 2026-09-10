package com.agrobus.backend.service;

import com.agrobus.backend.dto.LoanRequest;
import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.entity.Loan;
import com.agrobus.backend.entity.Notification;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.FarmerRepository;
import com.agrobus.backend.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final FarmerRepository farmerRepository;
    private final NotificationService notificationService;

    // ── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public Loan createLoan(LoanRequest request) {
        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with id: " + request.getFarmerId()));

        Loan loan = Loan.builder()
                .farmer(farmer)
                .cropType(request.getCropType())
                .requestedInputs(request.getRequestedInputs())
                .quantity(request.getQuantity())
                .estimatedCost(request.getEstimatedCost())
                .farmSize(request.getFarmSize())
                .season(request.getSeason())
                .status(Loan.LoanStatus.PENDING)
                .amountRepaid(BigDecimal.ZERO)
                .remainingBalance(request.getEstimatedCost())
                .build();

        Loan saved = loanRepository.save(loan);

        notificationService.createNotification(
                "New Loan Request",
                "Farmer " + farmer.getFullName() + " requested a loan of " + request.getEstimatedCost(),
                Notification.NotificationType.SYSTEM,
                null, "ADMIN"
        );

        return saved;
    }

    // ── Lifecycle transitions ─────────────────────────────────────────────────

    @Transactional
    public Loan approveLoan(Long id) {
        Loan loan = getLoanById(id);

        if (loan.getStatus() != Loan.LoanStatus.PENDING) {
            throw new IllegalStateException("Only PENDING loans can be approved. Current status: " + loan.getStatus());
        }

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

    @Transactional
    public Loan rejectLoan(Long id, String reason) {
        Loan loan = getLoanById(id);

        if (loan.getStatus() != Loan.LoanStatus.PENDING) {
            throw new IllegalStateException("Only PENDING loans can be rejected. Current status: " + loan.getStatus());
        }

        loan.setStatus(Loan.LoanStatus.REJECTED);
        loan.setRejectionReason(reason);
        Loan saved = loanRepository.save(loan);

        // ── Credit score penalty ────────────────────────────────────────────
        Farmer farmer = loan.getFarmer();
        farmer.applyRejectionPenalty();
        farmerRepository.save(farmer);

        notificationService.createNotification(
                "Loan Rejected",
                "Your loan request #" + loan.getId() + " has been rejected. Reason: " + reason,
                Notification.NotificationType.LOAN_REJECTION,
                farmer.getId(), "FARMER"
        );

        return saved;
    }

    @Transactional
    public Loan markDelivered(Long id) {
        Loan loan = getLoanById(id);

        if (loan.getStatus() != Loan.LoanStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED loans can be marked as delivered. Current status: " + loan.getStatus());
        }

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

    // ── Credit score bonus — called by RepaymentService when loan is fully repaid ──

    @Transactional
    public void applyRepaymentBonus(Farmer farmer) {
        farmer.applyRepaymentBonus();
        farmerRepository.save(farmer);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

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

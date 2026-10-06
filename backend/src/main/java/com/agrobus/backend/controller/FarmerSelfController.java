package com.agrobus.backend.controller;

import com.agrobus.backend.dto.FarmerDashboardDTO;
import com.agrobus.backend.dto.FarmerProfileDTO;
import com.agrobus.backend.dto.FarmerProfileUpdateRequest;
import com.agrobus.backend.dto.LoanRequest;
import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.entity.Loan;
import com.agrobus.backend.entity.Notification;
import com.agrobus.backend.entity.Repayment;
import com.agrobus.backend.entity.User;
import com.agrobus.backend.entity.Farm;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.FarmRepository;
import com.agrobus.backend.repository.FarmerRepository;
import com.agrobus.backend.repository.LoanRepository;
import com.agrobus.backend.repository.NotificationRepository;
import com.agrobus.backend.repository.RepaymentRepository;
import com.agrobus.backend.repository.UserRepository;
import com.agrobus.backend.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;

/**
 * Farmer self-service endpoints — scoped strictly to the authenticated
 * FARMER's own data. No admin or agent access.
 *
 * Base path: /api/farmer  (farms are at /api/farmer/farms via FarmerFarmController)
 */
@RestController
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasRole('FARMER')")
public class FarmerSelfController {

    private final UserRepository       userRepository;
    private final FarmerRepository     farmerRepository;
    private final LoanRepository       loanRepository;
    private final LoanService          loanService;
    private final RepaymentRepository  repaymentRepository;
    private final NotificationRepository notificationRepository;
    private final FarmRepository       farmRepository;

    // ── Personal dashboard ────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<FarmerDashboardDTO> getDashboard(Authentication auth) {
        Farmer farmer = resolveFarmer(auth);

        List<Loan> loans = loanRepository.findByFarmerId(farmer.getId());

        BigDecimal totalBorrowed    = loans.stream()
                .filter(l -> l.getStatus() != Loan.LoanStatus.REJECTED)
                .map(Loan::getEstimatedCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRepaid      = loans.stream()
                .map(Loan::getAmountRepaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingBalance = loans.stream()
                .filter(l -> l.getStatus() == Loan.LoanStatus.APPROVED
                        || l.getStatus() == Loan.LoanStatus.DELIVERED)
                .map(Loan::getRemainingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Farm> farms = farmRepository.findByOwnerIdOrderByCreatedAtDesc(resolveFarmerUserId(auth));
        
        long farmCount = farms.size();
        
        Double totalFarmsHectares = farms.stream()
            .map(f -> f.getSizeHectares())
            .filter(size -> size != null)
            .reduce(0.0, (a, b) -> a + b);
            
        long uniqueCropsCount = farms.stream()
            .map(f -> f.getPrimaryCrop())
            .filter(crop -> crop != null && !crop.trim().isEmpty())
            .map(c -> c.trim().toLowerCase())
            .distinct()
            .count();

        FarmerDashboardDTO dto = FarmerDashboardDTO.builder()
                .farmerId(farmer.getId())
                .fullName(farmer.getFullName())
                .creditScore(farmer.getCreditScore())
                .district(farmer.getDistrict())
                .sector(farmer.getSector())
                .farmSize(farmer.getFarmSize())
                .cropType(farmer.getCropType())
                .status(farmer.getStatus())
                .totalLoans(loans.size())
                .pendingLoans(loans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.PENDING).count())
                .approvedLoans(loans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.APPROVED).count())
                .deliveredLoans(loans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.DELIVERED).count())
                .repaidLoans(loans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.REPAID).count())
                .rejectedLoans(loans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.REJECTED).count())
                .totalBorrowed(totalBorrowed)
                .totalRepaid(totalRepaid)
                .outstandingBalance(outstandingBalance)
                .totalFarms(farmCount)
                .totalFarmsHectares(totalFarmsHectares)
                .uniqueCropsCount(uniqueCropsCount)
                .build();

        return ResponseEntity.ok(dto);
    }

    // ── Extended Farmer Profile ───────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<FarmerProfileDTO> getFarmerProfile(Authentication auth) {
        Farmer farmer = resolveFarmer(auth);
        return ResponseEntity.ok(toFarmerProfileDTO(farmer));
    }

    @PutMapping("/profile")
    public ResponseEntity<FarmerProfileDTO> updateFarmerProfile(
            @Valid @RequestBody FarmerProfileUpdateRequest request, Authentication auth) {
        Farmer farmer = resolveFarmer(auth);
        
        farmer.setNationalId(request.getNationalId().trim());
        farmer.setDistrict(request.getDistrict().trim());
        
        if (request.getSector() != null && !request.getSector().isBlank()) {
            farmer.setSector(request.getSector().trim());
        }
        if (request.getFarmSize() != null) {
            farmer.setFarmSize(request.getFarmSize());
        }
        if (request.getCropType() != null && !request.getCropType().isBlank()) {
            farmer.setCropType(request.getCropType().trim());
        }
        if (request.getGender() != null && !request.getGender().isBlank()) {
            try {
                farmer.setGender(Farmer.Gender.valueOf(request.getGender().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }
        
        Farmer saved = farmerRepository.save(farmer);
        return ResponseEntity.ok(toFarmerProfileDTO(saved));
    }

    // ── Own loans ─────────────────────────────────────────────────────────────

    @GetMapping("/loans")
    public ResponseEntity<List<Loan>> getMyLoans(Authentication auth) {
        Farmer farmer = resolveFarmer(auth);
        List<Loan> loans = loanRepository.findByFarmerId(farmer.getId());
        // sort newest first
        loans.sort((a, b) -> b.getRequestDate().compareTo(a.getRequestDate()));
        return ResponseEntity.ok(loans);
    }

    @PostMapping("/loans")
    public ResponseEntity<Loan> requestLoan(@Valid @RequestBody LoanRequest request, Authentication auth) {
        Farmer farmer = resolveFarmer(auth);
        // Force the requested loan to be linked to the current authenticated farmer
        request.setFarmerId(farmer.getId());
        Loan loan = loanService.createLoan(request);
        return ResponseEntity.ok(loan);
    }

    // ── Own repayments ────────────────────────────────────────────────────────

    @GetMapping("/repayments")
    public ResponseEntity<List<Repayment>> getMyRepayments(Authentication auth) {
        Farmer farmer = resolveFarmer(auth);
        List<Repayment> repayments = repaymentRepository.findByFarmerId(farmer.getId());
        repayments.sort((a, b) -> b.getPaymentDate().compareTo(a.getPaymentDate()));
        return ResponseEntity.ok(repayments);
    }

    // ── Own notifications ─────────────────────────────────────────────────────

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(
                notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/notifications/all")
    public ResponseEntity<Object> getAllMyNotifications(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = currentUser(auth);
        return ResponseEntity.ok(
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                        user.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    /**
     * Farmer-scoped mark-as-read. Verifies the notification belongs to this user
     * before marking it read, preventing cross-user tampering.
     */
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markMyNotificationRead(
            @PathVariable Long id, Authentication auth) {
        User user = currentUser(auth);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!user.getId().equals(notification.getRecipientId())) {
            return ResponseEntity.status(403).build();
        }
        notification.setRead(true);
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Resolves the Farmer record for the currently authenticated User.
     * Throws 404 if this User has no linked Farmer profile yet.
     */
    private Farmer resolveFarmer(Authentication auth) {
        User user = currentUser(auth);
        return farmerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No farmer profile linked to this account. Please contact your agent."));
    }

    private Long resolveFarmerUserId(Authentication auth) {
        return currentUser(auth).getId();
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Authenticated user not found"));
    }

    private FarmerProfileDTO toFarmerProfileDTO(Farmer farmer) {
        return FarmerProfileDTO.builder()
                .farmerId(farmer.getId())
                .fullName(farmer.getFullName())
                .nationalId(farmer.getNationalId())
                .phone(farmer.getPhone())
                .gender(farmer.getGender())
                .district(farmer.getDistrict())
                .sector(farmer.getSector())
                .farmSize(farmer.getFarmSize())
                .cropType(farmer.getCropType())
                .creditScore(farmer.getCreditScore())
                .status(farmer.getStatus())
                .registrationDate(farmer.getRegistrationDate())
                .build();
    }
}

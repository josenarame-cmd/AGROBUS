package com.agrobus.backend.service;

import com.agrobus.backend.config.JwtService;
import com.agrobus.backend.dto.AuthRequest;
import com.agrobus.backend.dto.AuthResponse;
import com.agrobus.backend.dto.RegisterRequest;
import com.agrobus.backend.dto.UpdateProfileRequest;
import com.agrobus.backend.dto.UserProfileDTO;
import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.entity.User;
import com.agrobus.backend.repository.FarmerRepository;
import com.agrobus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // ── Spring Security ───────────────────────────────────────────────────────

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    // ── Local authentication ──────────────────────────────────────────────────

    public AuthResponse authenticate(AuthRequest request, AuthenticationManager authManager) {
        User existingUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));

        if (existingUser.getAuthProvider() == User.AuthProviderType.GOOGLE) {
            throw new IllegalArgumentException("This account uses Google sign-in. Please use the Google button.");
        }

        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        return toAuthResponse(existingUser);
    }

    /**
     * Registers a new FARMER user and automatically creates a linked
     * Farmer profile so the user can immediately access farmer endpoints.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .authProvider(User.AuthProviderType.LOCAL)
                .role(User.Role.FARMER)
                .active(true)
                .build();

        user = userRepository.save(user);

        // Auto-create a Farmer profile linked to this User account
        // so the FARMER can immediately use /api/farmer/* endpoints.
        if (!farmerRepository.findByUserId(user.getId()).isPresent()) {
            Farmer farmer = Farmer.builder()
                    .fullName(user.getFullName())
                    .nationalId("PENDING-" + user.getId())   // placeholder — agent should update
                    .phone(user.getPhone() != null ? user.getPhone() : "PENDING-" + user.getId())
                    .userId(user.getId())
                    .district("Unknown")                      // agent should update
                    .status(Farmer.Status.ACTIVE)
                    .build();
            farmerRepository.save(farmer);
        }

        return toAuthResponse(user);
    }

    // ── Google OAuth2 ─────────────────────────────────────────────────────────

    public AuthResponse authenticateGoogle(OAuth2User googleUser) {
        String email          = googleUser.getAttribute("email");
        Boolean emailVerified = googleUser.getAttribute("email_verified");
        String providerSubject = googleUser.getAttribute("sub");

        if (email == null || email.isBlank() || !Boolean.TRUE.equals(emailVerified)
                || providerSubject == null || providerSubject.isBlank()) {
            throw new IllegalArgumentException("Google did not provide a verified email identity");
        }

        User user = userRepository
                .findByAuthProviderAndProviderSubject(User.AuthProviderType.GOOGLE, providerSubject)
                .orElseGet(() -> createOrRejectGoogleUser(googleUser, email, providerSubject));

        if (!user.isEnabled()) {
            throw new IllegalStateException("This account is disabled");
        }

        // Keep profile picture in sync
        String pictureUrl = googleUser.getAttribute("picture");
        if (pictureUrl != null && !pictureUrl.isBlank() && !pictureUrl.equals(user.getPictureUrl())) {
            user.setPictureUrl(pictureUrl);
            userRepository.save(user);
        }

        return toAuthResponse(user);
    }

    @Transactional
    private User createOrRejectGoogleUser(OAuth2User googleUser, String email, String providerSubject) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException(
                    "An AGROBUS account already exists for this email. Sign in with your password.");
        }

        String fullName = googleUser.getAttribute("name");
        if (fullName == null || fullName.isBlank()) {
            fullName = email.substring(0, email.indexOf('@'));
        }

        User user = User.builder()
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .authProvider(User.AuthProviderType.GOOGLE)
                .providerSubject(providerSubject)
                .pictureUrl(googleUser.getAttribute("picture"))
                .role(User.Role.FARMER)
                .active(true)
                .build();

        user = userRepository.save(user);

        // Auto-create Farmer profile for Google-registered farmers too
        Farmer farmer = Farmer.builder()
                .fullName(user.getFullName())
                .nationalId("PENDING-" + user.getId())
                .phone("PENDING-" + user.getId())
                .userId(user.getId())
                .district("Unknown")
                .status(Farmer.Status.ACTIVE)
                .build();
        farmerRepository.save(farmer);

        return user;
    }

    // ── Profile management ────────────────────────────────────────────────────

    public UserProfileDTO getCurrentProfile(Authentication authentication) {
        return toProfile(currentUser(authentication));
    }

    public UserProfileDTO updateCurrentProfile(Authentication authentication, UpdateProfileRequest request) {
        User user = currentUser(authentication);
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone() == null || request.getPhone().isBlank()
                ? null : request.getPhone().trim());
        return toProfile(userRepository.save(user));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    public AuthResponse toAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .pictureUrl(user.getPictureUrl())
                .phone(user.getPhone())
                .build();
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Authenticated user not found"));
    }

    private UserProfileDTO toProfile(User user) {
        return UserProfileDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .pictureUrl(user.getPictureUrl())
                .role(user.getRole().name())
                .active(user.isActive())
                .build();
    }
}

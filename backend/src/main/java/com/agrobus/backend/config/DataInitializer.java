package com.agrobus.backend.config;

import com.agrobus.backend.entity.User;
import com.agrobus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with default ADMIN and AGENT accounts on every startup
 * (only if those emails don't already exist). These are the only way to obtain
 * ADMIN/AGENT roles — self-registration always creates FARMER accounts.
 *
 * Default credentials (CHANGE IN PRODUCTION):
 *   admin@agrobus.rw / Admin@1234
 *   agent@agrobus.rw / Agent@1234
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin@agrobus.rw", "Admin@1234", "System Administrator", "+250700000001", User.Role.ADMIN);
        seedUser("agent@agrobus.rw", "Agent@1234", "Default Field Agent",  "+250700000002", User.Role.AGENT);
    }

    private void seedUser(String email, String rawPassword, String fullName, String phone, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            log.debug("Seed user already exists: {}", email);
            return;
        }
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .phone(phone)
                .role(role)
                .authProvider(User.AuthProviderType.LOCAL)
                .active(true)
                .build();
        userRepository.save(user);
        log.info("Seeded {} user: {}", role, email);
    }
}

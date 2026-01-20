package com.cupl.backend.config;

import com.cupl.backend.model.User;
import com.cupl.backend.model.User.UserRole;
import com.cupl.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize RamiUser@gmail.com (case-insensitive check)
        String userEmail = "RamiUser@gmail.com";
        if (!userRepository.existsByEmail(userEmail)) {
            User user = new User();
            user.setEmail(userEmail);
            user.setPassword(passwordEncoder.encode("Rami2004"));
            user.setRole(UserRole.USER);
            userRepository.save(user);
            System.out.println("Initialized user: " + userEmail);
        } else {
            System.out.println("User already exists: " + userEmail);
        }

        // Initialize RamiAdmin@gmail.com (case-insensitive check)
        String adminEmail = "RamiAdmin@gmail.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Rami2004"));
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
            System.out.println("Initialized admin: " + adminEmail);
        } else {
            System.out.println("Admin already exists: " + adminEmail);
        }
    }
}

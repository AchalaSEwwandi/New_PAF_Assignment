package com.smartcampus;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SmartCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail("admin@campus.edu").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setFullName("Admin User");
                admin.setEmail("admin@campus.edu");
                admin.setPasswordHash("$2a$10$srmqhWexszyau2gmpVT6/OrtNtDMWVBXIfgg3IySYxUTforpavBw2");
                admin.setRole(User.Role.ADMIN);
                admin.setStatus(User.Status.ACTIVE);
                admin.setActive(true);
                userRepository.save(admin);
                System.out.println("Default Admin User securely seeded into MongoDB Atlas Collection!");
            }
        };
    }
}

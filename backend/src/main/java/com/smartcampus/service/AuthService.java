package com.smartcampus.service;

import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.GoogleTokenRequest;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.RegisterRequest;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.smartcampus.repository.PasswordResetTokenRepository tokenRepository;

    public AuthResponse authenticate(LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                if (user.getStatus() == User.Status.PENDING) {
                    return new AuthResponse("Waiting for admin approval. Please contact your administrator.");
                }


                if (user.getActive()) {
                    String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
                    return new AuthResponse(jwt, user);
                } else {
                    return new AuthResponse("Account is inactive. Please contact your administrator.");
                }
            } else {
                return new AuthResponse("User not found");
            }
        } catch (BadCredentialsException e) {
            return new AuthResponse("Invalid email or password");
        } catch (Exception e) {
            return new AuthResponse("Authentication failed: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public AuthResponse authenticateWithGoogle(GoogleTokenRequest tokenRequest) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(tokenRequest.getToken());
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> googleResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            Map<String, Object> userInfo = googleResponse.getBody();
            if (userInfo == null || !userInfo.containsKey("email")) {
                return new AuthResponse("Could not retrieve email from Google token.");
            }

            String googleEmail = (String) userInfo.get("email");
            String googleName = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub");

            Optional<User> userOpt = userRepository.findByEmail(googleEmail);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                if (user.getStatus() == User.Status.PENDING) {
                    return new AuthResponse("Waiting for admin approval. Please contact your administrator.");
                }

                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    user.setStatus(User.Status.ACTIVE);
                    user.setRole(User.Role.STUDENT);
                    userRepository.save(user);
                }

                String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
                return new AuthResponse(jwt, user);
            } else {
                if (tokenRequest.getRole() == null || tokenRequest.getRole().trim().isEmpty()) {
                    return new AuthResponse("ROLE_REQUIRED");
                }

                User newUser = new User();
                newUser.setFullName(googleName != null ? googleName : "Google User");
                newUser.setEmail(googleEmail);
                newUser.setUsername(googleEmail.split("@")[0]);
                newUser.setGoogleId(googleId);
                newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));

                try {
                    User.Role role = User.Role.valueOf(tokenRequest.getRole().toUpperCase());
                    newUser.setRole(role);
                    if (role == User.Role.STUDENT) {
                        newUser.setStatus(User.Status.ACTIVE);
                    } else {
                        newUser.setStatus(User.Status.PENDING);
                    }
                } catch (Exception e) {
                    newUser.setRole(User.Role.STUDENT);
                    newUser.setStatus(User.Status.ACTIVE);
                }

                newUser.setActive(true);
                userRepository.save(newUser);

                if (newUser.getStatus() == User.Status.PENDING) {
                    return new AuthResponse("Registration successful. Waiting for admin approval.");
                } else {
                    String jwt = jwtUtil.generateToken(newUser.getEmail(), newUser.getRole().name());
                    return new AuthResponse(jwt, newUser);
                }
            }
        } catch (Exception e) {
            return new AuthResponse("Google authentication failed: " + e.getMessage());
        }
    }
    public AuthResponse register(RegisterRequest request) {
        try {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return new AuthResponse("Email is already taken");
            }

            User newUser = new User();
            newUser.setUsername(request.getEmail().split("@")[0]);
            newUser.setFullName(request.getName() != null ? request.getName() : "New User");
            newUser.setEmail(request.getEmail());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));

            try {
                User.Role role = User.Role.valueOf(request.getRole().toUpperCase());
                newUser.setRole(role);
                if (role == User.Role.STUDENT) {
                    newUser.setStatus(User.Status.ACTIVE);
                } else {
                    newUser.setStatus(User.Status.PENDING);
                }
            } catch (Exception e) {
                newUser.setRole(User.Role.STUDENT);
                newUser.setStatus(User.Status.ACTIVE);
            }

            newUser.setActive(true);
            userRepository.save(newUser);

            return new AuthResponse("Registration successful");
        } catch (Exception e) {
            return new AuthResponse("Registration failed: " + e.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse forgotPassword(com.smartcampus.dto.ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (!userOpt.isPresent()) {
            return new AuthResponse("If that email address is in our database, we will send you an email to reset your password.");
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        
        tokenRepository.deleteByUser(user); // Delete any existing token

        com.smartcampus.model.PasswordResetToken resetToken = new com.smartcampus.model.PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String emailText = "To reset your password, click the link below:\n" + resetUrl;

        emailService.sendEmail(user.getEmail(), "Password Reset Request", emailText);

        return new AuthResponse("If that email address is in our database, we will send you an email to reset your password.");
    }

    public AuthResponse resetPassword(com.smartcampus.dto.ResetPasswordRequest request) {
        Optional<com.smartcampus.model.PasswordResetToken> tokenOpt = tokenRepository.findByToken(request.getToken());

        if (!tokenOpt.isPresent() || tokenOpt.get().isExpired()) {
            return new AuthResponse("Invalid or expired password reset token.");
        }

        User user = tokenOpt.get().getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        tokenRepository.delete(tokenOpt.get());

        return new AuthResponse("Password successfully reset.");
    }
}

package com.smartcampus.util;

import org.springframework.stereotype.Component;

import java.util.Base64;

@Component
public class JwtUtil {

    private Long expiration = 86400000L;

    public String generateToken(String email, String role) {
        // Simple JWT-like token for demo purposes
        // In production, use proper JWT library
        long expirationTime = System.currentTimeMillis() + expiration;
        
        String tokenPayload = email + ":" + role + ":" + expirationTime;
        
        return Base64.getEncoder().encodeToString(tokenPayload.getBytes());
    }

    public String extractEmail(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token));
            String[] parts = decoded.split(":");
            return parts[0]; // email is first part
        } catch (Exception e) {
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token));
            String[] parts = decoded.split(":");
            return parts[1]; // role is second part
        } catch (Exception e) {
            return null;
        }
    }

    public Boolean validateToken(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token));
            String[] parts = decoded.split(":");
            long expirationTime = Long.parseLong(parts[2]);
            
            return System.currentTimeMillis() < expirationTime;
        } catch (Exception e) {
            return false;
        }
    }
}

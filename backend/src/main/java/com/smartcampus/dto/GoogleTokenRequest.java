package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleTokenRequest {


    @NotBlank(message = "Google token is required")
    private String token;

    private String role;

    // Getters and setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

}



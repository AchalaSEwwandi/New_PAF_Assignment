package com.smartcampus.dto;

import com.smartcampus.model.User;

public class AuthResponse {

    private String token;
    private String message;
    private boolean success;
    private String role;
    private String email;
    private String fullName;
    private String status;
    private String jwt;
    private User user;

    public AuthResponse(String message) {
        this.message = message;
        this.success = false;
    }

    public AuthResponse(String token, User user) {
        this.token = token;
        this.jwt = token;
        this.user = user;
        this.success = true;
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.role = user.getRole() != null ? user.getRole().name() : null;
        this.status = user.getStatus() != null ? user.getStatus().name() : null;
    }

    public String getJwt() { return jwt; }
    public void setJwt(String jwt) { this.jwt = jwt; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}


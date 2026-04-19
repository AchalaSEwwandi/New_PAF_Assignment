package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import com.smartcampus.model.User;

public class RoleRequest {
    
    @NotBlank(message = "Role is required")
    private User.Role role;
    
    // Getters and setters
    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }
}

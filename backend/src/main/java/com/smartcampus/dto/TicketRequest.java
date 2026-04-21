package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class TicketRequest {

    @NotBlank(message = "Resource or location is required")
    private String resourceOrLocation;

    @NotNull(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority;

    // Optional contact details
    private String preferredContactName;

    @Email(message = "Preferred contact email must be a valid email address")
    private String preferredContactEmail;

    private String preferredContactPhone;

    // Base64-encoded images (max 3)
    @Size(max = 3, message = "Maximum 3 image attachments are allowed")
    private List<String> imageAttachments;

    // ---- Getters & Setters ----

    public String getResourceOrLocation() { return resourceOrLocation; }
    public void setResourceOrLocation(String resourceOrLocation) { this.resourceOrLocation = resourceOrLocation; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getPreferredContactName() { return preferredContactName; }
    public void setPreferredContactName(String preferredContactName) { this.preferredContactName = preferredContactName; }

    public String getPreferredContactEmail() { return preferredContactEmail; }
    public void setPreferredContactEmail(String preferredContactEmail) { this.preferredContactEmail = preferredContactEmail; }

    public String getPreferredContactPhone() { return preferredContactPhone; }
    public void setPreferredContactPhone(String preferredContactPhone) { this.preferredContactPhone = preferredContactPhone; }

    public List<String> getImageAttachments() { return imageAttachments; }
    public void setImageAttachments(List<String> imageAttachments) { this.imageAttachments = imageAttachments; }
}

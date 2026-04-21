package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tickets")
public class Ticket {

    public enum Status {
        OPEN,
        IN_PROGRESS,
        ON_HOLD,
        RESOLVED,
        CLOSED,
        REJECTED
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum Category {
        ELECTRICAL,
        PLUMBING,
        IT_EQUIPMENT,
        HVAC,
        STRUCTURAL,
        CLEANING,
        SECURITY,
        FURNITURE,
        OTHER
    }

    @Id
    private String id;

    @DBRef
    private User createdBy;

    @DBRef
    private User assignedTo;

    // Resource/location as a free-text field (no DBRef required)
    @Field("resource_or_location")
    private String resourceOrLocation;

    private String title;

    private String description;

    private Category category;

    private Status status = Status.OPEN;

    private Priority priority = Priority.MEDIUM;

    // Contact details
    @Field("preferred_contact_name")
    private String preferredContactName;

    @Field("preferred_contact_email")
    private String preferredContactEmail;

    @Field("preferred_contact_phone")
    private String preferredContactPhone;

    // Up to 3 image attachment paths/URLs stored as Base64 data URIs or storage paths
    @Field("image_attachments")
    private List<String> imageAttachments;

    // Rejection reason (set by admin when status = REJECTED)
    @Field("rejection_reason")
    private String rejectionReason;

    // Resolution notes (set by technician when resolving)
    @Field("resolution_notes")
    private String resolutionNotes;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    public Ticket() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }

    // ---- Getters & Setters ----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }

    public String getResourceOrLocation() { return resourceOrLocation; }
    public void setResourceOrLocation(String resourceOrLocation) { this.resourceOrLocation = resourceOrLocation; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getPreferredContactName() { return preferredContactName; }
    public void setPreferredContactName(String preferredContactName) { this.preferredContactName = preferredContactName; }

    public String getPreferredContactEmail() { return preferredContactEmail; }
    public void setPreferredContactEmail(String preferredContactEmail) { this.preferredContactEmail = preferredContactEmail; }

    public String getPreferredContactPhone() { return preferredContactPhone; }
    public void setPreferredContactPhone(String preferredContactPhone) { this.preferredContactPhone = preferredContactPhone; }

    public List<String> getImageAttachments() { return imageAttachments; }
    public void setImageAttachments(List<String> imageAttachments) { this.imageAttachments = imageAttachments; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

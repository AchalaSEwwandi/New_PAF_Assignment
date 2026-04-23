package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

    public enum Role {
        STUDENT,
        LECTURER,
        TECHNICIAN,
        ADMIN
    }

    public enum Status {
        PENDING,
        ACTIVE,
        REJECTED
    }

    @Id
    private String id;

    private String username;

    @Field("full_name")
    private String fullName;

    private String email;

    @Field("password_hash")
    private String passwordHash;

    @Field("google_id")
    private String googleId;

    private Role role;

    private Status status = Status.PENDING;

    @Field("is_active")
    private Boolean active = true;

    @Field("notification_preferences")
    private NotificationPreferences notificationPreferences = new NotificationPreferences();

    @Field("created_at")
    private LocalDateTime createdAt;

    public static class NotificationPreferences {
        private boolean bookingUpdates = true;
        private boolean ticketUpdates = true;
        private boolean newComments = true;

        public boolean isBookingUpdates() {
            return bookingUpdates;
        }

        public void setBookingUpdates(boolean bookingUpdates) {
            this.bookingUpdates = bookingUpdates;
        }

        public boolean isTicketUpdates() {
            return ticketUpdates;
        }

        public void setTicketUpdates(boolean ticketUpdates) {
            this.ticketUpdates = ticketUpdates;
        }

        public boolean isNewComments() {
            return newComments;
        }

        public void setNewComments(boolean newComments) {
            this.newComments = newComments;
        }
    }

    public User() {
        this.createdAt = LocalDateTime.now();
    }

    public NotificationPreferences getNotificationPreferences() {
        return notificationPreferences;
    }

    public void setNotificationPreferences(NotificationPreferences notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

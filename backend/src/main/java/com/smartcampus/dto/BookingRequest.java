package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

/**
 * DTO for incoming booking creation / update requests.
 * Validated at the controller layer via @Valid.
 */
public class BookingRequest {

    /** The MongoDB id of the resource being booked. */
    @NotBlank(message = "Resource ID must not be blank")
    private String resourceId;

    /** Requested booking start time (ISO-8601). */
    @NotNull(message = "Start time must not be null")
    private LocalDateTime startTime;

    /** Requested booking end time (ISO-8601). */
    @NotNull(message = "End time must not be null")
    private LocalDateTime endTime;

    /** Brief description of the booking purpose. */
    @NotBlank(message = "Purpose must not be blank")
    private String purpose;

    /** Expected number of attendees (must be a positive integer). */
    @Positive(message = "Expected attendees must be a positive number")
    private int expectedAttendees;

    // -------------------------------------------------------------------------
    // No-arg constructor
    // -------------------------------------------------------------------------

    public BookingRequest() {
    }

    // -------------------------------------------------------------------------
    // Getters & Setters
    // -------------------------------------------------------------------------

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public int getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(int expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }

    // -------------------------------------------------------------------------
    // toString (useful for logging)
    // -------------------------------------------------------------------------

    @Override
    public String toString() {
        return "BookingRequest{" +
                "resourceId='" + resourceId + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", purpose='" + purpose + '\'' +
                ", expectedAttendees=" + expectedAttendees +
                '}';
    }
}

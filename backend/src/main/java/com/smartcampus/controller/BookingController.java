package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for the Booking Management module.
 *
 * <p>Base URL: {@code /api/bookings}</p>
 *
 * <ul>
 *   <li>Authenticated users can create bookings and manage their own.</li>
 *   <li>ADMIN role is required for listing all bookings and for approve/reject actions.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // -----------------------------------------------------------------------
    // Helper: extract the authenticated user's email from the security context
    // -----------------------------------------------------------------------

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // -----------------------------------------------------------------------
    // POST /api/bookings  — authenticated user creates a booking
    // -----------------------------------------------------------------------

    /**
     * Creates a new booking for the currently authenticated user.
     *
     * @param request validated booking details
     * @return 201 Created with the saved booking, or an error body
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request) {
        try {
            String email = getCurrentUserEmail();
            Booking booking = bookingService.createBooking(request, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            // Conflict detection fires a RuntimeException with a specific message
            if (e.getMessage() != null && e.getMessage().contains("conflict")) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(Map.of("error", e.getMessage()));
            }
            // User or resource not found
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to create booking: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // GET /api/bookings/my  — current user's bookings
    // -----------------------------------------------------------------------

    /**
     * Returns all bookings that belong to the currently authenticated user.
     *
     * @return 200 OK with list, or error body
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings() {
        try {
            String email = getCurrentUserEmail();
            List<Booking> bookings = bookingService.getUserBookings(email);
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to retrieve bookings: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // GET /api/bookings?status=  — ADMIN: list all (optional status filter)
    // -----------------------------------------------------------------------

    /**
     * Returns all bookings, with an optional status filter.
     * Restricted to users with the ADMIN role.
     *
     * @param status optional {@link Booking.Status} name as a query parameter
     * @return 200 OK with list, or 400 if the status value is invalid
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(required = false) String status) {
        try {
            Booking.Status statusEnum = null;
            if (status != null && !status.isBlank()) {
                try {
                    statusEnum = Booking.Status.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException ex) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid status value: " + status));
                }
            }
            List<Booking> bookings = bookingService.getAllBookings(statusEnum);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to retrieve bookings: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // PUT /api/bookings/{id}/approve  — ADMIN only
    // -----------------------------------------------------------------------

    /**
     * Approves a pending booking.
     *
     * @param id booking document id
     * @return 200 OK with updated booking, or 404 if not found
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveBooking(@PathVariable String id) {
        try {
            Booking booking = bookingService.approveBooking(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to approve booking: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // PUT /api/bookings/{id}/reject  — ADMIN only, body: {"reason":"..."}
    // -----------------------------------------------------------------------

    /**
     * Rejects a booking with an admin-supplied reason.
     *
     * @param id      booking document id
     * @param payload request body map containing a {@code "reason"} key
     * @return 200 OK with updated booking, or error body
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        try {
            String reason = payload.getOrDefault("reason", "");
            Booking booking = bookingService.rejectBooking(id, reason);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to reject booking: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // PUT /api/bookings/{id}/cancel  — booking owner only
    // -----------------------------------------------------------------------

    /**
     * Cancels a booking. Only the user who created the booking may cancel it.
     *
     * @param id booking document id
     * @return 200 OK with updated booking, 403 if not the owner, 404 if not found
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id) {
        try {
            String email = getCurrentUserEmail();
            Booking booking = bookingService.cancelBooking(id, email);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            }
            if (e.getMessage() != null && e.getMessage().contains("Unauthorised")) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to cancel booking: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // GET /api/bookings/{id}  — get single booking
    // -----------------------------------------------------------------------

    /**
     * Retrieves a single booking by its id.
     *
     * @param id booking document id
     * @return 200 OK with the booking, or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to retrieve booking: " + e.getMessage()));
        }
    }
}

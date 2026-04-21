package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.QRCodeService;
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
    private final QRCodeService  qrCodeService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService,
                             QRCodeService qrCodeService,
                             UserRepository userRepository) {
        this.bookingService  = bookingService;
        this.qrCodeService   = qrCodeService;
        this.userRepository  = userRepository;
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

    // -----------------------------------------------------------------------
    // GET /api/bookings/{id}/qr  — fetch QR code for an approved booking
    // -----------------------------------------------------------------------

    /**
     * Returns a Base64-encoded PNG QR code for the given booking.
     * Accessible by the booking owner or any ADMIN.
     */
    @GetMapping("/{id}/qr")
    public ResponseEntity<?> getQRCode(@PathVariable String id) {
        try {
            String currentEmail = getCurrentUserEmail();
            Booking booking = bookingService.getBookingById(id);

            // Ownership / role check
            User caller = userRepository.findByEmail(currentEmail).orElse(null);
            boolean isAdmin  = caller != null && "ADMIN".equalsIgnoreCase(
                               caller.getRole() != null ? caller.getRole().name() : "");
            boolean isOwner  = booking.getUser() != null &&
                               booking.getUser().getEmail().equals(currentEmail);

            if (!isAdmin && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied."));
            }

            if (booking.getStatus() != Booking.Status.APPROVED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "QR code is only available for APPROVED bookings."));
            }

            String qrBase64 = qrCodeService.generateQRCodeBase64(booking);
            return ResponseEntity.ok(Map.of("qrCode", qrBase64));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // -----------------------------------------------------------------------
    // POST /api/bookings/verify-qr  — admin endpoint to verify a QR payload
    // -----------------------------------------------------------------------

    /**
     * Verifies a raw QR payload against a booking.
     * Body: { "bookingId": "...", "payload": "..." }
     * Admin only.
     */
    @PostMapping("/verify-qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyQR(@RequestBody Map<String, String> body) {
        try {
            String bookingId = body.get("bookingId");
            String payload   = body.get("payload");

            if (bookingId == null || payload == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "bookingId and payload are required."));
            }

            Booking booking = bookingService.getBookingById(bookingId);
            boolean valid   = qrCodeService.verifyPayload(payload, booking);

            return ResponseEntity.ok(Map.of(
                    "valid",   valid,
                    "status",  booking.getStatus(),
                    "student", booking.getUser()  != null ? booking.getUser().getEmail()    : "unknown",
                    "resource",booking.getResource() != null ? booking.getResource().getName() : "unknown"
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

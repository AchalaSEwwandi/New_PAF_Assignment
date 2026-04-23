package com.smartcampus.service;

import com.smartcampus.dto.BookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business-logic layer for the booking management module.
 *
 * <p>Handles creation, retrieval, status transitions (approve / reject /
 * cancel) and ownership verification for {@link Booking} documents.</p>
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    // Constructor injection — no Lombok, no @Autowired on field
    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          ResourceRepository resourceRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.userRepository    = userRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    /**
     * Creates a new booking after validating the requesting user, the target
     * resource and the absence of time conflicts.
     *
     * @param request   validated DTO carrying booking details
     * @param userEmail JWT/principal email used to look up the requesting user
     * @return the persisted {@link Booking} with status PENDING
     * @throws RuntimeException if user or resource is not found, or a conflict exists
     */
    public Booking createBooking(BookingRequest request, String userEmail) {
        System.out.println("DEBUG: Entering createBooking for email: " + userEmail);
        
        // 1. Resolve user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with email: " + userEmail));

        // 2. Resolve resource
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException(
                        "Resource not found with id: " + request.getResourceId()));

        // 3. Conflict detection — any PENDING or APPROVED booking that overlaps
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(),
                List.of(Booking.Status.PENDING, Booking.Status.APPROVED),
                request.getEndTime(),
                request.getStartTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Booking conflict exists");
        }

        // 4. Build and persist the booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setStatus(Booking.Status.PENDING);
        // createdAt is set in the Booking no-arg constructor

        Booking saved = bookingRepository.save(booking);
        System.out.println("DEBUG: Creating notifications for booking: " + saved.getId());

        // 5. Notifications
        // a. To User (confirmation)
        String userMsg = "Your booking request has been submitted successfully.";
        notificationService.createNotification(user, com.smartcampus.model.Notification.Type.BOOKING, saved.getId(), userMsg);
        System.out.println("DEBUG: Notification sent to user: " + user.getEmail());

        // b. To Admins (alert)
        String adminMsg = "A new booking request has been submitted by a " + user.getRole().toString().toLowerCase() + ".";
        java.util.List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        System.out.println("DEBUG: Found " + (admins != null ? admins.size() : 0) + " admins to notify.");
        if (admins != null) {
            for (User admin : admins) {
                if (admin.getStatus() == User.Status.ACTIVE) {
                    notificationService.createNotification(admin, com.smartcampus.model.Notification.Type.BOOKING, saved.getId(), adminMsg);
                    System.out.println("DEBUG: Notification sent to admin: " + admin.getEmail());
                }
            }
        }

        return saved;
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /**
     * Returns all bookings belonging to the authenticated user.
     *
     * @param userEmail email of the requesting user
     * @return list of the user's bookings (may be empty)
     * @throws RuntimeException if the user does not exist
     */
    public List<Booking> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with email: " + userEmail));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    /**
     * Returns all bookings, optionally filtered by status.
     *
     * @param status {@link Booking.Status} filter; pass {@code null} to return all
     * @return matching bookings
     */
    public List<Booking> getAllBookings(Booking.Status status) {
        if (status == null) {
            return bookingRepository.findAllByOrderByCreatedAtDesc();
        }
        return bookingRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Retrieves a single booking by its id.
     *
     * @param bookingId MongoDB document id
     * @return the found {@link Booking}
     * @throws RuntimeException if no booking exists with that id
     */
    public Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException(
                        "Booking not found with id: " + bookingId));
    }

    // -------------------------------------------------------------------------
    // Status transitions
    // -------------------------------------------------------------------------

    /**
     * Approves a pending booking (admin action).
     *
     * @param bookingId id of the booking to approve
     * @return the updated {@link Booking}
     * @throws RuntimeException if no booking exists with that id
     */
    public Booking approveBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(Booking.Status.APPROVED);
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getUser(),
                com.smartcampus.model.Notification.Type.BOOKING,
                booking.getId(),
                "Your booking for " + booking.getResource().getName() + " has been approved."
        );

        return saved;
    }

    /**
     * Rejects a booking and records the admin's reason.
     *
     * @param bookingId id of the booking to reject
     * @param reason    human-readable reason for rejection (stored in
     *                  {@code rejection_reason} field)
     * @return the updated {@link Booking}
     * @throws RuntimeException if no booking exists with that id
     */
    public Booking rejectBooking(String bookingId, String reason) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(Booking.Status.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getUser(),
                com.smartcampus.model.Notification.Type.BOOKING,
                booking.getId(),
                "Your booking for " + booking.getResource().getName() + " has been rejected. Reason: " + reason
        );

        return saved;
    }

    /**
     * Cancels a booking after verifying that the requesting user owns it.
     *
     * @param bookingId id of the booking to cancel
     * @param userEmail email of the user requesting the cancellation
     * @return the updated {@link Booking}
     * @throws RuntimeException if booking not found, user not found, or the user
     *                          does not own the booking
     */
    public Booking cancelBooking(String bookingId, String userEmail) {
        Booking booking = getBookingById(bookingId);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException(
                        "User not found with email: " + userEmail));

        // Ownership check — compare user IDs
        if (booking.getUser() == null ||
                !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "Unauthorised: booking does not belong to user " + userEmail);
        }

        booking.setStatus(Booking.Status.CANCELLED);
        return bookingRepository.save(booking);
    }
}

package com.smartcampus.controller;

import com.smartcampus.dto.RoleRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.smartcampus.service.EmailService emailService;

    @Autowired
    private TicketService ticketService;

    // ================================================================
    // USER MANAGEMENT (unchanged)
    // ================================================================

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/users/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveUser(@PathVariable String id, @RequestBody RoleRequest roleRequest) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) return ResponseEntity.badRequest().body("User not found");

            user.setStatus(User.Status.ACTIVE);
            user.setRole(roleRequest.getRole());
            userRepository.save(user);

            String subject = "Smart Campus - Account Approved";
            String text = "Dear " + (user.getFullName() != null ? user.getFullName() : user.getUsername()) + ",\n\n"
                    + "Your account has been approved by the admin. You can now log in.\n\nBest regards,\nSmart Campus Admin";
            emailService.sendEmail(user.getEmail(), subject, text);

            return ResponseEntity.ok("User approved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to approve user: " + e.getMessage());
        }
    }

    @PutMapping("/users/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectUser(@PathVariable String id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) return ResponseEntity.badRequest().body("User not found");

            user.setStatus(User.Status.REJECTED);
            userRepository.save(user);

            String subject = "Smart Campus - Account Rejected";
            String text = "Dear " + (user.getFullName() != null ? user.getFullName() : user.getUsername()) + ",\n\n"
                    + "Your account registration has been rejected.\n\nBest regards,\nSmart Campus Admin";
            emailService.sendEmail(user.getEmail(), subject, text);

            return ResponseEntity.ok("User rejected successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reject user: " + e.getMessage());
        }
    }

    // ================================================================
    // ADMIN TICKET MANAGEMENT
    // ================================================================

    /** GET /api/admin/tickets — all tickets (newest first) */
    @GetMapping("/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTickets(Authentication authentication) {
        try {
            return ResponseEntity.ok(ticketService.getAllTickets(authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(
                    e.getMessage().contains("Access denied") ? HttpStatus.FORBIDDEN : HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(err(e.getMessage()));
        }
    }

    /** GET /api/admin/tickets/technicians — active technicians list */
    @GetMapping("/tickets/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTechnicians(Authentication authentication) {
        try {
            return ResponseEntity.ok(ticketService.getAllTechnicians(authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(
                    e.getMessage().contains("Access denied") ? HttpStatus.FORBIDDEN : HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(err(e.getMessage()));
        }
    }

    /** GET /api/admin/tickets/{id} — single ticket detail */
    @GetMapping("/tickets/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTicketById(@PathVariable String id, Authentication authentication) {
        try {
            return ResponseEntity.ok(ticketService.getTicketById(id, authentication.getName()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found"))
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err(e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(e.getMessage()));
        }
    }

    /** PATCH /api/admin/tickets/{id}/assign-technician — { "technicianEmail": "..." } */
    @PatchMapping("/tickets/{id}/assign-technician")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignTechnician(@PathVariable String id,
                                               @RequestBody Map<String, String> body,
                                               Authentication authentication) {
        try {
            String techEmail = body.get("technicianEmail");
            if (techEmail == null || techEmail.trim().isEmpty())
                return ResponseEntity.badRequest().body(err("technicianEmail is required."));

            return ResponseEntity.ok(ticketService.assignTechnician(id, techEmail, authentication.getName()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied"))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err(e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(e.getMessage()));
        }
    }

    /** PATCH /api/admin/tickets/{id}/status — { "status": "...", "resolutionNotes": "..." } */
    @PatchMapping("/tickets/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTicketStatus(@PathVariable String id,
                                                 @RequestBody Map<String, String> body,
                                                 Authentication authentication) {
        try {
            String status = body.get("status");
            if (status == null || status.trim().isEmpty())
                return ResponseEntity.badRequest().body(err("status is required."));

            return ResponseEntity.ok(ticketService.updateStatus(
                    id, status, body.get("resolutionNotes"), body.get("rejectionReason"), authentication.getName()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied"))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err(e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(e.getMessage()));
        }
    }

    /** PATCH /api/admin/tickets/{id}/reject — { "reason": "..." }  (mandatory!) */
    @PatchMapping("/tickets/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectTicket(@PathVariable String id,
                                           @RequestBody Map<String, String> body,
                                           Authentication authentication) {
        try {
            String reason = body.get("reason");
            if (reason == null || reason.trim().isEmpty())
                return ResponseEntity.badRequest().body(err("Rejection reason is required."));

            return ResponseEntity.ok(ticketService.rejectTicket(id, reason, authentication.getName()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied"))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err(e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(e.getMessage()));
        }
    }

    // ---- private helper ----
    private Map<String, String> err(String message) {
        Map<String, String> m = new HashMap<>();
        m.put("error", message);
        return m;
    }
}

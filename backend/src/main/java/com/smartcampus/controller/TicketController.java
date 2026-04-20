package com.smartcampus.controller;

import com.smartcampus.dto.TicketRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // ---------------------------------------------------------------
    // POST /api/tickets — Student creates a new ticket
    // ---------------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketRequest request,
                                           Authentication authentication) {
        try {
            String email = authentication.getName();
            Ticket ticket = ticketService.createTicket(request, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse("Failed to create ticket: " + e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // GET /api/tickets/my — Student's own tickets
    // ---------------------------------------------------------------
    @GetMapping("/my")
    public ResponseEntity<?> getMyTickets(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Ticket> tickets = ticketService.getMyTickets(email);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse("Failed to retrieve tickets: " + e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // GET /api/tickets/{id} — Get a single ticket (owner / admin / tech)
    // ---------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable String id,
                                            Authentication authentication) {
        try {
            String email = authentication.getName();
            Ticket ticket = ticketService.getTicketById(id, email);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(errorResponse(e.getMessage()));
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(errorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // GET /api/tickets/{id}/comments — Get comments for a ticket
    // ---------------------------------------------------------------
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable String id,
                                          Authentication authentication) {
        try {
            String email = authentication.getName();
            List<TicketComment> comments = ticketService.getComments(id, email);
            return ResponseEntity.ok(comments);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(errorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse(e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // POST /api/tickets/{id}/comments — Add a comment (student/tech/admin)
    // ---------------------------------------------------------------
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id,
                                         @RequestBody Map<String, String> body,
                                         Authentication authentication) {
        try {
            String email = authentication.getName();
            String content = body.get("content");
            TicketComment comment = ticketService.addComment(id, content, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(errorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse(e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // PUT /api/tickets/{id}/status — Update status (technician/admin)
    // ---------------------------------------------------------------
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                           @RequestBody Map<String, String> body,
                                           Authentication authentication) {
        try {
            String email = authentication.getName();
            String newStatus = body.get("status");
            String resolutionNotes = body.get("resolutionNotes");
            String rejectionReason = body.get("rejectionReason");

            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(errorResponse("Status field is required."));
            }

            Ticket ticket = ticketService.updateStatus(id, newStatus, resolutionNotes, rejectionReason, email);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(errorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse(e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // PUT /api/tickets/{id}/assign — Assign technician (admin only)
    // ---------------------------------------------------------------
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignTechnician(@PathVariable String id,
                                               @RequestBody Map<String, String> body,
                                               Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            String technicianEmail = body.get("technicianEmail");

            if (technicianEmail == null || technicianEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(errorResponse("technicianEmail is required."));
            }

            Ticket ticket = ticketService.assignTechnician(id, technicianEmail, adminEmail);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(errorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse(e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // Helper: consistent error response body
    // ---------------------------------------------------------------
    private Map<String, String> errorResponse(String message) {
        Map<String, String> err = new HashMap<>();
        err.put("error", message);
        return err;
    }
}

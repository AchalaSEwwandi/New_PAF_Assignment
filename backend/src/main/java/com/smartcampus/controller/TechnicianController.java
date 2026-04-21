package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
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

/**
 * REST Controller for Technician-specific ticket operations.
 * All endpoints require TECHNICIAN role.
 * Base path: /api/technician/tickets
 */
@RestController
@RequestMapping("/api/technician/tickets")
public class TechnicianController {

    @Autowired
    private TicketService ticketService;

    // ---------------------------------------------------------------
    // GET /api/technician/tickets/my  — all tickets assigned to me
    // ---------------------------------------------------------------
    @GetMapping("/my")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> getMyTickets(Authentication auth) {
        try {
            List<Ticket> tickets = ticketService.getMyAssignedTickets(auth.getName());
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return error(e);
        }
    }

    // ---------------------------------------------------------------
    // GET /api/technician/tickets/completed — RESOLVED + CLOSED
    // ---------------------------------------------------------------
    @GetMapping("/completed")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> getCompleted(Authentication auth) {
        try {
            List<Ticket> tickets = ticketService.getCompletedTickets(auth.getName());
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return error(e);
        }
    }

    // ---------------------------------------------------------------
    // GET /api/technician/tickets/history — all handled (non-OPEN)
    // ---------------------------------------------------------------
    @GetMapping("/history")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> getHistory(Authentication auth) {
        try {
            List<Ticket> tickets = ticketService.getHistoryTickets(auth.getName());
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return error(e);
        }
    }

    // ---------------------------------------------------------------
    // GET /api/technician/tickets/{id} — single assigned ticket
    // ---------------------------------------------------------------
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> getTicketById(@PathVariable String id, Authentication auth) {
        try {
            Ticket ticket = ticketService.getAssignedTicketById(id, auth.getName());
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found"))
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err(e.getMessage()));
            if (e.getMessage().contains("Access denied"))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err(e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // PATCH /api/technician/tickets/{id}/status
    // Body: { "status": "IN_PROGRESS", "resolutionNotes": "..." }
    // ---------------------------------------------------------------
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                           @RequestBody Map<String, String> body,
                                           Authentication auth) {
        try {
            String status = body.get("status");
            if (status == null || status.trim().isEmpty())
                return ResponseEntity.badRequest().body(err("status is required."));

            Ticket ticket = ticketService.updateStatusAsTechnician(
                    id, status, body.get("resolutionNotes"), auth.getName());
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied"))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err(e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // PATCH /api/technician/tickets/{id}/resolution
    // Body: { "resolutionNotes": "..." }
    // ---------------------------------------------------------------
    @PatchMapping("/{id}/resolution")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> setResolution(@PathVariable String id,
                                            @RequestBody Map<String, String> body,
                                            Authentication auth) {
        try {
            String notes = body.get("resolutionNotes");
            if (notes == null || notes.trim().isEmpty())
                return ResponseEntity.badRequest().body(err("resolutionNotes is required."));

            Ticket ticket = ticketService.setResolutionNotes(id, notes, auth.getName());
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied"))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err(e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(e.getMessage()));
        }
    }

    // ---------------------------------------------------------------
    // GET /api/technician/tickets/{id}/comments
    // (Reuses shared TicketService.getComments which already allows TECHNICIAN access)
    // ---------------------------------------------------------------
    @GetMapping("/{id}/comments")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> getComments(@PathVariable String id, Authentication auth) {
        try {
            List<TicketComment> comments = ticketService.getComments(id, auth.getName());
            return ResponseEntity.ok(comments);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied"))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err(e.getMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(e.getMessage()));
        }
    }

    // NOTE: Comments are posted via the shared /api/tickets/{id}/comments endpoint
    // which already allows TECHNICIAN role. No duplication needed.

    // ---------------------------------------------------------------
    // Private helper
    // ---------------------------------------------------------------
    private ResponseEntity<Map<String, String>> error(RuntimeException e) {
        HttpStatus status = e.getMessage().contains("Access denied") ? HttpStatus.FORBIDDEN
                : e.getMessage().contains("not found") ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(err(e.getMessage()));
    }

    private Map<String, String> err(String message) {
        Map<String, String> m = new HashMap<>();
        m.put("error", message);
        return m;
    }
}

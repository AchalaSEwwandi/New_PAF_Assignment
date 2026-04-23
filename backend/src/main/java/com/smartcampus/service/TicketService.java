package com.smartcampus.service;

import com.smartcampus.dto.TicketRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // ---------------------------------------------------------------
    // CREATE ticket
    // ---------------------------------------------------------------
    public Ticket createTicket(TicketRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        Ticket ticket = new Ticket();
        ticket.setCreatedBy(user);
        ticket.setResourceOrLocation(request.getResourceOrLocation());
        ticket.setDescription(request.getDescription());

        // Category
        try {
            ticket.setCategory(Ticket.Category.valueOf(request.getCategory().toUpperCase()));
        } catch (IllegalArgumentException e) {
            ticket.setCategory(Ticket.Category.OTHER);
        }

        // Priority
        try {
            ticket.setPriority(Ticket.Priority.valueOf(request.getPriority().toUpperCase()));
        } catch (IllegalArgumentException e) {
            ticket.setPriority(Ticket.Priority.MEDIUM);
        }

        // Contact details
        ticket.setPreferredContactName(request.getPreferredContactName());
        ticket.setPreferredContactEmail(request.getPreferredContactEmail());
        ticket.setPreferredContactPhone(request.getPreferredContactPhone());

        // Image attachments (max 3 enforced at DTO level and re-checked here)
        if (request.getImageAttachments() != null) {
            List<String> imgs = request.getImageAttachments();
            if (imgs.size() > 3) {
                imgs = imgs.subList(0, 3);
            }
            ticket.setImageAttachments(imgs);
        }

        // Auto-generate a title from resource + category
        String categoryLabel = ticket.getCategory() != null ? ticket.getCategory().name() : "Issue";
        String location = request.getResourceOrLocation() != null ? request.getResourceOrLocation() : "Campus";
        ticket.setTitle(categoryLabel + " issue at " + location);

        ticket.setStatus(Ticket.Status.OPEN);
        Ticket saved = ticketRepository.save(ticket);

        // 1. Notification to Student (confirmation)
        notificationService.createNotification(
                user,
                com.smartcampus.model.Notification.Type.TICKET,
                saved.getId(),
                "Your ticket has been created successfully."
        );

        // 2. Notification to Admin (new ticket created)
        java.util.List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        for (User admin : admins) {
            if (admin.getStatus() == User.Status.ACTIVE) {
                notificationService.createNotification(
                        admin,
                        com.smartcampus.model.Notification.Type.TICKET,
                        saved.getId(),
                        "A new ticket has been submitted by a student."
                );
            }
        }

        return saved;
    }

    // ---------------------------------------------------------------
    // GET my tickets (student's own)
    // ---------------------------------------------------------------
    public List<Ticket> getMyTickets(String userEmail) {
        User user = getUserByEmail(userEmail);
        return ticketRepository.findByCreatedByOrderByCreatedAtDesc(user);
    }

    // ---------------------------------------------------------------
    // GET ticket by id — validates owner or admin/technician
    // ---------------------------------------------------------------
    public Ticket getTicketById(String ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        User user = getUserByEmail(userEmail);
        // Allow if owner, admin, or technician
        boolean isOwner = ticket.getCreatedBy() != null
                && ticket.getCreatedBy().getEmail().equals(userEmail);
        boolean isAdminOrTech = user.getRole() == User.Role.ADMIN
                || user.getRole() == User.Role.TECHNICIAN;

        if (!isOwner && !isAdminOrTech) {
            throw new RuntimeException("Access denied: You can only view your own tickets.");
        }

        return ticket;
    }

    // ---------------------------------------------------------------
    // GET comments for a ticket
    // ---------------------------------------------------------------
    public List<TicketComment> getComments(String ticketId, String userEmail) {
        // Ensure user has access to the ticket first
        getTicketById(ticketId, userEmail);
        Ticket ticket = new Ticket();
        ticket.setId(ticketId);
        // Use the actual ticket reference
        Ticket realTicket = ticketRepository.findById(ticketId).get();
        return commentRepository.findByTicketOrderByCreatedAtAsc(realTicket);
    }

    // ---------------------------------------------------------------
    // ADD comment to a ticket
    // ---------------------------------------------------------------
    public TicketComment addComment(String ticketId, String content, String userEmail) {
        Ticket ticket = getTicketById(ticketId, userEmail); // also validates access
        User user = getUserByEmail(userEmail);

        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Comment content cannot be empty.");
        }
        if (content.length() > 1000) {
            throw new RuntimeException("Comment cannot exceed 1000 characters.");
        }

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(user);
        comment.setContent(content.trim());

        TicketComment savedComment = commentRepository.save(comment);

        // 1. Notify ticket owner if comment is from someone else (tech/admin)
        if (ticket.getCreatedBy() != null && !ticket.getCreatedBy().getEmail().equals(userEmail)) {
            notificationService.createNotification(
                    ticket.getCreatedBy(),
                    com.smartcampus.model.Notification.Type.NEW_COMMENT,
                    ticket.getId(),
                    "New comment on your ticket: " + ticket.getTitle()
            );
        }

        // 2. Notify assigned technician if student comments
        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getEmail().equals(userEmail)
            && ticket.getCreatedBy() != null && ticket.getCreatedBy().getEmail().equals(userEmail)) {
            notificationService.createNotification(
                    ticket.getAssignedTo(),
                    com.smartcampus.model.Notification.Type.NEW_COMMENT,
                    ticket.getId(),
                    "The student has added a comment to your assigned ticket: " + ticket.getTitle()
            );
        }

        return savedComment;
    }

    // ---------------------------------------------------------------
    // UPDATE ticket status (technician/admin)
    // ---------------------------------------------------------------
    public Ticket updateStatus(String ticketId, String newStatus, String resolutionNotes,
                               String rejectionReason, String userEmail) {
        User user = getUserByEmail(userEmail);
        if (user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.TECHNICIAN) {
            throw new RuntimeException("Access denied: Only admin or technician can update ticket status.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        try {
            Ticket.Status status = Ticket.Status.valueOf(newStatus.toUpperCase());
            ticket.setStatus(status);

            if (status == Ticket.Status.REJECTED && rejectionReason != null) {
                ticket.setRejectionReason(rejectionReason);
            }
            if ((status == Ticket.Status.RESOLVED || status == Ticket.Status.CLOSED)
                    && resolutionNotes != null) {
                ticket.setResolutionNotes(resolutionNotes);
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + newStatus);
        }

        ticket.updateTimestamp();
        Ticket saved = ticketRepository.save(ticket);

        // Notify owner
        if (ticket.getCreatedBy() != null) {
            String message;
            if (ticket.getStatus() == Ticket.Status.REJECTED) {
                message = "Your ticket for " + ticket.getResourceOrLocation() + " has been rejected. Reason: " + ticket.getRejectionReason();
            } else {
                message = "Your ticket status has been updated to: " + ticket.getStatus().toString().toLowerCase().replace("_", " ") + ".";
            }

            notificationService.createNotification(
                    ticket.getCreatedBy(),
                    com.smartcampus.model.Notification.Type.TICKET,
                    ticket.getId(),
                    message
            );
        }

        // Notify Admin/Tech (confirmation of their own action)
        notificationService.createNotification(
                user,
                com.smartcampus.model.Notification.Type.TICKET,
                ticket.getId(),
                "You have updated the ticket status to: " + ticket.getStatus().toString().toLowerCase().replace("_", " ") + "."
        );

        return saved;
    }

    // ---------------------------------------------------------------
    // ASSIGN technician (admin only)
    // ---------------------------------------------------------------
    public Ticket assignTechnician(String ticketId, String technicianEmail, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied: Only admin can assign technicians.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        User technician = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + technicianEmail));

        if (technician.getRole() != User.Role.TECHNICIAN) {
            throw new RuntimeException("User is not a technician.");
        }

        ticket.setAssignedTo(technician);
        if (ticket.getStatus() == Ticket.Status.OPEN) {
            ticket.setStatus(Ticket.Status.IN_PROGRESS);
        }
        ticket.updateTimestamp();
        Ticket saved = ticketRepository.save(ticket);

        // 1. Notify Technician
        notificationService.createNotification(
                technician,
                com.smartcampus.model.Notification.Type.TICKET,
                saved.getId(),
                "A new ticket has been assigned to you: " + saved.getTitle()
        );

        // 2. Notify Student (Owner)
        if (saved.getCreatedBy() != null) {
            notificationService.createNotification(
                    saved.getCreatedBy(),
                    com.smartcampus.model.Notification.Type.TICKET,
                    saved.getId(),
                    "A technician (" + technician.getFullName() + ") has been assigned to your ticket: " + saved.getTitle()
            );
        }

        // 3. Notify Admin (Confirmation)
        notificationService.createNotification(
                admin,
                com.smartcampus.model.Notification.Type.TICKET,
                saved.getId(),
                "Technician " + technician.getFullName() + " has been assigned to the ticket."
        );

        return saved;
    }

    // ---------------------------------------------------------------
    // ADMIN: GET all tickets
    // ---------------------------------------------------------------
    public List<Ticket> getAllTickets(String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied: Only admin can view all tickets.");
        }
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    // ---------------------------------------------------------------
    // ADMIN: GET all technicians (for assign dropdown)
    // ---------------------------------------------------------------
    public List<User> getAllTechnicians(String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied: Only admin can list technicians.");
        }
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TECHNICIAN
                        && u.getStatus() == User.Status.ACTIVE)
                .collect(java.util.stream.Collectors.toList());
    }

    // ---------------------------------------------------------------
    // ADMIN: REJECT ticket with mandatory reason
    // ---------------------------------------------------------------
    public Ticket rejectTicket(String ticketId, String reason, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied: Only admin can reject tickets.");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            throw new RuntimeException("Cannot reject a ticket that is already CLOSED.");
        }
        if (ticket.getStatus() == Ticket.Status.REJECTED) {
            throw new RuntimeException("Ticket is already REJECTED.");
        }

        ticket.setStatus(Ticket.Status.REJECTED);
        ticket.setRejectionReason(reason.trim());
        ticket.updateTimestamp();
        Ticket saved = ticketRepository.save(ticket);

        // Notify owner
        if (saved.getCreatedBy() != null) {
            notificationService.createNotification(
                    saved.getCreatedBy(),
                    com.smartcampus.model.Notification.Type.TICKET,
                    saved.getId(),
                    "Your ticket for " + saved.getResourceOrLocation() + " has been rejected. Reason: " + saved.getRejectionReason()
            );
        }

        // Notify Admin (confirmation)
        notificationService.createNotification(
                admin,
                com.smartcampus.model.Notification.Type.TICKET,
                saved.getId(),
                "You have rejected the ticket. Reason: " + saved.getRejectionReason()
        );

        return saved;
    }

    // ---------------------------------------------------------------
    // TECHNICIAN: GET tickets assigned to me
    // ---------------------------------------------------------------
    public List<Ticket> getMyAssignedTickets(String techEmail) {
        User tech = getTechnicianByEmail(techEmail);
        return ticketRepository.findByAssignedToOrderByCreatedAtDesc(tech);
    }

    // ---------------------------------------------------------------
    // TECHNICIAN: GET a single assigned ticket (must be assigned to me)
    // ---------------------------------------------------------------
    public Ticket getAssignedTicketById(String ticketId, String techEmail) {
        User tech = getTechnicianByEmail(techEmail);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        if (ticket.getAssignedTo() == null
                || !ticket.getAssignedTo().getEmail().equals(techEmail)) {
            throw new RuntimeException("Access denied: This ticket is not assigned to you.");
        }
        return ticket;
    }

    // ---------------------------------------------------------------
    // TECHNICIAN: UPDATE status (restricted transitions only)
    // ---------------------------------------------------------------
    public Ticket updateStatusAsTechnician(String ticketId, String newStatus,
                                           String resolutionNotes, String techEmail) {
        User tech = getTechnicianByEmail(techEmail);
        Ticket ticket = getAssignedTicketById(ticketId, techEmail);

        Ticket.Status status;
        try {
            status = Ticket.Status.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + newStatus);
        }

        // Technicians cannot REJECT or set OPEN — those are admin privileges
        if (status == Ticket.Status.REJECTED || status == Ticket.Status.OPEN) {
            throw new RuntimeException("Technicians cannot set status to " + status + ".");
        }

        // Resolution notes required when marking RESOLVED
        if (status == Ticket.Status.RESOLVED
                && (resolutionNotes == null || resolutionNotes.trim().isEmpty())) {
            throw new RuntimeException("Resolution notes are required before marking a ticket as RESOLVED.");
        }

        ticket.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.trim().isEmpty()) {
            ticket.setResolutionNotes(resolutionNotes.trim());
        }
        ticket.updateTimestamp();
        Ticket saved = ticketRepository.save(ticket);

        // Notify owner
        if (ticket.getCreatedBy() != null) {
            notificationService.createNotification(
                    ticket.getCreatedBy(),
                    com.smartcampus.model.Notification.Type.TICKET,
                    ticket.getId(),
                    "Your ticket status has been updated to: " + ticket.getStatus().toString().toLowerCase().replace("_", " ") + " by a technician."
            );
        }

        // Notify Technician (confirmation)
        notificationService.createNotification(
                tech,
                com.smartcampus.model.Notification.Type.TICKET,
                ticket.getId(),
                "You have updated the ticket status to: " + ticket.getStatus().toString().toLowerCase().replace("_", " ") + "."
        );

        return saved;
    }

    // ---------------------------------------------------------------
    // TECHNICIAN: SET/UPDATE resolution notes only
    // ---------------------------------------------------------------
    public Ticket setResolutionNotes(String ticketId, String notes, String techEmail) {
        if (notes == null || notes.trim().isEmpty()) {
            throw new RuntimeException("Resolution notes cannot be empty.");
        }
        Ticket ticket = getAssignedTicketById(ticketId, techEmail);
        ticket.setResolutionNotes(notes.trim());
        ticket.updateTimestamp();
        Ticket saved = ticketRepository.save(ticket);

        // Notify Student
        if (saved.getCreatedBy() != null) {
            notificationService.createNotification(
                    saved.getCreatedBy(),
                    com.smartcampus.model.Notification.Type.TICKET,
                    saved.getId(),
                    "Resolution notes have been added to your ticket: " + saved.getTitle()
            );
        }

        return saved;
    }

    // ---------------------------------------------------------------
    // TECHNICIAN: GET completed tickets (RESOLVED or CLOSED)
    // ---------------------------------------------------------------
    public List<Ticket> getCompletedTickets(String techEmail) {
        User tech = getTechnicianByEmail(techEmail);
        return ticketRepository.findByAssignedToAndStatusInOrderByCreatedAtDesc(
                tech,
                java.util.Arrays.asList(Ticket.Status.RESOLVED, Ticket.Status.CLOSED));
    }

    // ---------------------------------------------------------------
    // TECHNICIAN: GET history — all handled tickets (not OPEN)
    // ---------------------------------------------------------------
    public List<Ticket> getHistoryTickets(String techEmail) {
        User tech = getTechnicianByEmail(techEmail);
        return ticketRepository.findByAssignedToAndStatusInOrderByCreatedAtDesc(
                tech,
                java.util.Arrays.asList(
                        Ticket.Status.IN_PROGRESS,
                        Ticket.Status.ON_HOLD,
                        Ticket.Status.RESOLVED,
                        Ticket.Status.CLOSED,
                        Ticket.Status.REJECTED));
    }

    // ---------------------------------------------------------------
    // HELPER: validate + get technician
    // ---------------------------------------------------------------
    private User getTechnicianByEmail(String email) {
        User user = getUserByEmail(email);
        if (user.getRole() != User.Role.TECHNICIAN) {
            throw new RuntimeException("Access denied: Only a technician can perform this action.");
        }
        return user;
    }

    // ---------------------------------------------------------------
    // HELPER
    // ---------------------------------------------------------------
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}

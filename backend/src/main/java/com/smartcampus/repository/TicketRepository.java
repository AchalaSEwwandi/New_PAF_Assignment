package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    // Student: find all tickets created by a specific user, sorted newest first
    List<Ticket> findByCreatedByOrderByCreatedAtDesc(User createdBy);

    // Student: find tickets by status (for a specific student)
    List<Ticket> findByCreatedByAndStatusOrderByCreatedAtDesc(User createdBy, Ticket.Status status);

    // Student: find tickets by category (for a specific student)
    List<Ticket> findByCreatedByAndCategoryOrderByCreatedAtDesc(User createdBy, Ticket.Category category);

    // Count by status for admin stats
    long countByStatus(Ticket.Status status);

    // Admin: all tickets newest first
    List<Ticket> findAllByOrderByCreatedAtDesc();

    // Admin: all tickets by status
    List<Ticket> findByStatusOrderByCreatedAtDesc(Ticket.Status status);

    // Admin/Technician: tickets assigned to a specific technician
    List<Ticket> findByAssignedToOrderByCreatedAtDesc(User assignedTo);

    // Technician: tickets assigned with a specific status
    List<Ticket> findByAssignedToAndStatusOrderByCreatedAtDesc(User assignedTo, Ticket.Status status);

    // Technician: tickets assigned with any of the given statuses
    List<Ticket> findByAssignedToAndStatusInOrderByCreatedAtDesc(User assignedTo, List<Ticket.Status> statuses);
}


package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {

    // Find all comments for a ticket, sorted oldest first (chronological thread)
    List<TicketComment> findByTicketOrderByCreatedAtAsc(Ticket ticket);

    // Count comments for a ticket
    long countByTicket(Ticket ticket);
}

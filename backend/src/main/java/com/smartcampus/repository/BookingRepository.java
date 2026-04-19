package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data MongoDB repository for {@link Booking} documents.
 *
 * <p>Provides CRUD operations inherited from {@link MongoRepository} plus
 * custom query methods used by the booking service for filtering and
 * conflict detection.</p>
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // -------------------------------------------------------------------------
    // Derived query methods
    // -------------------------------------------------------------------------

    /**
     * Find all bookings created by a specific user.
     *
     * @param userId the {@link com.smartcampus.model.User} document id
     * @return list of the user's bookings (may be empty)
     */
    List<Booking> findByUserId(String userId);

    /**
     * Find all bookings for a specific resource.
     *
     * @param resourceId the {@link com.smartcampus.model.Resource} document id
     * @return list of bookings for that resource (may be empty)
     */
    List<Booking> findByResourceId(String resourceId);

    /**
     * Conflict-detection query.
     *
     * <p>Returns existing bookings for the given resource that:
     * <ul>
     *   <li>have an <em>active</em> status (PENDING or APPROVED), and</li>
     *   <li>overlap with the requested time window, i.e.
     *       {@code existingStart < newEnd AND existingEnd > newStart}.</li>
     * </ul>
     *
     * <p>The overlap condition follows Allen's interval algebra:
     * two intervals [A,B) and [C,D) overlap when A&lt;D and B&gt;C.</p>
     *
     * @param resourceId   the resource being requested
     * @param statuses     the active booking statuses to check against
     * @param newEndTime   end of the requested slot
     * @param newStartTime start of the requested slot
     * @return list of conflicting bookings (empty means no conflict)
     */
    @Query("{ 'resource.$id': { $oid: ?0 }, " +
           "  'status': { $in: ?1 }, " +
           "  'start_time': { $lt: ?2 }, " +
           "  'end_time':   { $gt: ?3 } }")
    List<Booking> findConflictingBookings(
            String resourceId,
            List<Booking.Status> statuses,
            LocalDateTime newEndTime,
            LocalDateTime newStartTime
    );

    /**
     * Find all bookings that have the given status.
     *
     * @param status the {@link Booking.Status} to filter by
     * @return list of matching bookings (may be empty)
     */
    List<Booking> findByStatus(Booking.Status status);
}

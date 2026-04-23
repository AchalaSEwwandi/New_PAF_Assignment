package com.smartcampus.exception;

/**
 * Thrown when a booking request violates a business rule, such as
 * attempting to book a past time slot or an invalid time range.
 *
 * <p>Maps to HTTP 422 Unprocessable Entity via {@link GlobalExceptionHandler}.</p>
 */
public class InvalidBookingException extends RuntimeException {

    public InvalidBookingException(String message) {
        super(message);
    }
}

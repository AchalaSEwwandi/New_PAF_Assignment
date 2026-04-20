package com.smartcampus.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.smartcampus.model.Booking;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

/**
 * Generates QR codes (as Base64-encoded PNG) for approved bookings.
 * Uses Google ZXing under the hood.
 */
@Service
public class QRCodeService {

    private static final int QR_WIDTH  = 300;
    private static final int QR_HEIGHT = 300;

    /**
     * Builds a JSON-like payload from the booking and encodes it as a
     * Base64 PNG QR code image.
     *
     * @param booking the APPROVED booking to encode
     * @return "data:image/png;base64,..." string ready for use in an <img> src
     * @throws IllegalStateException if the booking is not APPROVED
     */
    public String generateQRCodeBase64(Booking booking) {
        if (booking.getStatus() != Booking.Status.APPROVED) {
            throw new IllegalStateException(
                    "QR codes can only be generated for APPROVED bookings.");
        }

        String payload = buildPayload(booking);

        try {
            byte[] pngBytes = encode(payload);
            String base64   = Base64.getEncoder().encodeToString(pngBytes);
            return "data:image/png;base64," + base64;
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies that a raw QR payload string matches an existing approved booking.
     *
     * @param payload  raw text decoded from a QR code
     * @param booking  the booking to validate against
     * @return true if the payload belongs to this booking and it is APPROVED
     */
    public boolean verifyPayload(String payload, Booking booking) {
        if (booking.getStatus() != Booking.Status.APPROVED) return false;
        String expected = buildPayload(booking);
        return expected.equals(payload);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private String buildPayload(Booking booking) {
        return "{"
                + "\"bookingId\":\"" + booking.getId() + "\","
                + "\"userId\":\""    + safeId(booking.getUser())     + "\","
                + "\"resourceId\":\"" + safeId(booking.getResource()) + "\","
                + "\"startTime\":\"" + booking.getStartTime()        + "\","
                + "\"endTime\":\""   + booking.getEndTime()          + "\","
                + "\"status\":\""    + booking.getStatus()           + "\""
                + "}";
    }

    private String safeId(Object entity) {
        if (entity == null) return "unknown";
        if (entity instanceof com.smartcampus.model.User u)     return u.getId();
        if (entity instanceof com.smartcampus.model.Resource r) return r.getId();
        return "unknown";
    }

    private byte[] encode(String content) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT, hints);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }
}

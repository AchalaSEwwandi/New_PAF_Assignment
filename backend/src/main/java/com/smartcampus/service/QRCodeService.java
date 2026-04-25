package com.smartcampus.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.smartcampus.model.Booking;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

/**
 * Generates QR codes (as Base64-encoded PNG) for approved bookings.
 * Uses Google ZXing under the hood.
 */
@Service
public class QRCodeService {

    /**
     * Optional override. If set explicitly in application.properties, that value is used.
     * If left as the default "auto", the local network IP is auto-detected at runtime.
     */
    @Value("${frontend.base-url:auto}")
    private String frontendBaseUrl;

    private static final int QR_WIDTH  = 300;
    private static final int QR_HEIGHT = 300;

    /**
     * Generates a QR code for an approved booking.
     * @return "data:image/png;base64,..." string ready for use in an <img> src
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
     */
    public boolean verifyPayload(String payload, Booking booking) {
        if (booking.getStatus() != Booking.Status.APPROVED) return false;
        return buildPayload(booking).equals(payload);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private String buildPayload(Booking booking) {
        return resolveBaseUrl() + "/verify?id=" + booking.getId();
    }

    /**
     * Returns the frontend base URL.
     * Uses the configured value if explicitly set in application.properties,
     * otherwise auto-detects the machine's current local network IP.
     */
    private String resolveBaseUrl() {
        if (!"auto".equals(frontendBaseUrl)) {
            return frontendBaseUrl;
        }
        // Auto-detect: opening a UDP socket to an external address (no packets sent)
        // forces Java to resolve the correct outbound network interface IP.
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.connect(InetAddress.getByName("8.8.8.8"), 80);
            String localIp = socket.getLocalAddress().getHostAddress();
            return "http://" + localIp + ":5173";
        } catch (Exception e) {
            return "http://localhost:5173";
        }
    }


    private byte[] encode(String content) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 4);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT, hints);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }
}

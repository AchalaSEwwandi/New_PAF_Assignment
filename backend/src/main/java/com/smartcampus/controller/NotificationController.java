package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    // GET all notifications for current user
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    // GET unread count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user)));
    }

    // PUT mark single notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id, Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(notificationService.markAsRead(id, user));
    }

    // PUT mark all notifications as read
    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        User user = getUser(authentication);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // DELETE single notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String id, Authentication authentication) {
        User user = getUser(authentication);
        notificationService.deleteNotification(id, user);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    // DELETE all notifications
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAll(Authentication authentication) {
        User user = getUser(authentication);
        notificationService.clearAllNotifications(user);
        return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

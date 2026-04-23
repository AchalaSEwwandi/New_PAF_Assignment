package com.smartcampus.service;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void createNotification(User user, Notification.Type type, String relatedId, String message) {
        if (user == null) {
            System.out.println("DEBUG: Skipping notification - user is null");
            return;
        }

        // Check user preferences before saving
        User.NotificationPreferences prefs = user.getNotificationPreferences();
        if (prefs == null) {
            System.out.println("DEBUG: User prefs were null for " + user.getEmail() + ", using defaults");
            prefs = new User.NotificationPreferences();
        }

        boolean shouldSend = false;

        if (type == Notification.Type.BOOKING && prefs.isBookingUpdates()) {
            shouldSend = true;
        } else if (type == Notification.Type.TICKET && prefs.isTicketUpdates()) {
            shouldSend = true;
        } else if (type == Notification.Type.NEW_COMMENT && prefs.isNewComments()) {
            shouldSend = true;
        } else if (type == Notification.Type.SYSTEM) {
            shouldSend = true;
        }

        System.out.println("DEBUG: Notification for " + user.getEmail() + " (Type: " + type + ") - shouldSend: " + shouldSend);

        if (shouldSend) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setRelatedId(relatedId);
            notification.setMessage(message);
            notificationRepository.save(notification);
            System.out.println("DEBUG: Notification SAVED to database.");
        }
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    public Notification markAsRead(String notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndReadFalse(user);
        for (Notification n : unread) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    public void deleteNotification(String notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        notificationRepository.deleteById(notificationId);
    }

    public void clearAllNotifications(User user) {
        notificationRepository.deleteByUser(user);
    }
}

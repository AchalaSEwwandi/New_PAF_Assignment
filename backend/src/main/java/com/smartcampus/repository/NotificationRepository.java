package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndReadFalse(User user);

    long countByUserAndReadFalse(User user);

    void deleteByUser(User user);
}

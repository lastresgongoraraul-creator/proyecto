package com.app.repository;

import com.app.model.Review;
import com.app.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByGameId(Long gameId);
    List<Review> findByUserId(Long userId);
    boolean existsByGameIdAndUserId(Long gameId, Long userId);
    List<Review> findByUserInOrderByCreatedAtDesc(List<User> users);
}

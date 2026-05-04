package com.app.repository;

import com.app.model.Review;
import com.app.model.ReviewLike;
import com.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    Optional<ReviewLike> findByReviewAndUser(Review review, User user);
    boolean existsByReviewAndUser(Review review, User user);
    long countByReview(Review review);
}

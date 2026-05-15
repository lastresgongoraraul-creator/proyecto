package com.app.controller;

import com.app.model.NotificationType;
import com.app.model.Review;
import com.app.model.ReviewLike;
import com.app.model.User;
import com.app.repository.ReviewLikeRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;
import com.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewLikeController {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @PostMapping("/{reviewId}/like")
    public ResponseEntity<?> likeReview(@PathVariable Long reviewId, @AuthenticationPrincipal UserDetails userDetails) {
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();

        if (reviewLikeRepository.existsByReviewAndUser(review, user)) {
            return ResponseEntity.badRequest().body("Already liked");
        }

        ReviewLike like = ReviewLike.builder()
                .review(review)
                .user(user)
                .build();
        reviewLikeRepository.save(like);

        // Notify the author of the review
        if (!review.getUser().getId().equals(user.getId())) {
            notificationService.sendNotification(review.getUser(), user, NotificationType.LIKE, review.getId(),
                    user.getUsername() + " liked your review!");
        }

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{reviewId}/like")
    public ResponseEntity<?> unlikeReview(@PathVariable Long reviewId, @AuthenticationPrincipal UserDetails userDetails) {
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();

        reviewLikeRepository.findByReviewAndUser(review, user)
                .ifPresent(reviewLikeRepository::delete);

        return ResponseEntity.ok().build();
    }
}

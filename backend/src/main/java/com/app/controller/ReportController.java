package com.app.controller;

import com.app.model.ModerationStatus;
import com.app.model.ModerationTicket;
import com.app.model.NotificationType;
import com.app.model.Review;
import com.app.model.User;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;
import com.app.repository.ModerationRepository;
import com.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReportController {

    private final ModerationRepository moderationRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;

    @PostMapping("/api/v1/reports")
    public ResponseEntity<?> createReport(@RequestBody ReportRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User reporter = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new RuntimeException("Review not found"));

        ModerationTicket ticket = ModerationTicket.builder()
                .review(review)
                .reporter(reporter)
                .reason(request.getReason())
                .status(ModerationStatus.PENDING)
                .build();

        moderationRepository.save(ticket);

        long reportCount = moderationRepository.countByReviewId(review.getId());
        if (reportCount >= 10) {
            java.util.List<User> admins = userRepository.findByRoles_Name("ADMIN");
            for (User admin : admins) {
                notificationService.sendNotification(
                        admin,
                        null,
                        NotificationType.REPORT,
                        review.getId(),
                        "La reseña de " + review.getUser().getUsername() + " ha sido reportada " + reportCount + " veces."
                );
            }
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/v1/admin/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<List<ModerationTicket>> getReports() {
        return ResponseEntity.ok(moderationRepository.findByStatus(ModerationStatus.PENDING));
    }

    @lombok.Data
    public static class ReportRequest {
        private Long reviewId;
        private String reason;
    }
}

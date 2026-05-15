package com.app.controller;

import com.app.dto.ReportRequest;
import com.app.dto.ReviewRequest;
import com.app.model.Review;
import com.app.service.ModerationService;
import com.app.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ModerationService moderationService;

    @PostMapping
    public ResponseEntity<com.app.dto.ReviewDto> postReview(@Valid @RequestBody ReviewRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        Review review = reviewService.createReview(request, userEmail);
        
        com.app.dto.ReviewDto dto = com.app.dto.ReviewDto.builder()
                .id(review.getId())
                .username(review.getUser().getUsername())
                .score(review.getScore())
                .comment(review.getComment())
                .gameId(review.getGame().getId())
                .gameTitle(review.getGame().getName())
                .createdAt(review.getCreatedAt())
                .userId(review.getUser().getId())
                .likesCount(0L)
                .liked(false)
                .followingAuthor(false)
                .build();
                
        return ResponseEntity.ok(dto);
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<com.app.dto.ReviewDto> updateReview(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        Review review = reviewService.updateReview(id, request, userEmail);
        
        com.app.dto.ReviewDto dto = com.app.dto.ReviewDto.builder()
                .id(review.getId())
                .username(review.getUser().getUsername())
                .score(review.getScore())
                .comment(review.getComment())
                .gameId(review.getGame().getId())
                .gameTitle(review.getGame().getName())
                .createdAt(review.getCreatedAt())
                .userId(review.getUser().getId())
                .likesCount(0L)
                .liked(false)
                .followingAuthor(false)
                .build();
                
        return ResponseEntity.ok(dto);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        reviewService.deleteReview(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Void> reportReview(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @Valid @RequestBody ReportRequest request,
            Authentication authentication) {
        moderationService.reportReview(id, authentication.getName(), request.getReason());
        return ResponseEntity.ok().build();
    }
}

package com.app.controller;

import com.app.dto.ReviewRequest;
import com.app.model.Review;
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

    @PostMapping
    public ResponseEntity<Review> postReview(@Valid @RequestBody ReviewRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        Review review = reviewService.createReview(request, userEmail);
        return ResponseEntity.ok(review);
    }
}

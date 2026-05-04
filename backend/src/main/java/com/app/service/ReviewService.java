package com.app.service;

import com.app.dto.ReviewRequest;
import com.app.model.Game;
import com.app.model.Review;
import com.app.model.User;
import com.app.repository.GameRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final GameService gameService;
    private final AIService aiService;
    private final ModerationService moderationService;

    @Transactional
    public Review createReview(ReviewRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (reviewRepository.existsByGameIdAndUserId(request.getGameId(), user.getId())) {
            throw new RuntimeException("User has already reviewed this game");
        }

        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new RuntimeException("Game not found"));

        // AI Moderation check
        boolean isOffensive = aiService.checkModeration(request.getComment());

        // Atomic update of game score
        gameService.updateGameScore(game.getId(), request.getScore());

        Review review = Review.builder()
                .user(user)
                .game(game)
                .score(request.getScore())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // If offensive, auto-report and flag
        if (isOffensive) {
            moderationService.reportReview(savedReview.getId(), "SYSTEM", "Automatic AI detection: Offensive language");
        }

        // Generate embedding and update user profile (Asynchronously would be better, but we'll call them here for simplicity)
        aiService.generateReviewEmbedding(savedReview.getId());
        aiService.updateUserEmbedding(user.getId());

        return savedReview;
    }

    @Transactional
    public Review updateReview(Long id, ReviewRequest request, String userEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to edit this review");
        }

        Integer oldScore = review.getScore();
        review.setScore(request.getScore());
        review.setComment(request.getComment());

        // Update game score
        gameService.updateGameScoreOnEdit(review.getGame().getId(), oldScore, request.getScore());

        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long id, String userEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to delete this review");
        }

        // Update game score before deleting
        gameService.updateGameScoreOnDelete(review.getGame().getId(), review.getScore());

        reviewRepository.delete(review);
    }
}

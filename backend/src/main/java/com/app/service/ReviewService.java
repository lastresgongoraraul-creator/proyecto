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

    @Transactional
    public Review createReview(ReviewRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (reviewRepository.existsByGameIdAndUserId(request.getGameId(), user.getId())) {
            throw new RuntimeException("User has already reviewed this game");
        }

        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new RuntimeException("Game not found"));

        // Atomic update of game score (do this BEFORE saving review to acquire FOR UPDATE lock before FOR KEY SHARE lock)
        gameService.updateGameScore(game.getId(), request.getScore());

        Review review = Review.builder()
                .user(user)
                .game(game)
                .score(request.getScore())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

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

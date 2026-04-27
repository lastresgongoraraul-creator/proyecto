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

        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new RuntimeException("Game not found"));

        Review review = Review.builder()
                .user(user)
                .game(game)
                .score(request.getScore())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Atomic update of game score
        gameService.updateGameScore(game.getId(), request.getScore());

        return savedReview;
    }
}

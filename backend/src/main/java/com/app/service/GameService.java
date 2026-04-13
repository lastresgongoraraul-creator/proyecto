package com.app.service;

import com.app.model.Game;
import com.app.model.Review;
import com.app.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;

    @Transactional
    public void updateGameScore(Long gameId, Integer newReviewScore) {
        // SELECT FOR UPDATE
        Game game = gameRepository.findByIdForUpdate(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        int totalReviews = game.getTotalReviews() == null ? 0 : game.getTotalReviews();
        BigDecimal currentAvg = game.getAvgScore() == null ? BigDecimal.ZERO : game.getAvgScore();

        // Atomic calculation
        // New Avg = ((Avg * Count) + NewScore) / (Count + 1)
        BigDecimal totalScoreSum = currentAvg.multiply(BigDecimal.valueOf(totalReviews))
                .add(BigDecimal.valueOf(newReviewScore));
        
        int newTotalCount = totalReviews + 1;
        BigDecimal newAvg = totalScoreSum.divide(BigDecimal.valueOf(newTotalCount), 2, RoundingMode.HALF_UP);

        game.setAvgScore(newAvg);
        game.setTotalReviews(newTotalCount);

        gameRepository.save(game);
    }
}

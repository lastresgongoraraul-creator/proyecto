package com.app.service;

import com.app.model.Game;
import com.app.model.Review;
import com.app.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository gameRepository;

    @Transactional
    public void updateGameScore(Long gameId, Integer newReviewScore) {
        log.info("Updating score for game ID: {} with new score: {}", gameId, newReviewScore);
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

        log.debug("New average score for game {}: {}", gameId, newAvg);
        gameRepository.save(game);
    }

    @Transactional
    public void updateGameScoreOnEdit(Long gameId, Integer oldScore, Integer newScore) {
        log.info("Updating score for game ID: {} (Edit: {} -> {})", gameId, oldScore, newScore);
        Game game = gameRepository.findByIdForUpdate(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        int totalReviews = game.getTotalReviews() == null ? 0 : game.getTotalReviews();
        BigDecimal currentAvg = game.getAvgScore() == null ? BigDecimal.ZERO : game.getAvgScore();

        // Calculate total sum: (Avg * Count) - OldScore + NewScore
        BigDecimal totalScoreSum = currentAvg.multiply(BigDecimal.valueOf(totalReviews))
                .subtract(BigDecimal.valueOf(oldScore))
                .add(BigDecimal.valueOf(newScore));

        BigDecimal newAvg = totalScoreSum.divide(BigDecimal.valueOf(totalReviews), 2, RoundingMode.HALF_UP);

        game.setAvgScore(newAvg);
        gameRepository.save(game);
    }

    @Transactional
    public void updateGameScoreOnDelete(Long gameId, Integer oldScore) {
        log.info("Updating score for game ID: {} (Delete score: {})", gameId, oldScore);
        Game game = gameRepository.findByIdForUpdate(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        int totalReviews = game.getTotalReviews() == null ? 0 : game.getTotalReviews();
        BigDecimal currentAvg = game.getAvgScore() == null ? BigDecimal.ZERO : game.getAvgScore();

        int newTotalCount = totalReviews - 1;
        if (newTotalCount <= 0) {
            game.setAvgScore(BigDecimal.ZERO);
            game.setTotalReviews(0);
        } else {
            // Calculate total sum: (Avg * Count) - OldScore
            BigDecimal totalScoreSum = currentAvg.multiply(BigDecimal.valueOf(totalReviews))
                    .subtract(BigDecimal.valueOf(oldScore));

            BigDecimal newAvg = totalScoreSum.divide(BigDecimal.valueOf(newTotalCount), 2, RoundingMode.HALF_UP);
            game.setAvgScore(newAvg);
            game.setTotalReviews(newTotalCount);
        }

        gameRepository.save(game);
    }
}

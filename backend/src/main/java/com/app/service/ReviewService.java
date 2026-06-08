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

        if ("MUTED".equals(user.getStatus()) && user.getMutedUntil() != null && user.getMutedUntil().isAfter(java.time.ZonedDateTime.now())) {
            throw new RuntimeException("You are muted and cannot post reviews until " + user.getMutedUntil());
        }

        if (reviewRepository.existsByGameIdAndUserId(request.getGameId(), user.getId())) {
            throw new RuntimeException("User has already reviewed this game");
        }

        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new RuntimeException("Game not found"));

        // Aquí se llama al servicio de IA en Python para comprobar si el comentario es ofensivo
        boolean isOffensive = aiService.checkModeration(request.getComment());

        // Aquí está la función que actualiza la puntuación del juego de forma atómica y concurrente
        gameService.updateGameScore(game.getId(), request.getScore());

        Review review = Review.builder()
                .user(user)
                .game(game)
                .score(request.getScore())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Aquí se reporta y censura automáticamente el mensaje si la IA detecta que es ofensivo
        if (isOffensive) {
            moderationService.reportReview(savedReview.getId(), "SYSTEM", "Automatic AI detection: Offensive language");
        }

        // Aquí se mandan a generar los vectores (embeddings) del usuario y la reseña para el motor de recomendaciones
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

        // Aquí actualizamos la nota media del juego de forma segura tras editar una reseña
        gameService.updateGameScoreOnEdit(review.getGame().getId(), oldScore, request.getScore());

        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long id, String userEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));

        if (!review.getUser().getEmail().equals(userEmail) && !isAdmin) {
            throw new RuntimeException("You are not authorized to delete this review");
        }

        // Aquí recalculamos la nota media del juego justo antes de borrar la reseña de la base de datos
        gameService.updateGameScoreOnDelete(review.getGame().getId(), review.getScore());

        reviewRepository.delete(review);
    }
}

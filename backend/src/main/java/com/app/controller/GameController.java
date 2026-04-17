package com.app.controller;

import com.app.dto.GameResponse;
import com.app.model.Game;
import com.app.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
public class GameController {

    private final GameRepository gameRepository;

    @GetMapping
    public ResponseEntity<List<GameResponse>> getGames(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String platform) {

        // Default cursor if not provided (start from the beginning)
        Long lastId = cursor != null ? cursor : 0L;

        // Implementation of filtering and pagination
        // Note: For simplicity, we use the CursorPaginationRepository method.
        // In a real scenario, we'd combine this with a Specification or QueryDSL for dynamic filters.
        List<Game> games = gameRepository.findTopNByIdGreaterThanOrderByIdAsc(lastId, PageRequest.of(0, size));

        List<GameResponse> response = games.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private GameResponse mapToResponse(Game game) {
        return GameResponse.builder()
                .id(game.getId())
                .name(game.getName())
                .primaryGenre(game.getPrimaryGenre())
                .avgScore(game.getAvgScore())
                .totalReviews(game.getTotalReviews())
                .platforms(game.getPlatforms())
                .releaseYear(game.getReleaseYear())
                .summary(game.getSummary())
                .igdbId(game.getIgdbId())
                .build();
    }
}

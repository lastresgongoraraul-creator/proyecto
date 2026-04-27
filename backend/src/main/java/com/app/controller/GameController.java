package com.app.controller;

import com.app.dto.GameResponse;
import com.app.dto.PagedResponse;
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
    public ResponseEntity<PagedResponse<GameResponse>> getGames(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String platform) {

        Long lastId = cursor != null ? cursor : 0L;

        List<Game> games = gameRepository.findTopNByIdGreaterThanOrderByIdAsc(lastId, PageRequest.of(0, size));

        List<GameResponse> responseContent = games.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        Long nextCursor = games.isEmpty() ? null : games.get(games.size() - 1).getId();

        PagedResponse<GameResponse> response = PagedResponse.<GameResponse>builder()
                .content(responseContent)
                .nextCursor(nextCursor)
                .size(games.size())
                .build();

        return ResponseEntity.ok(response);
    }

    private GameResponse mapToResponse(Game game) {
        return GameResponse.builder()
                .id(game.getId())
                .title(game.getName())
                .description(game.getSummary())
                .genre(game.getPrimaryGenre())
                .avgScore(game.getAvgScore())
                .totalReviews(game.getTotalReviews())
                .thumbnail(game.getCoverUrl())
                .platform(game.getPlatforms() != null && game.getPlatforms().length > 0 ? game.getPlatforms()[0] : "N/A")
                .platforms(game.getPlatforms())
                .releaseYear(game.getReleaseYear())
                .igdbId(game.getIgdbId())
                .build();
    }
}

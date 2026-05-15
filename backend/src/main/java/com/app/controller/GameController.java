package com.app.controller;

import com.app.dto.GameResponse;
import com.app.dto.GameDetailResponse;
import com.app.dto.PagedResponse;
import com.app.dto.ReviewDto;
import com.app.model.Game;
import com.app.repository.GameRepository;
import com.app.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
public class GameController {

    private final GameRepository gameRepository;
    private final ReviewRepository reviewRepository;
    private final com.app.repository.UserRepository userRepository;
    private final com.app.repository.ReviewLikeRepository reviewLikeRepository;
    private final com.app.repository.FollowRepository followRepository;

    @GetMapping
    public ResponseEntity<PagedResponse<GameResponse>> getGames(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String platform) {

        Long lastId = cursor != null ? cursor : 0L;

        // Build specification for filtering
        Specification<Game> spec = Specification.where(idGreaterThan(lastId));

        if (search != null && !search.isBlank()) {
            spec = spec.and(nameLike(search));
        }
        if (genre != null && !genre.isBlank()) {
            spec = spec.and(genreEquals(genre));
        }
        if (platform != null && !platform.isBlank()) {
            spec = spec.and(platformContains(platform));
        }

        List<Game> games = gameRepository.findAll(spec, PageRequest.of(0, size, Sort.by(Sort.Direction.ASC, "id"))).getContent();

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

    @GetMapping("/{id}")
    public ResponseEntity<GameDetailResponse> getGameById(@PathVariable Long id, @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        final com.app.model.User currentUser = userDetails != null ? 
                userRepository.findByUsername(userDetails.getUsername()).or(() -> userRepository.findByEmail(userDetails.getUsername())).orElse(null) : null;
        
        return gameRepository.findById(id)
                .map(game -> {
                    List<ReviewDto> reviews = reviewRepository.findByGameId(id).stream()
                            .map(r -> ReviewDto.builder()
                                    .id(r.getId())
                                    .username(r.getUser().getUsername())
                                    .score(r.getScore())
                                    .comment(r.getComment())
                                    .gameId(game.getId())
                                    .gameTitle(game.getName())
                                    .createdAt(r.getCreatedAt())
                                    .userId(r.getUser().getId())
                                    .likesCount(reviewLikeRepository.countByReview(r))
                                    .liked(currentUser != null && reviewLikeRepository.existsByReviewAndUser(r, currentUser))
                                    .followingAuthor(currentUser != null && followRepository.existsByFollowerAndFollowed(currentUser, r.getUser()))
                                    .build())
                            .collect(Collectors.toList());

                    return GameDetailResponse.builder()
                            .id(game.getId())
                            .title(game.getName())
                            .description(game.getSummary())
                            .genre(game.getPrimaryGenre())
                            .avgScore(game.getAvgScore())
                            .totalReviews(game.getTotalReviews())
                            .thumbnail(game.getCoverUrl())
                            .platform(game.getPlatforms() != null && !game.getPlatforms().isEmpty() ? game.getPlatforms().get(0) : "N/A")
                            .platforms(game.getPlatforms())
                            .releaseYear(game.getReleaseYear())
                            .igdbId(game.getIgdbId())
                            .pegi(game.getPegi())
                            .isMultiplayer(game.getIsMultiplayer())
                            .developer(game.getDeveloper())
                            .publisher(game.getPublisher())
                            .officialWebsite(game.getOfficialWebsite())
                            .reviews(reviews)
                            .build();
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Game> createGame(@RequestBody Game game) {
        if (game.getAvgScore() == null) game.setAvgScore(java.math.BigDecimal.ZERO);
        if (game.getTotalReviews() == null) game.setTotalReviews(0);
        return ResponseEntity.ok(gameRepository.save(game));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Game> updateGame(@PathVariable Long id, @RequestBody Game gameDetails) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        
        game.setName(gameDetails.getName());
        game.setSummary(gameDetails.getSummary());
        game.setPrimaryGenre(gameDetails.getPrimaryGenre());
        game.setCoverUrl(gameDetails.getCoverUrl());
        game.setReleaseYear(gameDetails.getReleaseYear());
        game.setPegi(gameDetails.getPegi());
        game.setIsMultiplayer(gameDetails.getIsMultiplayer());
        game.setDeveloper(gameDetails.getDeveloper());
        game.setPublisher(gameDetails.getPublisher());
        game.setOfficialWebsite(gameDetails.getOfficialWebsite());
        
        if (gameDetails.getPlatforms() != null) game.setPlatforms(gameDetails.getPlatforms());
        if (gameDetails.getGenres() != null) game.setGenres(gameDetails.getGenres());
        
        return ResponseEntity.ok(gameRepository.save(game));
    }

    private Specification<Game> idGreaterThan(Long id) {
        return (root, query, cb) -> cb.greaterThan(root.get("id"), id);
    }

    private Specification<Game> nameLike(String name) {
        return (root, query, cb) -> cb.like(
                cb.function("unaccent", String.class, cb.lower(root.get("name"))),
                cb.function("unaccent", String.class, cb.literal("%" + name.toLowerCase() + "%"))
        );
    }

    private Specification<Game> genreEquals(String genre) {
        return (root, query, cb) -> cb.like(
                cb.function("unaccent", String.class, cb.lower(cb.function("array_to_string", String.class, root.get("genres"), cb.literal(",")))),
                cb.function("unaccent", String.class, cb.literal("%" + genre.toLowerCase() + "%"))
        );
    }

    private Specification<Game> platformContains(String platform) {
        return (root, query, cb) -> cb.like(
                cb.function("unaccent", String.class, cb.lower(cb.function("array_to_string", String.class, root.get("platforms"), cb.literal(",")))),
                cb.function("unaccent", String.class, cb.literal("%" + platform.toLowerCase() + "%"))
        );
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
                .platform(game.getPlatforms() != null && !game.getPlatforms().isEmpty() ? game.getPlatforms().get(0) : "N/A")
                .platforms(game.getPlatforms())
                .releaseYear(game.getReleaseYear())
                .igdbId(game.getIgdbId())
                .pegi(game.getPegi())
                .isMultiplayer(game.getIsMultiplayer())
                .developer(game.getDeveloper())
                .publisher(game.getPublisher())
                .officialWebsite(game.getOfficialWebsite())
                .build();
    }
}

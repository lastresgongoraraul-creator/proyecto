package com.app.controller;

import com.app.model.Game;
import com.app.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/games")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final GameRepository gameRepository;

    @PostMapping
    public ResponseEntity<Game> createGame(@RequestBody Game game) {
        return ResponseEntity.ok(gameRepository.save(game));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Game> updateGame(@PathVariable Long id, @RequestBody Game gameDetails) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        
        game.setName(gameDetails.getName());
        game.setSummary(gameDetails.getSummary());
        game.setPrimaryGenre(gameDetails.getPrimaryGenre());
        game.setPlatforms(gameDetails.getPlatforms());
        game.setGenres(gameDetails.getGenres());
        game.setReleaseYear(gameDetails.getReleaseYear());
        game.setCoverUrl(gameDetails.getCoverUrl());
        
        return ResponseEntity.ok(gameRepository.save(game));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        gameRepository.delete(game);
        return ResponseEntity.noContent().build();
    }
}

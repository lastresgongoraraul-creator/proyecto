package com.app.service;

import com.app.dto.ChatMessageResponse;
import com.app.exception.ResourceNotFoundException;
import com.app.model.ChatMessage;
import com.app.model.CommunityMember;
import com.app.model.Game;
import com.app.model.User;
import com.app.repository.ChatMessageRepository;
import com.app.repository.CommunityMemberRepository;
import com.app.repository.GameRepository;
import com.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityMemberRepository communityMemberRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final Random random = new Random();

    @Transactional
    public void join(String username, Long gameId) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        if (communityMemberRepository.existsByUserAndGame(user, game)) {
            return;
        }

        CommunityMember membership = CommunityMember.builder()
                .user(user)
                .game(game)
                .build();
        communityMemberRepository.save(membership);
    }

    @Transactional
    public void leave(String username, Long gameId) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        communityMemberRepository.findByUserAndGame(user, game)
                .ifPresent(communityMemberRepository::delete);
    }

    public List<Map<String, Object>> getCommunities(String currentUsername) {
        final User currentUser = currentUsername != null ?
                userRepository.findByUsername(currentUsername)
                        .orElseGet(() -> userRepository.findByEmail(currentUsername).orElse(null))
                : null;

        // For now, return the most popular games as communities
        return gameRepository.findAll().stream().map(game -> {
            boolean joined = currentUser != null && communityMemberRepository.existsByUserAndGame(currentUser, game);
            Map<String, Object> community = new java.util.HashMap<>();
            community.put("gameId", game.getId().toString());
            community.put("gameTitle", game.getName());
            community.put("gameThumbnail", game.getCoverUrl() != null ? game.getCoverUrl() : "");
            community.put("gameGenre", game.getPrimaryGenre() != null ? game.getPrimaryGenre() : "Action");
            community.put("avgScore", game.getAvgScore());
            community.put("activeUsers", random.nextInt(40) + 5);
            community.put("joined", joined);
            community.put("totalMembers", communityMemberRepository.countByGame(game) + (game.getId() % 50 + 100));
            return community;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getJoinedCommunities(String username) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")));

        return communityMemberRepository.findByUser(user).stream()
                .map(membership -> {
                    Game game = membership.getGame();
                    Map<String, Object> joined = new java.util.HashMap<>();
                    joined.put("gameId", game.getId().toString());
                    joined.put("gameTitle", game.getName());
                    joined.put("gameThumbnail", game.getCoverUrl() != null ? game.getCoverUrl() : "");
                    joined.put("gameGenre", game.getPrimaryGenre() != null ? game.getPrimaryGenre() : "Action");
                    return joined;
                }).collect(Collectors.toList());
    }

    public List<ChatMessageResponse> getChatHistory(Long gameId) {
        if (!gameRepository.existsById(gameId)) {
            throw new ResourceNotFoundException("Game not found");
        }

        return chatMessageRepository.findByGameIdOrderByCreatedAtAsc(gameId).stream()
                .map(msg -> ChatMessageResponse.builder()
                        .id(msg.getId())
                        .content(msg.getContent())
                        .createdAt(msg.getCreatedAt())
                        .username(msg.getUser().getUsername())
                        .avatarUrl(msg.getUser().getAvatarUrl())
                        .build())
                .collect(Collectors.toList());
    }
}

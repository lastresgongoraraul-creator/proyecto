package com.app.controller;

import com.app.dto.ChatMessageResponse;
import com.app.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getCommunities(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(communityService.getCommunities(username));
    }

    @PostMapping("/{gameId}/join")
    public ResponseEntity<Void> join(@PathVariable Long gameId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        communityService.join(userDetails.getUsername(), gameId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{gameId}/join")
    public ResponseEntity<Void> leave(@PathVariable Long gameId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        communityService.leave(userDetails.getUsername(), gameId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/joined")
    public ResponseEntity<List<Map<String, Object>>> getJoined(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(communityService.getJoinedCommunities(userDetails.getUsername()));
    }

    @GetMapping("/{gameId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(@PathVariable Long gameId) {
        return ResponseEntity.ok(communityService.getChatHistory(gameId));
    }
}

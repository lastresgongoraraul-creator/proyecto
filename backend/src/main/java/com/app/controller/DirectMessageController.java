package com.app.controller;

import com.app.dto.DirectMessageDto;
import com.app.model.DirectMessage;
import com.app.model.User;
import com.app.service.DirectMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/direct-messages")
@RequiredArgsConstructor
public class DirectMessageController {

    private final DirectMessageService dmService;

    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(@AuthenticationPrincipal UserDetails userDetails) {
        List<User> participants = dmService.getActiveConversations(userDetails.getUsername());
        
        List<Map<String, Object>> response = participants.stream()
                .map(u -> Map.of(
                        "id", (Object)u.getId(),
                        "username", (Object)u.getUsername()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{recipientUsername}")
    public ResponseEntity<List<DirectMessageDto>> getConversation(
            @PathVariable String recipientUsername,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<DirectMessage> messages = dmService.getConversation(userDetails.getUsername(), recipientUsername);
        
        List<DirectMessageDto> response = messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<DirectMessageDto> sendMessage(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long receiverId = Long.valueOf(request.get("receiverId").toString());
        String content = request.get("content").toString();
        
        DirectMessage saved = dmService.saveMessage(userDetails.getUsername(), receiverId, content);
        return ResponseEntity.ok(convertToDto(saved));
    }

    private DirectMessageDto convertToDto(DirectMessage dm) {
        return DirectMessageDto.builder()
                .id(dm.getId())
                .senderId(dm.getSender().getId())
                .senderUsername(dm.getSender().getUsername())
                .receiverId(dm.getReceiver().getId())
                .receiverUsername(dm.getReceiver().getUsername())
                .content(dm.getContent())
                .createdAt(dm.getCreatedAt())
                .read(dm.isRead())
                .build();
    }
}

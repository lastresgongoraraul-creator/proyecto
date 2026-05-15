package com.app.controller;

import com.app.model.ModerationStatus;
import com.app.model.ModerationTicket;
import com.app.service.ModerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/moderator")
@RequiredArgsConstructor
public class ModerationController {

    private final ModerationService moderationService;

    @GetMapping("/tickets/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<List<ModerationTicket>> getPendingTickets() {
        return ResponseEntity.ok(moderationService.getPendingTickets());
    }

    @PutMapping("/tickets/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Void> resolveTicket(@PathVariable Long id, @RequestParam ModerationStatus status) {
        moderationService.resolveTicket(id, status);
        return ResponseEntity.ok().build();
    }
}

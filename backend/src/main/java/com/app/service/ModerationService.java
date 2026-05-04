package com.app.service;

import com.app.exception.ResourceNotFoundException;
import com.app.model.*;
import com.app.repository.ModerationRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModerationService {

    private final ModerationRepository moderationRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional
    public void reportReview(Long reviewId, String reporterUsername, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
        
        User reporter = userRepository.findByUsername(reporterUsername).orElse(null);

        ModerationTicket ticket = ModerationTicket.builder()
                .review(review)
                .reporter(reporter)
                .reason(reason)
                .status(ModerationStatus.PENDING)
                .build();
        
        moderationRepository.save(ticket);
    }

    public List<ModerationTicket> getPendingTickets() {
        return moderationRepository.findByStatus(ModerationStatus.PENDING);
    }

    @Transactional
    public void resolveTicket(Long ticketId, ModerationStatus status) {
        ModerationTicket ticket = moderationRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        
        ticket.setStatus(status);
        moderationRepository.save(ticket);

        // If the ticket is resolved (e.g., review should be removed), 
        // additional logic could be added here.
    }
}

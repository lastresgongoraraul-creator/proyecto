package com.app.service;

import com.app.exception.ResourceNotFoundException;
import com.app.model.DirectMessage;
import com.app.model.User;
import com.app.repository.DirectMessageRepository;
import com.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DirectMessageService {

    private final DirectMessageRepository dmRepository;
    private final UserRepository userRepository;

    public List<DirectMessage> getConversation(String username1, String username2) {
        User user1 = userRepository.findByUsername(username1)
                .or(() -> userRepository.findByEmail(username1))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username1));
        User user2 = userRepository.findByUsername(username2)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username2));

        return dmRepository.findConversation(user1, user2);
    }

    public List<User> getActiveConversations(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Get all unique users this user has sent messages to or received messages from
        List<DirectMessage> sent = dmRepository.findAll().stream()
                .filter(dm -> dm.getSender().getId().equals(user.getId()))
                .collect(Collectors.toList());
        List<DirectMessage> received = dmRepository.findByReceiverOrderByCreatedAtDesc(user);

        Set<User> participants = Stream.concat(
                sent.stream().map(DirectMessage::getReceiver),
                received.stream().map(DirectMessage::getSender)
        ).collect(Collectors.toSet());

        return List.copyOf(participants);
    }

    @Transactional
    public DirectMessage saveMessage(String senderUsername, Long receiverId, String content) {
        User sender = userRepository.findByUsername(senderUsername)
                .or(() -> userRepository.findByEmail(senderUsername))
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        DirectMessage dm = DirectMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .build();

        return dmRepository.save(dm);
    }
}

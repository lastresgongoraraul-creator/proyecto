package com.app.service;

import com.app.model.Notification;
import com.app.model.NotificationType;
import com.app.model.User;
import com.app.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        return emitter;
    }

    public void sendNotification(User recipient, User sender, NotificationType type, Long relatedId, String message) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .type(type)
                .relatedId(relatedId)
                .message(message)
                .read(false)
                .build();

        notificationRepository.save(notification);

        SseEmitter emitter = emitters.get(recipient.getId());
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(Map.of(
                                "id", notification.getId(),
                                "type", type.name(),
                                "senderUsername", sender != null ? sender.getUsername() : "System",
                                "message", message,
                                "referenceId", relatedId != null ? relatedId : 0,
                                "createdAt", java.time.ZonedDateTime.now().toString()
                        )));
            } catch (IOException e) {
                emitters.remove(recipient.getId());
            }
        }
    }
}

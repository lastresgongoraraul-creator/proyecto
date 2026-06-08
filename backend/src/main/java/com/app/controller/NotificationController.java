package com.app.controller;

import com.app.model.User;
import com.app.repository.UserRepository;
import com.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import com.app.model.Notification;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final com.app.repository.NotificationRepository notificationRepository;

    /**
     * Establece una conexión en tiempo real con el cliente usando SSE (Server-Sent Events).
     * El cliente se suscribe a este endpoint y se queda escuchando para recibir
     * las notificaciones al instante sin tener que recargar.
     */
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal UserDetails userDetails) {
        // Run in a separate thread to prevent OSIV from holding a DB connection for the entire SSE session
        Long userId = java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            return userRepository.findByUsername(userDetails.getUsername())
                    .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();
        }).join();
        return notificationService.subscribe(userId);
    }

    /**
     * Obtiene el historial de notificaciones del usuario autenticado.
     * Devuelve las últimas 50 notificaciones ordenadas por fecha de creación (de más reciente a más antigua).
     */
    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user, PageRequest.of(0, 50));
        return ResponseEntity.ok(notifications);
    }
}

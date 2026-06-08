package com.app.model;

/**
 * Enumeración con los distintos tipos de notificaciones que puede recibir un usuario.
 * Ayuda al frontend a saber qué icono o mensaje mostrar.
 */
public enum NotificationType {
    FOLLOW,
    LIKE,
    FRIEND_REQUEST,
    FRIEND_ACCEPT,
    REPORT
}

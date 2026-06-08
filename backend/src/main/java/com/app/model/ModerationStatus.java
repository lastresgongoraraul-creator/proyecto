package com.app.model;

/**
 * Define los estados de un ticket de moderación.
 * PENDING: En espera de revisión. RESOLVED: Sancionado/Aprobado. DISMISSED: Rechazado (falsa alarma).
 */
public enum ModerationStatus {
    PENDING,
    RESOLVED,
    DISMISSED
}

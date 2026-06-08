package com.app.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Representa un rol de seguridad dentro del sistema (ej. USER, ADMIN, MODERATOR).
 * Se utiliza en combinación con el User y el SecurityConfig para autorizar rutas.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String name;
}

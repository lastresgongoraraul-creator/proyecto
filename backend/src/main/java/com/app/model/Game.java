package com.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(length = 100)
    private String genre;

    @Column(name = "avg_score", precision = 3, scale = 2)
    private BigDecimal avgScore;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    // pgvector column mapping (using columnDefinition for basic support)
    @Column(columnDefinition = "vector(1536)")
    private String embedding;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}

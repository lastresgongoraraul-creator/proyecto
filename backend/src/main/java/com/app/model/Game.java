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
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "primary_genre", length = 100)
    private String primaryGenre;

    @Column(name = "igdb_id", unique = true)
    private Integer igdbId;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "platforms")
    private String[] platforms;

    @Column(name = "genres")
    private String[] genres;

    @Column(name = "avg_score", precision = 3, scale = 2)
    private BigDecimal avgScore;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "cover_url", length = 512)
    private String coverUrl;

    @Column(columnDefinition = "vector(384)")
    private String embedding;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}

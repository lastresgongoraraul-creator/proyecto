package com.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.DynamicUpdate
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
    private List<String> platforms;

    @Column(name = "genres")
    private List<String> genres;

    @Column(name = "avg_score", precision = 4, scale = 2)
    private BigDecimal avgScore;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "cover_url", length = 512)
    private String coverUrl;

    @Column(columnDefinition = "vector(384)")
    private String embedding;

    @Column(name = "pegi", length = 20)
    private String pegi;

    @Column(name = "is_multiplayer")
    private Boolean isMultiplayer;

    @Column(name = "developer", length = 255)
    private String developer;

    @Column(name = "publisher", length = 255)
    private String publisher;

    @Column(name = "official_website", length = 512)
    private String officialWebsite;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}

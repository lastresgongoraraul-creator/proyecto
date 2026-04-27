package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class GameResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal avgScore;
    private Integer totalReviews;
    private String thumbnail; 
    private String genre;
    private String platform;
    private java.util.List<String> platforms;
    private Integer releaseYear;
    private Integer igdbId;
    private String pegi;
    private Boolean isMultiplayer;
    private String developer;
    private String publisher;
    private String officialWebsite;
}

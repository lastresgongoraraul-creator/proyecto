package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameResponse {
    private Long id;
    private String name;
    private String primaryGenre;
    private BigDecimal avgScore;
    private Integer totalReviews;
    private String thumbnail; 
    private String[] platforms;
    private Integer releaseYear;
    private String summary;
    private Integer igdbId;
}

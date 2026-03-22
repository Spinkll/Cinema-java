package org.example.backend_cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieDto {
    private Long id;
    private String title;
    private String genre;
    private Integer durationMinutes;
    private String ageRating;
    private String posterUrl;
    private String description;
    private String director;
    private Double rating;
}
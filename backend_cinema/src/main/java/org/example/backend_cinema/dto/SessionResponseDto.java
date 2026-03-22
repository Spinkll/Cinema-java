package org.example.backend_cinema.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SessionResponseDto {
    private Long id;
    private MovieDto movie;
    private HallDto hall;
    private LocalDateTime startTime;
    private BigDecimal price;
    private String status;
}
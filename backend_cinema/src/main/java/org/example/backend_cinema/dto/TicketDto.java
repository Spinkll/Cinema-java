package org.example.backend_cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDto {
    private Long id;
    private Long sessionId;
    private String movieTitle;
    private Integer seatRow;
    private Integer seatNumber;
    private String customerName;
    private String customerEmail;
    private LocalDateTime bookingTime;
    private BigDecimal price;
    private String status;
}

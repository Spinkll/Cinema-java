package org.example.backend_cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SeatResponseDto {
    private Integer row;
    private Integer seat;
}
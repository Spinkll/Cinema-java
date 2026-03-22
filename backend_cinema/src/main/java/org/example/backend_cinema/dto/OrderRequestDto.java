package org.example.backend_cinema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDto {

    @NotNull(message = "ID сеансу є обов'язковим")
    private Long sessionId;

    @NotEmpty(message = "Список місць не може бути порожнім")
    private List<SeatDto> seats;

    @NotNull(message = "Дані покупця є обов'язковими")
    private CustomerDto customer;

    @Data
    public static class SeatDto {
        @NotNull(message = "Ряд є обов'язковим")
        private Integer row;

        @NotNull(message = "Місце є обов'язковим")
        private Integer seat;
    }

    @Data
    public static class CustomerDto {
        @NotBlank(message = "Ім'я не може бути порожнім")
        private String name;

        @NotBlank(message = "Email є обов'язковим")
        @Email(message = "Некоректний формат email")
        private String email;
    }
}
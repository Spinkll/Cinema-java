package org.example.backend_cinema.service;

import lombok.RequiredArgsConstructor;
import org.example.backend_cinema.entity.Hall;
import org.example.backend_cinema.entity.Movie;
import org.example.backend_cinema.entity.Session;
import org.example.backend_cinema.repository.HallRepository;
import org.example.backend_cinema.repository.MovieRepository;
import org.example.backend_cinema.repository.SessionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final HallRepository hallRepository;
    private final SessionRepository sessionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (movieRepository.count() == 0) {

            Hall hall = Hall.builder()
                    .name("Зал IMAX")
                    .rowCount(10)
                    .seatsPerRow(15)
                    .type("IMAX")
                    .status("ACTIVE")
                    .build();

            hallRepository.save(hall);

            LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);

            System.out.println(" Тестові дані успішно завантажено в H2 базу!");
        }
    }
}
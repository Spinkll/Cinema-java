package org.example.backend_cinema.service;

import lombok.RequiredArgsConstructor;
import org.example.backend_cinema.dto.SessionDto;
import org.example.backend_cinema.entity.Hall;
import org.example.backend_cinema.entity.Movie;
import org.example.backend_cinema.entity.Session;
import org.example.backend_cinema.repository.HallRepository;
import org.example.backend_cinema.repository.MovieRepository;
import org.example.backend_cinema.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final MovieRepository movieRepository;
    private final HallRepository hallRepository;

    public List<SessionDto> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SessionDto getSessionById(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Сеанс не знайдено"));
        return mapToDto(session);
    }

    @Transactional
    public SessionDto createSession(SessionDto dto) {
        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new RuntimeException("Фільм не знайдено"));
        Hall hall = hallRepository.findById(dto.getHallId())
                .orElseThrow(() -> new RuntimeException("Зал не знайдено"));

        Session session = Session.builder()
                .movie(movie)
                .hall(hall)
                .startTime(dto.getStartTime())
                .price(dto.getPrice())
                .status(dto.getStatus())
                .build();
        
        return mapToDto(sessionRepository.save(session));
    }

    @Transactional
    public SessionDto updateSession(Long id, SessionDto dto) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Сеанс не знайдено"));
        
        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new RuntimeException("Фільм не знайдено"));
        Hall hall = hallRepository.findById(dto.getHallId())
                .orElseThrow(() -> new RuntimeException("Зал не знайдено"));

        session.setMovie(movie);
        session.setHall(hall);
        session.setStartTime(dto.getStartTime());
        session.setPrice(dto.getPrice());
        session.setStatus(dto.getStatus());

        return mapToDto(sessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    private SessionDto mapToDto(Session session) {
        return SessionDto.builder()
                .id(session.getId())
                .movieId(session.getMovie().getId())
                .movieTitle(session.getMovie().getTitle())
                .hallId(session.getHall().getId())
                .hallName(session.getHall().getName())
                .startTime(session.getStartTime())
                .price(session.getPrice())
                .status(session.getStatus())
                .build();
    }
}

package org.example.backend_cinema.repository;

import org.example.backend_cinema.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByMovieId(Long movieId);

    List<Session> findByStatus(String status);

    List<Session> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}
package org.example.backend_cinema.repository;

import org.example.backend_cinema.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findBySessionId(Long sessionId);

    boolean existsBySessionIdAndSeatRowAndSeatNumber(Long sessionId, Integer seatRow, Integer seatNumber);
}
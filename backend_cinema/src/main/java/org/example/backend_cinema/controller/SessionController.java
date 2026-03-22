package org.example.backend_cinema.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_cinema.dto.SeatResponseDto;
import org.example.backend_cinema.dto.SessionDto;
import org.example.backend_cinema.service.SessionService;
import org.example.backend_cinema.repository.TicketRepository;
import org.example.backend_cinema.entity.Ticket;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final TicketRepository ticketRepository;

    @GetMapping
    public ResponseEntity<List<SessionDto>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDto> getSessionById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PostMapping
    public ResponseEntity<SessionDto> createSession(@RequestBody SessionDto sessionDto) {
        return ResponseEntity.ok(sessionService.createSession(sessionDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionDto> updateSession(@PathVariable("id") Long id, @RequestBody SessionDto sessionDto) {
        return ResponseEntity.ok(sessionService.updateSession(id, sessionDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable("id") Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<SeatResponseDto>> getTakenSeats(@PathVariable("id") Long id) {

        List<Ticket> tickets = ticketRepository.findBySessionId(id);

        List<SeatResponseDto> takenSeats = tickets.stream()
                .map(ticket -> new SeatResponseDto(ticket.getSeatRow(), ticket.getSeatNumber()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(takenSeats);
    }
}
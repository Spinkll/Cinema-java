package org.example.backend_cinema.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_cinema.dto.TicketDto;
import org.example.backend_cinema.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<TicketDto>> getAllTickets() {
        return ResponseEntity.ok(orderService.getAllTickets());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable("id") Long id) {
        orderService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<TicketDto> refundTicket(@PathVariable("id") Long id) {
        return ResponseEntity.ok(orderService.updateTicketStatus(id, "refunded"));
    }
}
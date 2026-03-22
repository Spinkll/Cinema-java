package org.example.backend_cinema.service;

import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import org.example.backend_cinema.dto.OrderRequestDto;
import org.example.backend_cinema.dto.TicketDto;
import org.example.backend_cinema.entity.Session;
import org.example.backend_cinema.entity.Ticket;
import org.example.backend_cinema.repository.SessionRepository;
import org.example.backend_cinema.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final TicketRepository ticketRepository;
    private final SessionRepository sessionRepository;

    @Transactional
    public void createOrder(OrderRequestDto orderRequest) {

        Session session = sessionRepository.findById(orderRequest.getSessionId())
                .orElseThrow(() -> new RuntimeException("Сеанс не знайдено"));

        for (OrderRequestDto.SeatDto seat : orderRequest.getSeats()) {

            boolean isTaken = ticketRepository.existsBySessionIdAndSeatRowAndSeatNumber(
                    session.getId(), seat.getRow(), seat.getSeat()
            );

            if (isTaken) {
                throw new RuntimeException("Місце Ряд " + seat.getRow() + ", Місце " + seat.getSeat() + " вже зайняте!");
            }

            Ticket ticket = Ticket.builder()
                    .session(session)
                    .seatRow(seat.getRow())
                    .seatNumber(seat.getSeat())
                    .customerName(orderRequest.getCustomer().getName())
                    .customerEmail(orderRequest.getCustomer().getEmail())
                    .bookingTime(LocalDateTime.now())
                    .price(session.getPrice())
                    .status("active")
                    .build();

            ticketRepository.save(ticket);
        }
    }

    public List<TicketDto> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    @Transactional
    public TicketDto updateTicketStatus(Long id, String status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Квиток не знайдено"));
        ticket.setStatus(status);
        return mapToDto(ticketRepository.save(ticket));
    }

    private TicketDto mapToDto(Ticket ticket) {
        return TicketDto.builder()
                .id(ticket.getId())
                .sessionId(ticket.getSession().getId())
                .movieTitle(ticket.getSession().getMovie().getTitle())
                .seatRow(ticket.getSeatRow())
                .seatNumber(ticket.getSeatNumber())
                .customerName(ticket.getCustomerName())
                .customerEmail(ticket.getCustomerEmail())
                .bookingTime(ticket.getBookingTime())
                .price(ticket.getPrice())
                .status(ticket.getStatus())
                .build();
    }
}
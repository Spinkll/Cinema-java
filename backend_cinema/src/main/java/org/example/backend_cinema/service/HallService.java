package org.example.backend_cinema.service;

import lombok.RequiredArgsConstructor;
import org.example.backend_cinema.dto.HallDto;
import org.example.backend_cinema.entity.Hall;
import org.example.backend_cinema.repository.HallRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HallService {

    private final HallRepository hallRepository;

    public List<HallDto> getAllHalls() {
        return hallRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public HallDto getHallById(Long id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Зал не знайдено"));
        return mapToDto(hall);
    }

    @Transactional
    public HallDto createHall(HallDto hallDto) {
        Hall hall = Hall.builder()
                .name(hallDto.getName())
                .rowCount(hallDto.getRowCount())
                .seatsPerRow(hallDto.getSeatsPerRow())
                .type(hallDto.getType())
                .status(hallDto.getStatus())
                .build();
        return mapToDto(hallRepository.save(hall));
    }

    @Transactional
    public HallDto updateHall(Long id, HallDto hallDto) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Зал не знайдено"));
        
        hall.setName(hallDto.getName());
        hall.setRowCount(hallDto.getRowCount());
        hall.setSeatsPerRow(hallDto.getSeatsPerRow());
        hall.setType(hallDto.getType());
        hall.setStatus(hallDto.getStatus());
        
        return mapToDto(hallRepository.save(hall));
    }

    @Transactional
    public void deleteHall(Long id) {
        hallRepository.deleteById(id);
    }

    private HallDto mapToDto(Hall hall) {
        return HallDto.builder()
                .id(hall.getId())
                .name(hall.getName())
                .rowCount(hall.getRowCount())
                .seatsPerRow(hall.getSeatsPerRow())
                .type(hall.getType())
                .status(hall.getStatus())
                .build();
    }
}

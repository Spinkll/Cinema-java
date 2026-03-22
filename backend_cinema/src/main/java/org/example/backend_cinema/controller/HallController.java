package org.example.backend_cinema.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_cinema.dto.HallDto;
import org.example.backend_cinema.service.HallService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/halls")
@RequiredArgsConstructor
public class HallController {

    private final HallService hallService;

    @GetMapping
    public ResponseEntity<List<HallDto>> getAllHalls() {
        return ResponseEntity.ok(hallService.getAllHalls());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HallDto> getHallById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(hallService.getHallById(id));
    }

    @PostMapping
    public ResponseEntity<HallDto> createHall(@RequestBody HallDto hallDto) {
        return ResponseEntity.ok(hallService.createHall(hallDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HallDto> updateHall(@PathVariable("id") Long id, @RequestBody HallDto hallDto) {
        return ResponseEntity.ok(hallService.updateHall(id, hallDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHall(@PathVariable("id") Long id) {
        hallService.deleteHall(id);
        return ResponseEntity.noContent().build();
    }
}
package org.example.backend_cinema.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_cinema.dto.MovieDto;
import org.example.backend_cinema.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<List<MovieDto>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/search")
    public ResponseEntity<List<MovieDto>> searchMovies(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "genre", required = false) String genre) {
        
        String searchTerm = (search != null) ? search : query;
        if (genre != null) {
            return ResponseEntity.ok(movieService.getAllMovies());
        }
        return ResponseEntity.ok(movieService.searchMovies(searchTerm));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieDto> getMovieById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovieDto> updateMovie(@PathVariable("id") Long id, @RequestBody MovieDto movieDto) {
        return ResponseEntity.ok(movieService.updateMovie(id, movieDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable("id") Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/external-search")
    public ResponseEntity<List<Map<String, Object>>> searchExternal(
            @RequestParam(value = "title", required = true) String title) {
        
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        return ResponseEntity.ok(movieService.searchMoviesFromExternalApi(title));
    }

    @PostMapping("/import")
    public ResponseEntity<MovieDto> importMovie(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "imdbId", required = false) String imdbId) {
        
        if (imdbId != null) {
            return ResponseEntity.ok(movieService.saveMovieByImdbId(imdbId));
        }
        return ResponseEntity.ok(movieService.fetchAndSaveMovieFromApi(title));
    }

    @PostMapping
    public ResponseEntity<MovieDto> createMovie(@RequestBody MovieDto movieDto) {
        return ResponseEntity.ok(movieService.createMovie(movieDto));
    }
}
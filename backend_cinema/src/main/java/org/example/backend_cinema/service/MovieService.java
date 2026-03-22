package org.example.backend_cinema.service;

import lombok.RequiredArgsConstructor;
import org.example.backend_cinema.dto.MovieDto;
import org.example.backend_cinema.entity.Movie;
import org.example.backend_cinema.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${TMDB_API_KEY}")
    private String TMDB_API_KEY;

    private final String TMDB_BASE_URL = "https://api.themoviedb.org/3";
    private final String TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

    public List<MovieDto> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> searchMovies(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MovieDto getMovieById(Long id) {
        return movieRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Фільм не знайдено"));
    }

    @Transactional
    public MovieDto updateMovie(Long id, MovieDto dto) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Фільм не знайдено"));

        movie.setTitle(dto.getTitle());
        movie.setGenre(dto.getGenre());
        movie.setDurationMinutes(dto.getDurationMinutes());
        movie.setAgeRating(dto.getAgeRating());
        movie.setPosterUrl(dto.getPosterUrl());
        movie.setDescription(dto.getDescription());
        movie.setDirector(dto.getDirector());
        movie.setRating(dto.getRating());

        return mapToDto(movieRepository.save(movie));
    }

    @Transactional
    public MovieDto createMovie(MovieDto dto) {
        Movie movie = Movie.builder()
                .title(dto.getTitle())
                .genre(dto.getGenre())
                .durationMinutes(dto.getDurationMinutes())
                .ageRating(dto.getAgeRating())
                .posterUrl(dto.getPosterUrl())
                .description(dto.getDescription())
                .director(dto.getDirector())
                .rating(dto.getRating())
                .build();
        return mapToDto(movieRepository.save(movie));
    }

    @Transactional
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }

    public List<Map<String, Object>> searchMoviesFromExternalApi(String title) {
        String url = String.format("%s/search/movie?api_key=%s&query=%s&language=uk-UA",
                TMDB_BASE_URL, TMDB_API_KEY, title);

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || response.get("results") == null) {
            return List.of();
        }

        List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

        return results.stream().map(m -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("Title", m.get("title"));
            map.put("Year", m.get("release_date") != null ? m.get("release_date").toString().split("-")[0] : "");
            map.put("imdbID", m.get("id").toString()); // Використовуємо TMDB ID замість IMDB
            map.put("Poster", m.get("poster_path") != null ? TMDB_IMAGE_BASE + m.get("poster_path") : null);
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public MovieDto saveMovieByImdbId(String tmdbId) {
        String url = String.format("%s/movie/%s?api_key=%s&language=uk-UA&append_to_response=credits",
                TMDB_BASE_URL, tmdbId, TMDB_API_KEY);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null) {
            throw new RuntimeException("Фільм не знайдено в TMDB");
        }

        Integer duration = (Integer) response.get("runtime");
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> genres = (List<Map<String, Object>>) response.get("genres");
        String genreNames = genres != null ? genres.stream()
                .map(g -> (String) g.get("name"))
                .collect(Collectors.joining(", ")) : "Невідомо";

        String overview = (String) response.get("overview");
        
        Double rating = null;
        if (response.get("vote_average") instanceof Number) {
            rating = ((Number) response.get("vote_average")).doubleValue();
        }

        String director = "Невідомо";
        @SuppressWarnings("unchecked")
        Map<String, Object> credits = (Map<String, Object>) response.get("credits");
        if (credits != null) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> crew = (List<Map<String, Object>>) credits.get("crew");
            if (crew != null) {
                for (Map<String, Object> member : crew) {
                    if ("Director".equals(member.get("job"))) {
                        director = (String) member.get("name");
                        break;
                    }
                }
            }
        }

        Movie movie = Movie.builder()
                .title((String) response.get("title"))
                .genre(genreNames)
                .durationMinutes(duration != null ? duration : 0)
                .ageRating(response.get("adult") != null && (Boolean) response.get("adult") ? "18+" : "12+")
                .posterUrl(response.get("poster_path") != null ? TMDB_IMAGE_BASE + response.get("poster_path") : null)
                .description(overview)
                .director(director)
                .rating(rating)
                .build();

        return mapToDto(movieRepository.save(movie));
    }

    public MovieDto fetchAndSaveMovieFromApi(String title) {
        List<Map<String, Object>> searchResults = searchMoviesFromExternalApi(title);
        if (searchResults.isEmpty()) {
            throw new RuntimeException("Фільм не знайдено");
        }
        String firstId = searchResults.get(0).get("imdbID").toString();
        return saveMovieByImdbId(firstId);
    }

    private MovieDto mapToDto(Movie movie) {
        return MovieDto.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .genre(movie.getGenre())
                .durationMinutes(movie.getDurationMinutes())
                .ageRating(movie.getAgeRating())
                .posterUrl(movie.getPosterUrl())
                .description(movie.getDescription())
                .director(movie.getDirector())
                .rating(movie.getRating())
                .build();
    }
}
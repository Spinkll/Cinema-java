"use client"

import Image from "next/image"
import { Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Movie } from "@/lib/data"
import { sessions } from "@/lib/data"
import { cn } from "@/lib/utils"

interface MovieGridProps {
  movies: Movie[]
  onSelect: (movie: Movie) => void
}

const GENRE_COLORS: Record<string, string> = {
  "Фантастика": "bg-chart-2/20 text-chart-2 border-chart-2/30",
  "Драма": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  "Комедия": "bg-warning/20 text-warning border-warning/30",
  "Боевик": "bg-destructive/20 text-destructive border-destructive/30",
  "Анимация": "bg-success/20 text-success border-success/30",
}

export function MovieGrid({ movies, onSelect }: MovieGridProps) {
  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground text-balance">Выберите фильм</h1>
        <p className="mt-2 text-muted-foreground">Доступно {movies.length} фильмов в прокате</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {movies.map((movie) => {
          const movieSessions = sessions.filter(
            (s) => s.movieId === movie.id && s.status === "scheduled"
          )
          const minPrice = movieSessions.length
            ? Math.min(...movieSessions.map((s) => s.price))
            : null

          return (
            <button
              key={movie.id}
              onClick={() => onSelect(movie)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left",
                "transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                <div className="absolute right-2 top-2">
                  <span className="rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-bold text-foreground backdrop-blur-sm">
                    {movie.rating}
                  </span>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-sm font-semibold text-white">Выбрать сеанс</span>
                </div>
              </div>

              
              <div className="flex flex-1 flex-col gap-2 p-3">
                <h2 className="font-semibold text-card-foreground leading-snug line-clamp-2 text-sm">
                  {movie.title}
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn("text-xs px-1.5 py-0", GENRE_COLORS[movie.genre] ?? "bg-muted text-muted-foreground border-border")}
                  >
                    {movie.genre}
                  </Badge>
                </div>

                <div className="mt-auto flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">{Math.floor(movie.duration / 60)}ч {movie.duration % 60}мин</span>
                  </div>
                  {minPrice !== null ? (
                    <span className="text-xs font-semibold text-primary">от {minPrice} ₽</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Нет сеансов</span>
                  )}
                </div>

                {movieSessions.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span>{movieSessions.length} сеанс{movieSessions.length > 1 ? "а" : ""} сегодня</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

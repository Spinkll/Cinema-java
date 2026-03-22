"use client"

import Image from "next/image"
import { Clock, Users, MapPin, Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Movie, Session } from "@/lib/data"
import { halls } from "@/lib/data"

interface SessionPickerProps {
  movie: Movie
  sessions: Session[]
  onSelect: (session: Session) => void
}

const HALL_TYPE_LABELS: Record<string, string> = {
  standard: "Стандарт",
  vip: "VIP",
  imax: "IMAX",
}

const HALL_TYPE_COLORS: Record<string, string> = {
  standard: "bg-muted text-muted-foreground border-border",
  vip: "bg-warning/20 text-warning border-warning/30",
  imax: "bg-chart-2/20 text-chart-2 border-chart-2/30",
}

export function SessionPicker({ movie, sessions, onSelect }: SessionPickerProps) {
  return (
    <section>
      
      <div className="mb-8 flex gap-5 rounded-xl border border-border bg-card p-5">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          <h1 className="text-xl font-bold text-card-foreground text-balance">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {Math.floor(movie.duration / 60)}ч {movie.duration % 60}мин
            </span>
            <span className="text-border">|</span>
            <span>{movie.genre}</span>
            <span className="text-border">|</span>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {movie.rating}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Выберите сеанс</h2>
        <p className="mt-1 text-sm text-muted-foreground">Сегодня, 21 марта 2024</p>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Ticket className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">Нет доступных сеансов на сегодня</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const hall = halls.find((h) => h.id === session.hallId)
            const available = session.totalSeats - session.soldTickets
            const occupancyPct = (session.soldTickets / session.totalSeats) * 100
            const isFull = available === 0

            return (
              <button
                key={session.id}
                onClick={() => !isFull && onSelect(session)}
                disabled={isFull}
                className={cn(
                  "group relative flex flex-col gap-4 rounded-xl border bg-card p-5 text-left",
                  "transition-all duration-150",
                  isFull
                    ? "cursor-not-allowed border-border opacity-50"
                    : "cursor-pointer border-border hover:border-primary/60 hover:shadow-md hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                
                <div className="flex items-start justify-between">
                  <span className="text-3xl font-bold tabular-nums text-card-foreground">
                    {session.time}
                  </span>
                  {hall && (
                    <Badge
                      variant="outline"
                      className={cn("text-xs", HALL_TYPE_COLORS[hall.type])}
                    >
                      {HALL_TYPE_LABELS[hall.type]}
                    </Badge>
                  )}
                </div>

                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{session.hallName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>{available} свободных мест из {session.totalSeats}</span>
                  </div>
                </div>

                
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        occupancyPct > 80 ? "bg-destructive" : occupancyPct > 50 ? "bg-warning" : "bg-primary"
                      )}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Цена за место</span>
                  <span className="text-lg font-bold text-primary">{session.price} ₽</span>
                </div>

                
                <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-primary transition-opacity group-hover:opacity-100" />
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

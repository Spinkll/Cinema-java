"use client"

import { useState, useMemo, useEffect } from "react"
import { type Movie, type Session, type Hall } from "@/lib/data"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Film,
  Clock,
  Calendar,
  MapPin,
  Search,
  Star,
  ChevronRight,
  Ticket,
  Settings,
  Phone,
  Mail,
  MapPinned
} from "lucide-react"
import Link from "next/link"
import { SeatMap } from "@/components/booking/seat-map"
import { OrderSummary } from "@/components/booking/order-summary"

type BookingStep = "browse" | "seats" | "confirm"

interface SelectedSeat {
  row: number
  seat: number
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}год ${mins}хв`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0
  }).format(value)
}

function scrollToPosition(targetTop: number) {
  const startPosition = window.scrollY
  const distance = targetTop - startPosition
  const duration = 800
  let startTime: number | null = null

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    window.scrollTo(0, startPosition + distance * ease)
    if (elapsed < duration) {
      requestAnimationFrame(animation)
    }
  }

  requestAnimationFrame(animation)
}

function scrollToSection(id: string) {
  const element = document.getElementById(id)
  if (!element) return

  const headerOffset = 80
  const elementPosition = element.getBoundingClientRect().top + window.scrollY
  scrollToPosition(elementPosition - headerOffset)
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [step, setStep] = useState<BookingStep>("browse")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])

  useEffect(() => {
    Promise.all([
      api.movies.list(),
      api.sessions.list(undefined, "scheduled"),
      api.halls.list()
    ]).then(async ([mData, sData, hData]) => {
      
      const baseEnriched = sData.map(session => {
        const movie = mData.find(m => m.id.toString() === session.movieId.toString())
        const hall = hData.find(h => h.id.toString() === session.hallId.toString())
        const startDate = session.startTime ? new Date(session.startTime) : new Date()
        const timeStr = startDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })

        return {
          ...session,
          movieTitle: session.movieTitle || movie?.title || 'Невідомий фільм',
          hallName: session.hallName || hall?.name || 'Невідомий зал',
          time: timeStr,
          totalSeats: session.totalSeats || hall?.totalSeats || (hall ? (hall.rowCount * hall.seatsPerRow) : 0) || 0,
          occupiedCount: session.soldTickets || 0 
        }
      })

      
      const finalEnriched = await Promise.all(baseEnriched.map(async (s) => {
        try {
          const taken = await api.sessions.getSeats(s.id.toString())
          return { ...s, occupiedCount: taken.length }
        } catch (e) {
          return s
        }
      }))

      setMovies(mData)
      setSessions(finalEnriched)
      setHalls(hData)
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  const genres = useMemo(() => {
    const allGenresSet = new Set<string>()
    movies.forEach(m => {
      if (m.genre) {
        m.genre.split(',').forEach(g => {
          const trimmed = g.trim()
          if (trimmed) allGenresSet.add(trimmed)
        })
      }
    })
    return Array.from(allGenresSet).sort()
  }, [movies])

  const scheduledSessions = useMemo(() => {
    return sessions.filter(s => s.status?.toLowerCase() === "scheduled")
  }, [sessions])

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const movieSessions = scheduledSessions.filter(s => s.movieId.toString() === movie.id.toString())
      if (movieSessions.length === 0) return false 

      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGenre = !selectedGenre || (movie.genre || "").split(',').map(g => g.trim()).includes(selectedGenre)
      return matchesSearch && matchesGenre
    })
  }, [searchQuery, selectedGenre, movies, scheduledSessions])

  const getMovieSessions = (movieId: string | number) => {
    return scheduledSessions.filter(s => s.movieId.toString() === movieId.toString())
  }

  const selectedHall = useMemo(
    () => halls.find((h) => h.id.toString() === selectedSession?.hallId?.toString()) ?? null,
    [selectedSession, halls]
  )

  function handleSelectSession(session: Session) {
    setSelectedSession(session)
    setSelectedSeats([])
    setStep("seats")
  }

  function handleSeatsConfirm() {
    setStep("confirm")
  }

  function handleReset() {
    setStep("browse")
    setSelectedSession(null)
    setSelectedSeats([])
  }

  function handleBackToSessions() {
    setStep("browse")
    setSelectedSession(null)
    setSelectedSeats([])
  }

  
  if (step === "seats" && selectedSession && selectedHall) {
    return (
      <div className="min-h-screen bg-background">
        
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={handleBackToSessions}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Назад до афіші</span>
            </button>
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">КіноТеатр</span>
            </div>
            <div className="w-24" />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SeatMap
            session={selectedSession}
            hall={selectedHall}
            selectedSeats={selectedSeats}
            onSeatsChange={setSelectedSeats}
            onConfirm={handleSeatsConfirm}
          />
        </main>
      </div>
    )
  }

  if (step === "confirm" && selectedSession && selectedHall) {
    return (
      <div className="min-h-screen bg-background">
        
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep("seats")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Назад до вибору місць</span>
            </button>
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">КіноТеатр</span>
            </div>
            <div className="w-32" />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OrderSummary
            session={selectedSession}
            hall={selectedHall}
            seats={selectedSeats}
            onReset={handleReset}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">КіноТеатр</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => {
                handleReset()
                scrollToPosition(0)
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Головна
            </button>
            <button
              onClick={() => scrollToSection('schedule')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Розклад
            </button>
            <button
              onClick={() => scrollToSection('contacts')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Контакти
            </button>
          </div>

          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Адмін</span>
            </Button>
          </Link>
        </div>
      </header>

      
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Кіно, яке <span className="text-primary">надихає</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
              Обирайте фільми, бронюйте місця та насолоджуйтесь найкращими прем{"'"}єрами на великому екрані
            </p>

            
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Знайти фільм..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedGenre === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(null)}
              >
                Всі жанри
              </Button>
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" id="schedule">
        <h2 className="text-2xl font-bold text-foreground mb-8">Зараз у кіно</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <h3 className="mt-4 text-lg font-medium text-foreground">Завантаження...</h3>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <Film className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Фільми не знайдено</h3>
            <p className="mt-2 text-muted-foreground">Спробуйте змінити параметри пошуку</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredMovies.map((movie) => {
              const movieSessions = getMovieSessions(movie.id)

              return (
                <Card key={movie.id} className="bg-card border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      
                      <div className="relative lg:w-64 shrink-0">
                        <div className="aspect-[2/3] lg:aspect-auto lg:h-full bg-muted">
                          <img
                            src={movie.posterUrl || '/placeholder.svg?height=300&width=200'}
                            alt={movie.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Badge
                          className="absolute top-3 left-3 bg-primary text-primary-foreground"
                        >
                          {movie.ageRating}
                        </Badge>
                      </div>

                      
                      <div className="flex-1 p-6">
                        <div className="flex flex-col h-full">
                          <div>
                            <h3 className="text-2xl font-bold text-card-foreground">{movie.title}</h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              {(movie.genre || "").split(',').map((g, i) => (
                                <Badge key={i} variant="secondary" className="bg-secondary/50 text-muted-foreground font-normal">
                                  {g.trim()}
                                </Badge>
                              ))}
                              {movie.rating && (
                                <span className="flex items-center gap-1 text-yellow-500">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="font-medium text-foreground">{movie.rating.toFixed(1)}</span>
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDuration(movie.durationMinutes)}
                              </span>
                            </div>
                            {movie.director && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                Режисер: <span className="text-foreground">{movie.director}</span>
                              </p>
                            )}
                          </div>

                          
                          <div className="mt-6 flex-1">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                              Оберіть сеанс
                            </h4>

                            {movieSessions.length === 0 ? (
                              <p className="text-muted-foreground text-sm">Немає доступних сеансів</p>
                            ) : (
                              <div className="flex flex-wrap gap-3">
                                {movieSessions.map((session: any) => {
                                  const availableSeats = session.totalSeats - (session.occupiedCount ?? 0)
                                  const isAlmostFull = availableSeats < 10 && availableSeats > 0
                                  const isFull = availableSeats <= 0

                                  return (
                                    <button
                                      key={session.id}
                                      onClick={() => handleSelectSession(session)}
                                      disabled={isFull}
                                      className={`group flex flex-col items-start rounded-lg border p-3 transition-all min-w-[140px] ${isFull
                                          ? 'border-border bg-muted/20 opacity-60 cursor-not-allowed'
                                          : 'border-border bg-secondary/50 hover:border-primary hover:bg-secondary'
                                        }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`text-lg font-bold transition-colors ${isFull ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
                                          {session.time}
                                        </span>
                                      </div>
                                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {session.hallName}
                                      </div>
                                      <div className="mt-2 flex items-center justify-between w-full">
                                        <span className={`text-sm font-medium ${isFull ? 'text-muted-foreground' : 'text-primary'}`}>
                                          {formatCurrency(session.price)}
                                        </span>
                                        <span className={`text-xs ${isFull ? 'text-destructive font-bold' : isAlmostFull ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                                          {isFull ? 'Місць немає' : `${availableSeats} місць`}
                                        </span>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      
      <section id="contacts" className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Контакти</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-secondary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Телефон</h3>
              <p className="text-muted-foreground">+380 (44) 123-45-67</p>
              <p className="text-muted-foreground">+380 (67) 987-65-43</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-secondary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground">info@kinoteatr.ua</p>
              <p className="text-muted-foreground">booking@kinoteatr.ua</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-secondary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <MapPinned className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Адреса</h3>
              <p className="text-muted-foreground">м. Запоріжжя, вул. Перемоги, 1</p>
              <p className="text-muted-foreground">Щодня з 10:00 до 23:00</p>
            </div>
          </div>
        </div>
      </section>

      
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">КіноТеатр</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2026 КіноТеатр. Всі права захищено.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Адмін-панель
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

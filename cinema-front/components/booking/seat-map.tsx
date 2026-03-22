"use client"

import { useMemo, useState, useEffect } from "react"
import { Monitor, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type Session, type Hall } from "@/lib/data"
import { api } from "@/lib/api"

export interface SelectedSeat {
  row: number
  seat: number
}

interface SeatMapProps {
  session: Session
  hall: Hall
  selectedSeats: SelectedSeat[]
  onSeatsChange: (seats: SelectedSeat[]) => void
  onConfirm: () => void
}


function useTakenSeats(sessionId: string | number) {
  const [taken, setTaken] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.sessions.getSeats(sessionId.toString()).then(seats => {
      const set = new Set<string>()
      seats.forEach(s => set.add(`${s.row}-${s.seat}`))
      setTaken(set)
    }).catch(console.error)
  }, [sessionId])

  return taken
}


function isVipSeat(row: number, seat: number, hall: Hall) {
  return false
}

function isPremiumSeat(row: number, hall: Hall) {
  return false
}

export function SeatMap({ session, hall, selectedSeats, onSeatsChange, onConfirm }: SeatMapProps) {
  const takenSeats = useTakenSeats(session.id)

  function getSeatKey(row: number, seat: number) {
    return `${row}-${seat}`
  }

  function isTaken(row: number, seat: number) {
    return takenSeats.has(getSeatKey(row, seat))
  }

  function isSelected(row: number, seat: number) {
    return selectedSeats.some((s) => s.row === row && s.seat === seat)
  }

  function toggleSeat(row: number, seat: number) {
    if (isTaken(row, seat)) return
    const key = getSeatKey(row, seat)
    const already = isSelected(row, seat)
    if (already) {
      onSeatsChange(selectedSeats.filter((s) => !(s.row === row && s.seat === seat)))
    } else {
      if (selectedSeats.length >= 8) return 
      onSeatsChange([...selectedSeats, { row, seat }])
    }
  }

  const totalPrice = selectedSeats.reduce((acc) => {
    return acc + session.price
  }, 0)


  const aisleAfter = hall.seatsPerRow > 10 ? Math.floor(hall.seatsPerRow / 2) : null

  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:gap-8">

      <div className="flex-1 min-w-0">

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <span className="font-semibold text-card-foreground">{session.movieTitle}</span>
          <span className="text-border">·</span>
          <span className="text-muted-foreground">{session.hallName}</span>
          <span className="text-border">·</span>
          <span className="text-muted-foreground">{session.time}</span>
        </div>


        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="h-3.5 w-3.5" />
            <span>Екран</span>
          </div>
          <div className="h-1.5 w-4/5 rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>


        <div className="overflow-x-auto pb-2">
          <div className="mx-auto w-fit">
            {Array.from({ length: hall.rowCount || 0 }, (_, rowIdx) => {
              const row = rowIdx + 1
              return (
                <div key={row} className="mb-1.5 flex items-center gap-1">

                  <span className="w-6 shrink-0 text-center text-[10px] font-medium text-muted-foreground/60 tabular-nums">
                    {row}
                  </span>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: hall.seatsPerRow }, (_, seatIdx) => {
                      const seat = seatIdx + 1
                      const taken = isTaken(row, seat)
                      const selected = isSelected(row, seat)
                      const vip = isVipSeat(row, seat, hall)
                      const premium = isPremiumSeat(row, hall)

                      return (
                        <div key={seat} className="flex items-center">

                          {aisleAfter && seat === aisleAfter + 1 && (
                            <div className="w-4 shrink-0" />
                          )}
                          <button
                            onClick={() => toggleSeat(row, seat)}
                            disabled={taken}
                            title={taken ? "Зайнято" : `Ряд ${row}, місце ${seat}`}
                              className={cn(
                                "h-6 w-6 rounded-t-lg text-[9px] font-medium transition-all duration-100",
                                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                                taken && "cursor-not-allowed bg-muted/40 text-muted-foreground/30",
                                !taken && selected && "bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/30",
                                !taken && !selected && "bg-secondary text-muted-foreground hover:bg-primary/70 hover:text-primary-foreground cursor-pointer",
                              )}
                          >
                            {seat}
                          </button>
                        </div>
                      )
                    })}
                  </div>


                  <span className="w-6 shrink-0 text-center text-[10px] font-medium text-muted-foreground/60 tabular-nums">
                    {row}
                  </span>
                </div>
              )
            })}
          </div>
        </div>


        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <LegendItem color="bg-secondary" label="Вільно" />
          <LegendItem color="bg-primary" label="Вибрано" />
          <LegendItem color="bg-muted/40" label="Зайнято" />
        </div>
      </div>

      
      <aside className="lg:w-72 shrink-0">
        <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-semibold text-card-foreground">Ваш вибір</h3>

          {selectedSeats.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Info className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Оберіть місця на схемі</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                {selectedSeats
                  .sort((a, b) => a.row - b.row || a.seat - b.seat)
                  .map((s) => (
                    <div
                      key={`${s.row}-${s.seat}`}
                      className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2 text-sm"
                    >
                      <span className="text-card-foreground">
                        Ряд {s.row}, місце {s.seat}
                      </span>
                      <span className="font-medium text-primary">{session.price} ₴</span>
                    </div>
                  ))}
              </div>
              <div className="border-t border-border pt-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Разом</span>
                <span className="text-xl font-bold text-foreground">{totalPrice} ₴</span>
              </div>
            </div>
          )}

          <Button
            onClick={onConfirm}
            disabled={selectedSeats.length === 0}
            className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            Продовжити
          </Button>
        </div>
      </aside>
    </section>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("h-5 w-5 rounded-t-md", color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

"use client"

import { Film, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BookingStep } from "@/app/booking/page"
import Link from "next/link"

const STEPS: { key: BookingStep; label: string }[] = [
  { key: "movie", label: "Фильм" },
  { key: "session", label: "Сеанс" },
  { key: "seats", label: "Места" },
  { key: "confirm", label: "Оплата" },
]

const STEP_ORDER: BookingStep[] = ["movie", "session", "seats", "confirm"]

interface BookingHeaderProps {
  step: BookingStep
  onBack: () => void
}

export function BookingHeader({ step, onBack }: BookingHeaderProps) {
  const currentIndex = STEP_ORDER.indexOf(step)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Film className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground hidden sm:block">CinemaAdmin</span>
          </div>

          
          <div className="flex items-center gap-1 sm:gap-3">
            {STEPS.map((s, index) => {
              const isDone = index < currentIndex
              const isActive = index === currentIndex
              return (
                <div key={s.key} className="flex items-center gap-1 sm:gap-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        isDone && "bg-primary text-primary-foreground",
                        isActive && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                        !isDone && !isActive && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isDone ? (
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "hidden sm:block text-xs font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn("h-px w-6 sm:w-10", isDone ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              )
            })}
          </div>

          
          <div className="flex items-center gap-2 shrink-0">
            {step !== "movie" ? (
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Назад</span>
              </Button>
            ) : (
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
                  Панель управления
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

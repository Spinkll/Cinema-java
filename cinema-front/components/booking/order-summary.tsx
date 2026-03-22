"use client"

import { useState, type FormEvent, type ElementType } from "react"
import { CheckCircle2, Film, MapPin, Clock, User, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Session, Hall } from "@/lib/data"
import type { SelectedSeat } from "./seat-map"
import { api } from "@/lib/api"

interface OrderSummaryProps {
  session: Session
  hall: Hall
  seats: SelectedSeat[]
  onReset: () => void
}

export function OrderSummary({ session, hall, seats, onReset }: OrderSummaryProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; submit?: string }>({})

  const totalPrice = seats.length * session.price

  function validate() {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = "Введіть ім'я"
    if (!email.trim()) errs.email = "Введіть email"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Некоректний email"
    return errs
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    
    try {
      setIsSubmitting(true)
      await api.orders.create({
        sessionId: String(session.id),
        seats,
        customer: { name, email }
      })
      setSubmitted(true)
    } catch (error) {
      console.error(error)
      setErrors({ submit: "Виникла помилка під час бронювання. Можливо, хтось щойно викупив ці місця." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Замовлення оформлено!</h1>
        <p className="mb-1 text-muted-foreground">
          Квитки відправлені на <span className="font-medium text-foreground">{email}</span>
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Номер замовлення: <span className="font-mono font-semibold text-primary">#{Math.random().toString(36).slice(2, 10).toUpperCase()}</span>
        </p>


        <div className="mx-auto mb-8 max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
          <div className="bg-primary/10 px-5 py-4 text-left">
            <p className="text-xs uppercase tracking-widest text-primary/70">Електронний квиток</p>
            <h2 className="mt-0.5 text-lg font-bold text-card-foreground">{session.movieTitle ?? "Без назви"}</h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow icon={MapPin} label="Зал" value={session.hallName ?? "Не вказано"} />
              <InfoRow icon={Clock} label="Час" value={session.time ?? "Не вказано"} />
              <InfoRow icon={User} label="Покупець" value={name} />
              <InfoRow
                icon={Film}
                label="Місця"
                value={seats.map((s) => `${s.row}/${s.seat}`).join(", ")}
              />
            </div>

            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 border-t border-dashed border-border" />
              <div className="h-4 w-4 rounded-full border border-dashed border-border" />
              <div className="h-px flex-1 border-t border-dashed border-border" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Разом</span>
              <span className="text-xl font-bold text-primary">{totalPrice} ₴</span>
            </div>
          </div>
        </div>

        <Button onClick={onReset} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Купити ще квитки
        </Button>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Оформлення замовлення</h1>
        <p className="mt-1 text-sm text-muted-foreground">Заповніть дані для отримання квитків</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">

        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-card-foreground uppercase tracking-wider text-muted-foreground">Контактні дані</h2>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm text-card-foreground">
                Ім'я та прізвище
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Іван Петренко"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
                  className={cn(
                    "pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground",
                    errors.name && "border-destructive"
                  )}
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-card-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ivan@mail.ua"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
                  className={cn(
                    "pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground",
                    errors.email && "border-destructive"
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {errors.submit}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {isSubmitting ? "Оформлення..." : `Підтвердити замовлення — ${totalPrice} ₴`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Квитки будуть відправлені на вказаний email
          </p>
        </form>


        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Підсумок замовлення</h2>

            <div className="space-y-2.5 text-sm">
              <SummaryRow label="Фільм" value={session.movieTitle ?? "Без назви"} />
              <SummaryRow label="Зал" value={session.hallName ?? "Не вказано"} />
              <SummaryRow label="Сеанс" value={session.time ?? "Не вказано"} />
              <SummaryRow
                label="Місця"
                value={seats.sort((a, b) => a.row - b.row || a.seat - b.seat).map((s) => `р.${s.row} м.${s.seat}`).join(", ")}
              />
            </div>

            <div className="border-t border-border pt-3">
              <div className="space-y-1.5">
                {seats.map((s) => (
                  <div key={`${s.row}-${s.seat}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ряд {s.row}, місце {s.seat}</span>
                    <span className="text-card-foreground">{session.price} ₴</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold text-card-foreground">Разом</span>
                <span className="text-xl font-bold text-primary">{totalPrice} ₴</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-card-foreground text-right">{value}</span>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-card-foreground">{value}</p>
      </div>
    </div>
  )
}

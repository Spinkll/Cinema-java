"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Session, type Movie, type Hall } from "@/lib/data"
import { api } from "@/lib/api"
import { Plus, Pencil, Trash2, Calendar, Clock, Film, Building2, Search, Filter } from "lucide-react"

const statusLabels: Record<string, string> = {
  scheduled: 'Заплановано',
  ongoing: 'Триває',
  completed: 'Завершено',
  cancelled: 'Скасовано',
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  ongoing: 'bg-success/20 text-success border-success/30',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0
  }).format(value)
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    movieId: '',
    hallId: '',
    date: '',
    time: '',
    price: '',
    status: 'scheduled' as Session['status'],
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [sData, mData, hData] = await Promise.all([
        api.sessions.list(),
        api.movies.list(),
        api.halls.list()
      ])

      setMovies(mData)
      setHalls(hData)

      
      const enriched = await Promise.all(sData.map(async (session) => {
        const movie = mData.find(m => m.id.toString() === session.movieId.toString())
        const hall = hData.find(h => h.id.toString() === session.hallId.toString())

        let occupiedCount = session.soldTickets || 0
        try {
          const taken = await api.sessions.getSeats(session.id.toString())
          occupiedCount = taken.length
        } catch (e) {
          console.error("Failed to fetch seats for session", session.id, e)
        }

        return {
          ...session,
          movieTitle: session.movieTitle || movie?.title || 'Невідомий фільм',
          hallName: session.hallName || hall?.name || 'Невідомий зал',
          totalSeats: session.totalSeats || hall?.totalSeats || (hall ? (hall.rowCount * hall.seatsPerRow) : 0) || 0,
          soldTickets: occupiedCount
        }
      }))

      setSessions(enriched)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredSessions = sessions.filter(session => {
    const title = session.movieTitle || ''
    const hall = session.hallName || ''
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hall.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || session.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const openCreateDialog = () => {
    setEditingSession(null)
    setFormData({
      movieId: '',
      hallId: '',
      date: '',
      time: '',
      price: '',
      status: 'scheduled',
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (session: Session) => {
    setEditingSession(session)
    const startDate = session.startTime ? new Date(session.startTime) : new Date()
    const dateStr = startDate.toISOString().split('T')[0]
    const timeStr = startDate.toTimeString().split(' ')[0].substring(0, 5)

    setFormData({
      movieId: session.movieId.toString(),
      hallId: session.hallId.toString(),
      date: dateStr,
      time: timeStr,
      price: session.price.toString(),
      status: (session.status || 'scheduled').toLowerCase() as any,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const startTime = `${formData.date}T${formData.time}:00`
      const sessionData: Partial<Session> = {
        movieId: parseInt(formData.movieId),
        hallId: parseInt(formData.hallId),
        startTime,
        price: parseFloat(formData.price),
        status: formData.status.toUpperCase() as Session['status'],
      }

      if (editingSession) {
        await api.sessions.update(editingSession.id.toString(), sessionData)
      } else {
        await api.sessions.create(sessionData)
      }

      setIsDialogOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (confirm('Ви впевнені, що хочете видалити цей сеанс?')) {
      try {
        await api.sessions.delete(id.toString())
        loadData()
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <AdminLayout
      title="Керування сеансами"
      description="Розклад показів фільмів"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук за фільмом або залом..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-secondary border-0">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі статуси</SelectItem>
              <SelectItem value="scheduled">Заплановано</SelectItem>
              <SelectItem value="ongoing">Триває</SelectItem>
              <SelectItem value="completed">Завершено</SelectItem>
              <SelectItem value="cancelled">Скасовано</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2 w-full md:w-auto">
              <Plus className="h-4 w-4" />
              Додати сеанс
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                {editingSession ? 'Редагувати сеанс' : 'Додати новий сеанс'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Введіть параметри сеансу.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Фільм</Label>
                  <Select
                    value={formData.movieId}
                    onValueChange={(value) => setFormData({ ...formData, movieId: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Оберіть фільм" />
                    </SelectTrigger>
                    <SelectContent>
                      {movies.map(movie => (
                        <SelectItem key={movie.id} value={movie.id.toString()}>
                          {movie.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Зал</Label>
                  <Select
                    value={formData.hallId}
                    onValueChange={(value) => setFormData({ ...formData, hallId: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Оберіть зал" />
                    </SelectTrigger>
                    <SelectContent>
                      {halls.map(hall => (
                        <SelectItem key={hall.id} value={hall.id.toString()}>
                          {hall.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Час</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ціна (грн)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="150"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Заплановано</SelectItem>
                      <SelectItem value="ongoing">Триває</SelectItem>
                      <SelectItem value="completed">Завершено</SelectItem>
                      <SelectItem value="cancelled">Скасовано</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Скасувати</Button>
              <Button onClick={handleSubmit}>Зберегти</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Дата/Час</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Фільм</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Зал</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Ціна</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Заповнюваність</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Статус</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6 text-sm text-card-foreground">
                      {session.startTime ? new Date(session.startTime).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '---'}
                    </td>
                    <td className="py-4 px-6 text-sm text-card-foreground">{session.movieTitle}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{session.hallName}</td>
                    <td className="py-4 px-6 text-sm text-card-foreground font-medium">{formatCurrency(session.price)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (session.soldTickets / (session.totalSeats || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {session.soldTickets}/{session.totalSeats}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className={statusColors[session.status.toLowerCase()] || statusColors.scheduled}>
                        {statusLabels[session.status.toLowerCase()] || session.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(session)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(session.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Завантаження...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Сеанси не знайдено</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

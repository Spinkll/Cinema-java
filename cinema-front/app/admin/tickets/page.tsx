"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Ticket, type Hall } from "@/lib/data"
import { api } from "@/lib/api"
import { Search, Filter, Ticket as TicketIcon, Eye, RotateCcw, Mail, User, Calendar, Clock, MapPin, Hash } from "lucide-react"

const statusLabels: Record<string, string> = {
  active: 'Активний',
  used: 'Використаний',
  refunded: 'Повернений',
}

const statusColors: Record<string, string> = {
  active: 'bg-success/20 text-success border-success/30',
  used: 'bg-muted text-muted-foreground border-border',
  refunded: 'bg-destructive/20 text-destructive border-destructive/30',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('uk-UA', { 
    style: 'currency', 
    currency: 'UAH',
    maximumFractionDigits: 0 
  }).format(value)
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    Promise.all([
      api.tickets.list(),
      api.sessions.list(),
      api.halls.list()
    ]).then(([tData, sData, hData]) => {
      const enriched = tData.map(ticket => {
        const session = sData.find(s => s.id.toString() === ticket.sessionId.toString())
        const hall = hData.find(h => h.id.toString() === session?.hallId.toString())
        return {
          ...ticket,
          hallName: ticket.hallName || hall?.name || "Не вказано"
        }
      })
      setTickets(enriched)
      setHalls(hData)
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      (ticket.id?.toString() || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.movieTitle?.toString() || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.customerName?.toString() || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.customerEmail?.toString() || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openTicketDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDetailOpen(true)
  }

  const handleRefund = async (ticketId: string) => {
    try {
      await api.tickets.refund(ticketId)
      setTickets(tickets.map(t => t.id.toString() === ticketId ? { ...t, status: 'refunded' as const } : t))
      if (selectedTicket?.id === ticketId) {
        setIsDetailOpen(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const activeTickets = tickets.filter(t => (t.status || "").toLowerCase() === 'active').length
  const usedTickets = tickets.filter(t => (t.status || "").toLowerCase() === 'used').length
  const refundedTickets = tickets.filter(t => (t.status || "").toLowerCase() === 'refunded').length
  const totalRevenue = tickets.filter(t => (t.status || "").toLowerCase() !== 'refunded').reduce((sum, t) => sum + (t.price || 0), 0)

  return (
    <AdminLayout 
      title="Керування квитками" 
      description="Перегляд та керування проданими квитками"
    >
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всього квитків</p>
                <p className="text-2xl font-bold text-card-foreground">{tickets.length}</p>
              </div>
              <TicketIcon className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активних</p>
                <p className="text-2xl font-bold text-success">{activeTickets}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-success/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Використано</p>
                <p className="text-2xl font-bold text-card-foreground">{usedTickets}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Виручка</p>
                <p className="text-2xl font-bold text-primary">
                  {isMounted ? formatCurrency(totalRevenue) : "0 ₴"}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук за ID, фільмом, клієнтом..."
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
            <SelectItem value="active">Активні</SelectItem>
            <SelectItem value="used">Використані</SelectItem>
            <SelectItem value="refunded">Повернені</SelectItem>
          </SelectContent>
        </Select>
      </div>

      
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Сеанс</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Клієнт</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Місце</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Ціна</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Статус</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-primary">{ticket.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-card-foreground font-medium">{ticket.movieTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.hallName} • {ticket.date} {ticket.time}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-card-foreground">{ticket.customerName}</p>
                        <p className="text-xs text-muted-foreground">{ticket.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-card-foreground">
                        Ряд {ticket.seatRow || ticket.row}, Місце {ticket.seatNumber || ticket.seat}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-card-foreground font-medium">
                      {formatCurrency(ticket.price)}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className={statusColors[(ticket.status || "").toLowerCase()] || statusColors.active}>
                        {statusLabels[(ticket.status || "").toLowerCase()] || ticket.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openTicketDetail(ticket)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(ticket.status || "").toLowerCase() === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRefund(ticket.id.toString())}
                            className="text-destructive hover:text-destructive"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Завантаження...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-12 text-center">
              <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Квитки не знайдено</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Квиток {selectedTicket?.id}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Детальна інформація про квиток та дані покупця.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6 py-4">
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Статус</span>
                <Badge variant="outline" className={statusColors[(selectedTicket.status || "").toLowerCase()] || statusColors.active}>
                  {statusLabels[(selectedTicket.status || "").toLowerCase()] || selectedTicket.status}
                </Badge>
              </div>
              
              
              <div className="p-4 bg-secondary rounded-lg space-y-3">
                <h4 className="font-semibold text-card-foreground">{selectedTicket.movieTitle}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedTicket.hallName || "Не вказано"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedTicket.date || (selectedTicket.bookingTime ? new Date(selectedTicket.bookingTime).toLocaleDateString('uk-UA') : "---")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{selectedTicket.time || (selectedTicket.bookingTime ? new Date(selectedTicket.bookingTime).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : "---")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>Ряд {selectedTicket.seatRow || selectedTicket.row}, Місце {selectedTicket.seatNumber || selectedTicket.seat}</span>
                  </div>
                </div>
              </div>
              
              
              <div className="space-y-3">
                <h4 className="font-medium text-card-foreground">Покупець</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{selectedTicket.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{selectedTicket.customerEmail}</span>
                  </div>
                </div>
              </div>
              
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Бронювання</p>
                  <p className="text-sm text-card-foreground">
                    {selectedTicket.bookingTime || selectedTicket.purchasedAt ? formatDateTime(selectedTicket.bookingTime || selectedTicket.purchasedAt) : "---"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Вартість</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(selectedTicket.price)}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Закрити
            </Button>
            {selectedTicket?.status === 'active' && (
              <Button 
                variant="destructive" 
                onClick={() => handleRefund(selectedTicket.id)}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Оформити повернення
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

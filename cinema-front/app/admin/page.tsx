"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Ticket, Calendar, Percent, Clock } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { api } from "@/lib/api"
import { type Session, type Movie, type Hall, type Ticket as TicketType } from "@/lib/data"

function formatCurrency(value: number) {
  return new Intl.NumberFormat('uk-UA', { 
    style: 'currency', 
    currency: 'UAH',
    maximumFractionDigits: 0 
  }).format(value)
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  ongoing: 'bg-success/20 text-success border-success/30',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
}

const statusLabels: Record<string, string> = {
  scheduled: 'Заплановано',
  ongoing: 'Триває',
  completed: 'Завершено',
  cancelled: 'Скасовано',
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    todayRevenue: 0,
    ticketsSoldToday: 0,
    activeSessions: 0,
    occupancyRate: 0,
    weeklyRevenue: [] as { day: string, revenue: number }[],
    moviePopularity: [] as { name: string, tickets: number }[],
  })
  const [todaySessions, setTodaySessions] = useState<Session[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      try {
        const [sessionsResponse, moviesResponse, hallsResponse, ticketsResponse] = await Promise.all([
          api.sessions.list(),
          api.movies.list(),
          api.halls.list(),
          api.tickets.list().catch(() => [] as TicketType[]), 
        ])

        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        
        
        const sessionsToday = sessionsResponse.filter(s => {
          const sDate = s.startTime ? new Date(s.startTime).toISOString().split('T')[0] : ''
          return sDate === todayStr
        })

        
        const enrichedSessionsToday = await Promise.all(sessionsToday.map(async (session) => {
          const movie = moviesResponse.find(m => m.id.toString() === session.movieId.toString())
          const hall = hallsResponse.find(h => h.id.toString() === session.hallId.toString())
          
          let occupiedCount = session.soldTickets || 0
          try {
            const seats = await api.sessions.getSeats(session.id.toString())
            occupiedCount = seats.length
          } catch (e) {
            
          }

          const sTime = session.startTime ? new Date(session.startTime).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : '---'

          return {
            ...session,
            time: sTime,
            movieTitle: movie?.title || 'Невідомий',
            hallName: hall?.name || '---',
            totalSeats: hall ? (hall.rowCount * hall.seatsPerRow) : 0,
            soldTickets: occupiedCount
          }
        }))

        setTodaySessions(enrichedSessionsToday)

        
        let todayRevenue = 0
        let ticketsSoldToday = 0
        const movieTicketsCount: Record<string, number> = {}
        const weeklyRevenueMap: Record<string, number> = {}

        
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(now.getDate() - i)
          const dayName = d.toLocaleDateString('uk-UA', { weekday: 'short' })
          weeklyRevenueMap[dayName] = 0
        }

        ticketsResponse.forEach(ticket => {
          
          const movieTitle = ticket.movieTitle || 'Невідомий'
          if (!movieTicketsCount[movieTitle]) movieTicketsCount[movieTitle] = 0
          movieTicketsCount[movieTitle]++

          
          
          const ticketDateObj = ticket.purchasedAt ? new Date(ticket.purchasedAt) : new Date(ticket.date || todayStr)
          const ticketDateStr = ticketDateObj.toISOString().split('T')[0]
          
          if (ticketDateStr === todayStr) {
            ticketsSoldToday++
            todayRevenue += ticket.price || 0
          }

          
          const diffTime = Math.abs(now.getTime() - ticketDateObj.getTime())
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          if (diffDays < 7) {
            const dayName = ticketDateObj.toLocaleDateString('uk-UA', { weekday: 'short' })
            if (weeklyRevenueMap[dayName] !== undefined) {
              weeklyRevenueMap[dayName] += ticket.price || 0
            }
          }
        })

        const moviePopularity = Object.entries(movieTicketsCount)
          .map(([name, tickets]) => ({ name, tickets }))
          .sort((a, b) => b.tickets - a.tickets)
          .slice(0, 5) 

        const weeklyRevenue = Object.entries(weeklyRevenueMap).map(([day, revenue]) => ({ day, revenue }))

        
        let totalSeatsToday = 0
        let occupiedSeatsToday = 0
        enrichedSessionsToday.forEach(s => {
          totalSeatsToday += s.totalSeats
          occupiedSeatsToday += s.soldTickets
        })
        const occupancyRate = totalSeatsToday > 0 ? Math.round((occupiedSeatsToday / totalSeatsToday) * 100) : 0

        setStatsData({
          todayRevenue,
          ticketsSoldToday,
          activeSessions: sessionsToday.length,
          occupancyRate,
          weeklyRevenue,
          moviePopularity: moviePopularity.length ? moviePopularity : [{ name: 'Немає даних', tickets: 0 }]
        })

      } catch (e) {
        console.error("Failed to load dashboard data", e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <AdminLayout 
      title="Панель керування" 
      description="Огляд статистики кінотеатру"
    >
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Виручка сьогодні"
          value={isLoading ? "..." : formatCurrency(statsData.todayRevenue)}
          change=""
          changeType="neutral"
          icon={TrendingUp}
        />
        <StatCard
          title="Продано квитків"
          value={isLoading ? "..." : statsData.ticketsSoldToday}
          change="за сьогодні"
          changeType="neutral"
          icon={Ticket}
        />
        <StatCard
          title="Сеансів сьогодні"
          value={isLoading ? "..." : statsData.activeSessions}
          change=""
          changeType="neutral"
          icon={Calendar}
        />
        <StatCard
          title="Заповнюваність"
          value={isLoading ? "..." : `${statsData.occupancyRate}%`}
          change="середня за сьогодні"
          changeType="neutral"
          icon={Percent}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Виручка за останні 7 днів</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="h-[300px] flex items-center justify-center text-muted-foreground">Завантаження...</div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.weeklyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      stroke="oklch(0.6 0 0)" 
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="oklch(0.6 0 0)"
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                    />
                    <Tooltip 
                      cursor={{ fill: 'oklch(0.18 0 0 / 0.5)', radius: 4 }}
                      contentStyle={{ 
                        backgroundColor: 'oklch(0.13 0 0)',
                        border: '1px solid oklch(0.25 0 0)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: 'oklch(0.7 0.18 145)', fontWeight: 'bold' }}
                      labelStyle={{ color: 'oklch(0.95 0 0)', marginBottom: '4px', fontWeight: '600' }}
                      formatter={(value: number) => [formatCurrency(value), 'Виручка']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    >
                      {statsData.weeklyRevenue.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === statsData.weeklyRevenue.length - 1 ? 'url(#barGradient)' : 'oklch(0.7 0.18 145 / 0.2)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Популярні фільми (за всіма квитками)</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoading ? (
               <div className="py-12 flex items-center justify-center text-muted-foreground">Завантаження...</div>
             ) : (
              <div className="space-y-4">
                {statsData.moviePopularity.map((movie, index) => {
                  const maxTickets = Math.max(...statsData.moviePopularity.map(m => m.tickets))
                  const percentage = maxTickets > 0 ? (movie.tickets / maxTickets) * 100 : 0
                  
                  return (
                    <div key={movie.name + index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-card-foreground font-medium truncate max-w-[200px]" title={movie.name}>{movie.name}</span>
                        <span className="text-muted-foreground whitespace-nowrap">{movie.tickets} квитків</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
             )}
          </CardContent>
        </Card>
      </div>

      
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Сеанси на сьогодні
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Час</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Фільм</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Зал</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Заповнюваність</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Статус</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Завантаження...
                    </td>
                  </tr>
                ) : todaySessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      На сьогодні немає запланованих сеансів
                    </td>
                  </tr>
                ) : (
                  todaySessions.map((session) => (
                    <tr key={session.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-card-foreground font-medium">{session.time}</td>
                      <td className="py-3 px-4 text-sm text-card-foreground">{session.movieTitle}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{session.hallName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(session.soldTickets / (session.totalSeats || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {session.soldTickets}/{session.totalSeats}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={statusColors[session.status.toLowerCase()] || statusColors.scheduled}>
                          {statusLabels[session.status.toLowerCase()] || session.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

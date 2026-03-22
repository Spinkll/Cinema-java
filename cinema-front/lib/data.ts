

export interface Hall {
  id: string | number
  name: string
  rowCount: number
  seatsPerRow: number
  totalSeats: number
  type: 'STANDARD' | 'VIP' | 'IMAX' | 'standard' | 'vip' | 'imax'
  status: 'ACTIVE' | 'MAINTENANCE' | 'active' | 'maintenance'
}

export interface Movie {
  id: string | number
  title: string
  description?: string
  durationMinutes: number
  genre: string
  ageRating: string
  posterUrl: string
  director?: string
  rating?: number
}

export interface Session {
  id: string | number
  movieId: string | number
  movieTitle?: string
  hallId: string | number
  hallName?: string
  startTime: string
  time?: string
  price: number
  soldTickets: number
  totalSeats: number
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
}

export interface Ticket {
  id: string
  sessionId: string
  movieTitle: string
  hallName: string
  date: string
  time: string
  row?: number
  seat?: number
  seatRow?: number
  seatNumber?: number
  price: number
  customerName: string
  customerEmail: string
  status: 'active' | 'used' | 'refunded'
  purchasedAt: string
  bookingTime?: string
}

export const halls: Hall[] = [
  { id: '1', name: 'Зал 1', rowCount: 10, seatsPerRow: 15, totalSeats: 150, type: 'standard', status: 'active' },
  { id: '2', name: 'Зал 2', rowCount: 8, seatsPerRow: 12, totalSeats: 96, type: 'standard', status: 'active' },
  { id: '3', name: 'VIP Зал', rowCount: 5, seatsPerRow: 8, totalSeats: 40, type: 'vip', status: 'active' },
  { id: '4', name: 'IMAX', rowCount: 12, seatsPerRow: 20, totalSeats: 240, type: 'imax', status: 'active' },
  { id: '5', name: 'Зал 5', rowCount: 10, seatsPerRow: 14, totalSeats: 140, type: 'standard', status: 'maintenance' },
]

export const movies: Movie[] = [
  { id: '1', title: 'Дюна: Частина друга', durationMinutes: 166, genre: 'Фантастика', ageRating: '16+', posterUrl: '/placeholder.svg?height=300&width=200' },
  { id: '2', title: 'Оппенгаймер', durationMinutes: 180, genre: 'Драма', ageRating: '18+', posterUrl: '/placeholder.svg?height=300&width=200' },
  { id: '3', title: 'Барбі', durationMinutes: 114, genre: 'Комедія', ageRating: '12+', posterUrl: '/placeholder.svg?height=300&width=200' },
  { id: '4', title: 'Вартові Галактики 3', durationMinutes: 150, genre: 'Бойовик', ageRating: '12+', posterUrl: '/placeholder.svg?height=300&width=200' },
  { id: '5', title: 'Людина-павук: Павутина всесвітів', durationMinutes: 140, genre: 'Анімація', ageRating: '6+', posterUrl: '/placeholder.svg?height=300&width=200' },
]

export const sessions: Session[] = [
  { id: '1', movieId: '1', movieTitle: 'Дюна: Частина друга', hallId: '4', hallName: 'IMAX', startTime: '2024-03-21T10:00:00', price: 250, soldTickets: 180, totalSeats: 240, status: 'completed' },
  { id: '2', movieId: '1', movieTitle: 'Дюна: Частина друга', hallId: '4', hallName: 'IMAX', startTime: '2024-03-21T14:30:00', price: 250, soldTickets: 220, totalSeats: 240, status: 'ongoing' },
  { id: '3', movieId: '2', movieTitle: 'Оппенгаймер', hallId: '1', hallName: 'Зал 1', startTime: '2024-03-21T11:00:00', price: 180, soldTickets: 120, totalSeats: 150, status: 'completed' },
  { id: '4', movieId: '3', movieTitle: 'Барбі', hallId: '2', hallName: 'Зал 2', startTime: '2024-03-21T13:00:00', price: 150, soldTickets: 85, totalSeats: 96, status: 'ongoing' },
  { id: '5', movieId: '4', movieTitle: 'Вартові Галактики 3', hallId: '3', hallName: 'VIP Зал', startTime: '2024-03-21T18:00:00', price: 350, soldTickets: 28, totalSeats: 40, status: 'scheduled' },
  { id: '6', movieId: '5', movieTitle: 'Людина-павук: Павутина всесвітів', hallId: '1', hallName: 'Зал 1', startTime: '2024-03-21T16:00:00', price: 150, soldTickets: 95, totalSeats: 150, status: 'scheduled' },
  { id: '7', movieId: '1', movieTitle: 'Дюна: Частина друга', hallId: '4', hallName: 'IMAX', startTime: '2024-03-21T19:00:00', price: 280, soldTickets: 145, totalSeats: 240, status: 'scheduled' },
  { id: '8', movieId: '2', movieTitle: 'Оппенгаймер', hallId: '1', hallName: 'Зал 1', startTime: '2024-03-21T21:00:00', price: 180, soldTickets: 68, totalSeats: 150, status: 'scheduled' },
]

export const tickets: Ticket[] = [
  { id: 'T001', sessionId: '1', movieTitle: 'Дюна: Частина друга', hallName: 'IMAX', date: '2024-03-21', time: '10:00', row: 5, seat: 8, price: 250, customerName: 'Іван Петренко', customerEmail: 'ivan@ukr.net', status: 'used', purchasedAt: '2024-03-20T14:30:00' },
  { id: 'T002', sessionId: '1', movieTitle: 'Дюна: Частина друга', hallName: 'IMAX', date: '2024-03-21', time: '10:00', row: 5, seat: 9, price: 250, customerName: 'Іван Петренко', customerEmail: 'ivan@ukr.net', status: 'used', purchasedAt: '2024-03-20T14:30:00' },
  { id: 'T003', sessionId: '2', movieTitle: 'Дюна: Частина друга', hallName: 'IMAX', date: '2024-03-21', time: '14:30', row: 7, seat: 12, price: 250, customerName: 'Марія Сидоренко', customerEmail: 'maria@gmail.com', status: 'active', purchasedAt: '2024-03-20T18:45:00' },
  { id: 'T004', sessionId: '3', movieTitle: 'Оппенгаймер', hallName: 'Зал 1', date: '2024-03-21', time: '11:00', row: 3, seat: 5, price: 180, customerName: 'Олексій Козлов', customerEmail: 'alex@ukr.net', status: 'used', purchasedAt: '2024-03-19T10:00:00' },
  { id: 'T005', sessionId: '4', movieTitle: 'Барбі', hallName: 'Зал 2', date: '2024-03-21', time: '13:00', row: 2, seat: 3, price: 150, customerName: 'Ольга Новікова', customerEmail: 'olga@ukr.net', status: 'active', purchasedAt: '2024-03-21T09:15:00' },
  { id: 'T006', sessionId: '5', movieTitle: 'Вартові Галактики 3', hallName: 'VIP Зал', date: '2024-03-21', time: '18:00', row: 1, seat: 4, price: 350, customerName: 'Дмитро Вовк', customerEmail: 'dmitry@gmail.com', status: 'active', purchasedAt: '2024-03-21T11:30:00' },
  { id: 'T007', sessionId: '6', movieTitle: 'Людина-павук: Павутина всесвітів', hallName: 'Зал 1', date: '2024-03-21', time: '16:00', row: 8, seat: 7, price: 150, customerName: 'Анна Білова', customerEmail: 'anna@ukr.net', status: 'refunded', purchasedAt: '2024-03-20T20:00:00' },
  { id: 'T008', sessionId: '7', movieTitle: 'Дюна: Частина друга', hallName: 'IMAX', date: '2024-03-21', time: '19:00', row: 10, seat: 15, price: 280, customerName: 'Сергій Морозенко', customerEmail: 'sergey@ukr.net', status: 'active', purchasedAt: '2024-03-21T12:00:00' },
]


export const stats = {
  todayRevenue: 98500,
  ticketsSoldToday: 541,
  activeSessions: 4,
  occupancyRate: 78,
  weeklyRevenue: [
    { day: 'Пн', revenue: 72000 },
    { day: 'Вт', revenue: 66000 },
    { day: 'Ср', revenue: 78000 },
    { day: 'Чт', revenue: 84000 },
    { day: 'Пт', revenue: 114000 },
    { day: 'Сб', revenue: 168000 },
    { day: 'Нд', revenue: 152000 },
  ],
  moviePopularity: [
    { name: 'Дюна: Частина друга', tickets: 545 },
    { name: 'Оппенгаймер', tickets: 188 },
    { name: 'Барбі', tickets: 85 },
    { name: 'Вартові Галактики 3', tickets: 28 },
    { name: 'Людина-павук', tickets: 95 },
  ],
}

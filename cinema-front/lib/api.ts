import type { Movie, Hall, Session, Ticket } from "./data"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cinema-java-production.up.railway.app/api"

export const api = {
  movies: {
    list: async (search?: string, genre?: string): Promise<Movie[]> => {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (genre) params.append("genre", genre)
      const query = params.toString() ? `?${params.toString()}` : ""
      const res = await fetch(`${API_BASE}/movies${query}`)
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        console.error(`Fetch movies failed: ${res.status} ${res.statusText}`, text)
        throw new Error(`Failed to fetch movies: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    get: async (id: string | number): Promise<Movie> => {
      const res = await fetch(`${API_BASE}/movies/${id}`)
      if (!res.ok) throw new Error("Failed to fetch movie")
      return res.json()
    },
    create: async (data: Partial<Movie>): Promise<Movie> => {
      const res = await fetch(`${API_BASE}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create movie")
      return res.json()
    },
    externalSearch: async (title: string): Promise<any[]> => {
      const res = await fetch(`${API_BASE}/movies/external-search?title=${encodeURIComponent(title)}`)
      if (!res.ok) throw new Error("Failed to search external movies")
      return res.json()
    },
    import: async (imdbId: string): Promise<Movie> => {
      const res = await fetch(`${API_BASE}/movies/import?imdbId=${encodeURIComponent(imdbId)}`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to import movie")
      return res.json()
    },
    update: async (id: string | number, data: Partial<Movie>): Promise<Movie> => {
      const res = await fetch(`${API_BASE}/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update movie")
      return res.json()
    },
    delete: async (id: string | number): Promise<void> => {
      const res = await fetch(`${API_BASE}/movies/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete movie")
    },
  },

  halls: {
    list: async (): Promise<Hall[]> => {
      const res = await fetch(`${API_BASE}/halls`)
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        console.error(`Fetch halls failed: ${res.status} ${res.statusText}`, text)
        throw new Error(`Failed to fetch halls: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    get: async (id: string | number): Promise<Hall> => {
      const res = await fetch(`${API_BASE}/halls/${id}`)
      if (!res.ok) throw new Error("Failed to fetch hall")
      return res.json()
    },
    create: async (data: Partial<Hall>): Promise<Hall> => {
      const res = await fetch(`${API_BASE}/halls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create hall")
      return res.json()
    },
    update: async (id: string | number, data: Partial<Hall>): Promise<Hall> => {
      const res = await fetch(`${API_BASE}/halls/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update hall")
      return res.json()
    },
    delete: async (id: string | number): Promise<void> => {
      const res = await fetch(`${API_BASE}/halls/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete hall")
    },
  },

  sessions: {
    list: async (movieId?: string, status?: string, date?: string): Promise<Session[]> => {
      const params = new URLSearchParams()
      if (movieId) params.append("movieId", movieId)
      if (status && status !== "all") params.append("status", status)
      if (date) params.append("date", date)
      const query = params.toString() ? `?${params.toString()}` : ""
      const res = await fetch(`${API_BASE}/sessions${query}`)
      if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.status}`)
      return res.json()
    },
    get: async (id: string | number): Promise<Session> => {
      const res = await fetch(`${API_BASE}/sessions/${id}`)
      if (!res.ok) throw new Error("Failed to fetch session")
      return res.json()
    },
    create: async (data: Partial<Session>): Promise<Session> => {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create session")
      return res.json()
    },
    update: async (id: string | number, data: Partial<Session>): Promise<Session> => {
      const res = await fetch(`${API_BASE}/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update session")
      return res.json()
    },
    delete: async (id: string | number): Promise<void> => {
      const res = await fetch(`${API_BASE}/sessions/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete session")
    },
    getSeats: async (id: string): Promise<{ row: number; seat: number }[]> => {
      const res = await fetch(`${API_BASE}/sessions/${id}/seats`)
      if (!res.ok) throw new Error("Failed to fetch seats")
      return res.json()
    },
  },

  orders: {
    create: async (data: {
      sessionId: string
      seats: { row: number; seat: number }[]
      customer: { name: string; email: string }
    }) => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create order")
      return res.json()
    },
  },

  tickets: {
    list: async (): Promise<Ticket[]> => {
      const res = await fetch(`${API_BASE}/tickets`)
      if (!res.ok) throw new Error("Failed to fetch tickets")
      return res.json()
    },
    refund: async (id: string | number): Promise<Ticket> => {
      const res = await fetch(`${API_BASE}/tickets/${id}/refund`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to refund ticket")
      return res.json()
    }
  },
}

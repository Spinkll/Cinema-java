"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
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
import { type Movie } from "@/lib/data"
import { api } from "@/lib/api"
import { Plus, Pencil, Trash2, Film, Clock, Search, Star, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const ratingColors: Record<string, string> = {
  '0+': 'bg-success/20 text-success border-success/30',
  '6+': 'bg-success/20 text-success border-success/30',
  '12+': 'bg-warning/20 text-warning border-warning/30',
  '16+': 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  '18+': 'bg-destructive/20 text-destructive border-destructive/30',
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [externalSearchQuery, setExternalSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchingExternal, setIsSearchingExternal] = useState(false)
  const [isImporting, setIsImporting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    api.movies.list().then(data => {
      setMovies(data)
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])
  
  const [formData, setFormData] = useState({
    title: '',
    durationMinutes: '',
    genre: '',
    ageRating: '12+',
    description: '',
    director: '',
    rating: '',
    posterUrl: '',
  })

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateDialog = () => {
    setEditingMovie(null)
    setFormData({
      title: '',
      durationMinutes: '',
      genre: '',
      ageRating: '12+',
      description: '',
      director: '',
      rating: '',
      posterUrl: '/placeholder.svg?height=300&width=200',
    })
    setExternalSearchQuery('')
    setSearchResults([])
    setIsDialogOpen(true)
  }

  const openEditDialog = (movie: Movie) => {
    setEditingMovie(movie)
    setFormData({
      title: movie.title,
      durationMinutes: movie.durationMinutes.toString(),
      genre: movie.genre,
      ageRating: movie.ageRating,
      description: movie.description || '',
      director: movie.director || '',
      rating: movie.rating ? movie.rating.toString() : '',
      posterUrl: movie.posterUrl || '',
    })
    setIsDialogOpen(true)
  }

  const handleExternalSearch = async () => {
    if (!externalSearchQuery.trim()) return
    setIsSearchingExternal(true)
    try {
      const results = await api.movies.externalSearch(externalSearchQuery)
      setSearchResults(results || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearchingExternal(false)
    }
  }

  const handleImport = async (imdbId: string) => {
    try {
      setIsImporting(imdbId)
      const imported = await api.movies.import(imdbId)
      setMovies([...movies, imported])
      setIsDialogOpen(false)
      toast({
        title: "Успіх!",
        description: "Фільм успішно імпортовано з OMDb."
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Помилка",
        description: "Не вдалося імпортувати фільм. Спробуйте ще раз.",
        variant: "destructive"
      })
    } finally {
      setIsImporting(null)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingMovie) {
        const updated = await api.movies.update(editingMovie.id, {
          title: formData.title,
          description: formData.description,
          director: formData.director,
          rating: formData.rating ? parseFloat(formData.rating) : undefined,
          durationMinutes: parseInt(formData.durationMinutes),
          genre: formData.genre,
          ageRating: formData.ageRating,
          posterUrl: formData.posterUrl,
        })
        setMovies(movies.map(m => m.id === editingMovie.id ? updated : m))
        setIsDialogOpen(false)
        toast({
          title: "Оновлено",
          description: "Дані фільму успішно оновлено."
        })
      } else {

        const created = await api.movies.create({
          title: formData.title,
          description: formData.description,
          director: formData.director,
          rating: formData.rating ? parseFloat(formData.rating) : undefined,
          durationMinutes: parseInt(formData.durationMinutes) || 0,
          genre: formData.genre,
          ageRating: formData.ageRating,
          posterUrl: formData.posterUrl || '/placeholder.svg?height=300&width=200'
        })
        setMovies([...movies, created])
        setIsDialogOpen(false)
        toast({
          title: "Створено",
          description: "Фільм успішно додано вручну."
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Помилка",
        description: "Сталася помилка при збереженні фільму.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей фільм?')) return
    try {
      await api.movies.delete(id)
      setMovies(movies.filter(m => m.id !== id))
      toast({
        title: "Видалено",
        description: "Фільм було видалено з каталогу."
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Помилка",
        description: "Не вдалося видалити фільм.",
        variant: "destructive"
      })
    }
  }

  return (
    <AdminLayout 
      title="Керування фільмами" 
      description="Каталог фільмів кінотеатру"
    >

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук за назвою або жанром..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-0"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Додати фільм
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                {editingMovie ? 'Редагувати фільм' : 'Додати новий фільм'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingMovie ? 'Змініть дані фільму та збережіть зміни.' : 'Введіть назву фільму для пошуку в TMDB та автозаповнення.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {!editingMovie && (
                <div className="space-y-4 border-b border-border pb-6">
                  <div className="space-y-2">
                    <Label htmlFor="externalSearch">Пошук в TMDB (за назвою)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="externalSearch"
                        value={externalSearchQuery}
                        onChange={(e) => setExternalSearchQuery(e.target.value)}
                        placeholder="Назва фільму (напр. Аватар)"
                        className="bg-input"
                        onKeyDown={(e) => e.key === 'Enter' && handleExternalSearch()}
                      />
                      <Button onClick={handleExternalSearch} disabled={isSearchingExternal}>
                        {isSearchingExternal ? '...' : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {searchResults.map((result: any) => {
                        const resultId = result.id || result.imdbID;
                        const resultTitle = result.title || result.Title;
                        const posterRaw = result.posterUrl || result.poster_path || result.Poster;
                        let posterSrc = '/placeholder.svg?height=60&width=40';
                        if (posterRaw && posterRaw !== 'N/A') {
                          posterSrc = posterRaw.startsWith('/') 
                            ? `https://image.tmdb.org/t/p/w200${posterRaw}` 
                            : posterRaw;
                        }
                        const resultYear = result.release_date ? new Date(result.release_date).getFullYear() : (result.Year || '');
                        const resultType = result.media_type || result.Type || 'фільм';

                        return (
                          <div 
                            key={resultId}
                            className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer border border-border/50"
                            onClick={() => handleImport(resultId.toString())}
                          >
                            <img 
                              src={posterSrc} 
                              alt={resultTitle} 
                              className="w-10 h-14 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-card-foreground truncate">{resultTitle}</p>
                              <p className="text-xs text-muted-foreground">{resultYear} • {resultType}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              disabled={isImporting === resultId?.toString()}
                            >
                              {isImporting === resultId?.toString() ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                'Імпорт'
                              )}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">або заповніть вручну</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Назва фільму</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Наприклад: Дюна: Частина друга"
                  className="bg-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Тривалість (хв)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    placeholder="120"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Жанр</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Фантастика"
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Опис фільму</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Короткий опис сюжету..."
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="director">Режисер</Label>
                  <Input
                    id="director"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    placeholder="Напр. Джеймс Кемерон"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Рейтинг (0-10)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="8.5"
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="posterUrl">URL Постера</Label>
                <Input
                  id="posterUrl"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  placeholder="https://example.com/poster.jpg"
                  className="bg-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Віковий рейтинг</Label>
                <div className="flex flex-wrap gap-2">
                  {['0+', '6+', '12+', '16+', '18+'].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant={formData.ageRating === rating ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, ageRating: rating })}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleSubmit}>
                {editingMovie ? 'Зберегти' : 'Створити вручну'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMovies.map((movie) => (
          <Card key={movie.id} className="bg-card border-border group overflow-hidden hover:border-primary/50 transition-colors">
            <div className="aspect-[2/3] relative bg-secondary">
              <img
                src={movie.posterUrl || '/placeholder.svg?height=300&width=200'}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Badge variant="outline" className={ratingColors[movie.ageRating] || ratingColors['12+']}>
                  {movie.ageRating}
                </Badge>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => openEditDialog(movie)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(movie.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1">{movie.title}</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  <span className="truncate max-w-[120px]">{movie.genre.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{movie.durationMinutes} хв</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground h-5">
                {movie.director ? (
                  <span className="truncate max-w-[120px] text-xs" title={movie.director}>Реж. {movie.director}</span>
                ) : <span className="w-1"></span>}
                {movie.rating ? (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-medium text-foreground text-xs">{movie.rating.toFixed(1)}</span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Завантаження...</div>
      ) : filteredMovies.length === 0 ? (
        <div className="py-12 text-center">
          <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Фільми не знайдено</p>
        </div>
      ) : null}
    </AdminLayout>
  )
}

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
import { type Hall } from "@/lib/data"
import { api } from "@/lib/api"
import { Plus, Pencil, Trash2, Building2, Users, LayoutGrid } from "lucide-react"

const typeLabels: Record<string, string> = {
  standard: 'Стандарт',
  vip: 'VIP',
  imax: 'IMAX',
}

const typeColors: Record<string, string> = {
  standard: 'bg-secondary text-secondary-foreground',
  vip: 'bg-warning/20 text-warning border-warning/30',
  imax: 'bg-primary/20 text-primary border-primary/30',
}

const statusLabels: Record<string, string> = {
  active: 'Активний',
  maintenance: 'Обслуговування',
}

const statusColors: Record<string, string> = {
  active: 'bg-success/20 text-success border-success/30',
  maintenance: 'bg-warning/20 text-warning border-warning/30',
}

export default function HallsPage() {
  const [halls, setHalls] = useState<Hall[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.halls.list().then(data => {
      setHalls(data)
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHall, setEditingHall] = useState<Hall | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    rowCount: '',
    seatsPerRow: '',
    type: 'standard' as Hall['type'],
    status: 'active' as Hall['status'],
  })

  const openCreateDialog = () => {
    setEditingHall(null)
    setFormData({
      name: '',
      rowCount: '',
      seatsPerRow: '',
      type: 'standard',
      status: 'active',
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (hall: Hall) => {
    setEditingHall(hall)
    setFormData({
      name: hall.name,
      rowCount: hall.rowCount.toString(),
      seatsPerRow: hall.seatsPerRow.toString(),
      type: (hall.type || 'standard').toLowerCase() as any,
      status: (hall.status || 'active').toLowerCase() as any,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    const rowCount = parseInt(formData.rowCount)
    const seatsPerRow = parseInt(formData.seatsPerRow)
    const totalSeats = rowCount * seatsPerRow
    
    
    const backendData = {
      name: formData.name,
      rowCount,
      seatsPerRow,
      totalSeats,
      type: formData.type.toUpperCase() as any,
      status: formData.status.toUpperCase() as any,
    }

    try {
      if (editingHall) {
        const updated = await api.halls.update(editingHall.id, backendData)
        setHalls(halls.map(h => h.id === editingHall.id ? updated : h))
      } else {
        const created = await api.halls.create(backendData)
        setHalls([...halls, created])
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.halls.delete(id)
      setHalls(halls.filter(h => h.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AdminLayout 
      title="Керування залами" 
      description="Налаштування кінозалів та їх параметрів"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            Всього залів: {halls.length}
          </Badge>
          <Badge variant="outline" className="bg-success/20 text-success border-success/30">
            Активних: {halls.filter(h => (h.status || '').toLowerCase() === 'active').length}
          </Badge>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Додати зал
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                {editingHall ? 'Редагувати зал' : 'Додати новий зал'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingHall ? 'Змініть параметри залу та збережіть зміни.' : 'Заповніть параметри нового кінозалу.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Назва залу</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Наприклад: Зал 1"
                  className="bg-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rowCount">Кількість рядів</Label>
                  <Input
                    id="rowCount"
                    type="number"
                    value={formData.rowCount}
                    onChange={(e) => setFormData({ ...formData, rowCount: e.target.value })}
                    placeholder="10"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seatsPerRow">Місць у ряду</Label>
                  <Input
                    id="seatsPerRow"
                    type="number"
                    value={formData.seatsPerRow}
                    onChange={(e) => setFormData({ ...formData, seatsPerRow: e.target.value })}
                    placeholder="15"
                    className="bg-input"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип залу</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: Hall['type']) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Стандарт</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="imax">IMAX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: Hall['status']) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активний</SelectItem>
                      <SelectItem value="maintenance">Обслуговування</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {formData.rowCount && formData.seatsPerRow && (
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Загальна кількість місць: <span className="text-foreground font-medium">{parseInt(formData.rowCount) * parseInt(formData.seatsPerRow)}</span>
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleSubmit}>
                {editingHall ? 'Зберегти' : 'Додати'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Завантаження...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {halls.map((hall) => (
          <Card key={hall.id} className="bg-card border-border group hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-card-foreground text-lg">{hall.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={typeColors[(hall.type || 'standard').toLowerCase()] || typeColors.standard}>
                      {typeLabels[(hall.type || 'standard').toLowerCase()] || hall.type}
                    </Badge>
                    <Badge variant="outline" className={statusColors[(hall.status || 'active').toLowerCase()] || statusColors.active}>
                      {statusLabels[(hall.status || 'active').toLowerCase()] || hall.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Рядів</span>
                  </div>
                  <span className="text-card-foreground font-medium">{hall.rowCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Місць у ряду</span>
                  </div>
                  <span className="text-card-foreground font-medium">{hall.seatsPerRow}</span>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Всього місць: </span>
                    <span className="text-card-foreground font-bold text-lg">
                      {hall.totalSeats || (hall.rowCount * hall.seatsPerRow)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(hall)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(hall.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </AdminLayout>
  )
}

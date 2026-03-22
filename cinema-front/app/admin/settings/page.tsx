"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Bell, Shield, Palette, Save } from "lucide-react"

export default function SettingsPage() {
  const [cinemaName, setCinemaName] = useState('Кінотеатр "Прем’єра"')
  const [address, setAddress] = useState('м. Київ, вул. Хрещатик, 1')
  const [phone, setPhone] = useState('+380 (44) 123-45-67')
  const [email, setEmail] = useState('info@premera-cinema.ua')
  
  const [notifications, setNotifications] = useState({
    newTickets: true,
    lowOccupancy: true,
    dailyReport: true,
    sessionReminders: false,
  })

  return (
    <AdminLayout 
      title="Налаштування" 
      description="Конфігурація системи керування кінотеатром"
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-secondary border-0">
          <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-background">
            <Building2 className="h-4 w-4" />
            Загальні
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background">
            < Bell className="h-4 w-4" />
            Сповіщення
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-background">
            <Shield className="h-4 w-4" />
            Безпека
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-background">
            <Palette className="h-4 w-4" />
            Зовнішній вигляд
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Інформація про кінотеатр</CardTitle>
              <CardDescription>Основні дані вашого кінотеатру</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cinemaName">Назва кінотеатру</Label>
                  <Input
                    id="cinemaName"
                    value={cinemaName}
                    onChange={(e) => setCinemaName(e.target.value)}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Адреса</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Зберегти зміни
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Налаштування сповіщень</CardTitle>
              <CardDescription>Керування оповіщеннями системи</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-card-foreground">Нові продажі квитків</p>
                    <p className="text-sm text-muted-foreground">Отримувати сповіщення про кожну купівлю квитка</p>
                  </div>
                  <Switch 
                    checked={notifications.newTickets}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newTickets: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-card-foreground">Низька заповнюваність</p>
                    <p className="text-sm text-muted-foreground">Сповіщати про сеанси з заповнюваністю менше 30%</p>
                  </div>
                  <Switch 
                    checked={notifications.lowOccupancy}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowOccupancy: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-card-foreground">Щоденний звіт</p>
                    <p className="text-sm text-muted-foreground">Отримувати підсумок продажів щодня</p>
                  </div>
                  <Switch 
                    checked={notifications.dailyReport}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, dailyReport: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-card-foreground">Нагадування про сеанси</p>
                    <p className="text-sm text-muted-foreground">Сповіщати за 30 хвилин до початку сеансу</p>
                  </div>
                  <Switch 
                    checked={notifications.sessionReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, sessionReminders: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Налаштування безпеки</CardTitle>
              <CardDescription>Керування доступом та захистом даних</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Поточний пароль</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className="bg-input"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Новий пароль</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="gap-2">
                  <Shield className="h-4 w-4" />
                  Оновити пароль
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Налаштування зовнішнього вигляду</CardTitle>
              <CardDescription>Персоналізація інтерфейсу</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Кольорова тема</Label>
                  <div className="flex gap-3">
                    <button className="w-12 h-12 rounded-lg bg-background border-2 border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" />
                    <button className="w-12 h-12 rounded-lg bg-white border-2 border-border" />
                    <button className="w-12 h-12 rounded-lg bg-slate-900 border-2 border-border" />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-3 block">Акцентний колір</Label>
                  <div className="flex gap-3">
                    <button className="w-8 h-8 rounded-full bg-primary border-2 border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" />
                    <button className="w-8 h-8 rounded-full bg-chart-2 border-2 border-border" />
                    <button className="w-8 h-8 rounded-full bg-chart-5 border-2 border-border" />
                    <button className="w-8 h-8 rounded-full bg-chart-4 border-2 border-border" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}

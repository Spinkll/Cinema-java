"use client"

import { Sidebar } from "@/components/sidebar"
import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      
      <div className="lg:pl-64">
        
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-8">
          <div className="flex items-center gap-4 pl-12 lg:pl-0">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Пошук..." 
                className="w-64 pl-9 bg-secondary border-0"
              />
            </div>
          </div>
        </header>

        
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

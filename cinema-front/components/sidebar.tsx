"use client"

import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Film, 
  Ticket, 
  Building2,
  Calendar,
  LogOut,
  Menu,
  X,
  ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: 'Панель', href: '/admin', icon: LayoutDashboard },
  { name: 'Сеанси', href: '/admin/sessions', icon: Calendar },
  { name: 'Квитки', href: '/admin/tickets', icon: Ticket },
  { name: 'Зали', href: '/admin/halls', icon: Building2 },
  { name: 'Фільми', href: '/admin/movies', icon: Film },
]


const visitorLink = { name: 'На сайт', href: '/', icon: ShoppingCart }

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Film className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">КіноАдмін</span>
        </div>

        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        
        <div className="px-3 pb-2">
          <Link
            href={visitorLink.href}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <visitorLink.icon className="h-5 w-5" />
            {visitorLink.name}
          </Link>
        </div>

        
        <div className="border-t border-sidebar-border px-3 py-4">
          <Link href="/">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
              <LogOut className="h-5 w-5" />
              Вийти
            </button>
          </Link>
        </div>
      </aside>
    </>
  )
}

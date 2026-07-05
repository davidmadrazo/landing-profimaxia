'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, MessageSquare, BarChart3, Settings } from 'lucide-react'
import { signout } from '@/actions/auth'
import type { User } from '@supabase/supabase-js'

interface AdminNavProps {
  user: User
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/conversations', label: 'Conversaciones', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ProfimaxIA OS" width={28} height={28} className="rounded-md" />
            <span className="text-sm font-semibold text-white">Admin</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isActive(href, exact)
                    ? 'text-white bg-[var(--surface-elevated)]'
                    : 'text-[var(--muted)] hover:text-white hover:bg-[var(--surface-elevated)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted)] hidden sm:inline">
            {user.email}
          </span>
          <form action={signout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}

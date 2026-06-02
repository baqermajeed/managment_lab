import { NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, LayoutGrid, Users } from 'lucide-react'
import { LAB_NAME, LAB_SUBTITLE } from '../constants'

const navItems = [
  { to: '/', label: 'إدخال الحالات', icon: ClipboardList },
  { to: '/reports', label: 'الجدول اليومي', icon: LayoutGrid },
  { to: '/team', label: 'المصممين و Build Up', icon: Users },
]

export function Layout() {
  return (
    <div className="app-bg min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0f1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20">
              <svg
                className="h-6 w-6 text-teal-950"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {LAB_NAME}
              </h1>
              <p className="text-xs text-slate-400 sm:text-sm">{LAB_SUBTITLE}</p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto rounded-xl bg-slate-900/50 p-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4 ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 shadow-sm'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        {LAB_NAME} — جميع البيانات محفوظة محلياً على جهازك
      </footer>
    </div>
  )
}

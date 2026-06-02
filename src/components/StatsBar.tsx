import { FileStack, Layers } from 'lucide-react'
import type { CaseStats } from '../types'

interface StatsBarProps {
  stats: CaseStats
  label?: string
}

export function StatsBar({ stats, label }: StatsBarProps) {
  return (
    <div className="animate-fade-in grid gap-4 sm:grid-cols-2">
      {label && (
        <p className="col-span-full text-sm text-slate-400">{label}</p>
      )}
      <div className="glass-card flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10">
          <FileStack className="h-6 w-6 text-teal-400" />
        </div>
        <div>
          <p className="text-sm text-slate-400">عدد الحالات</p>
          <p className="text-3xl font-bold tabular-nums text-white">
            {stats.caseCount}
          </p>
        </div>
      </div>
      <div className="glass-card flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
          <Layers className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <p className="text-sm text-slate-400">عدد الوحدات</p>
          <p className="text-3xl font-bold tabular-nums text-white">
            {stats.unitCount}
          </p>
        </div>
      </div>
    </div>
  )
}

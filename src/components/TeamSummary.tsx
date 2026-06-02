import { useMemo } from 'react'
import type { BuildUp, Designer, LabCase } from '../types'
import { computeStats } from '../utils/filters'

interface TeamSummaryProps {
  cases: LabCase[]
  names: readonly (Designer | BuildUp)[]
  selected: string
  onSelect: (name: string) => void
  field: 'designer' | 'buildUp'
  accent?: 'teal' | 'amber'
}

export function TeamSummary({
  cases,
  names,
  selected,
  onSelect,
  field,
  accent = 'teal',
}: TeamSummaryProps) {
  const rows = useMemo(
    () =>
      names.map((name) => {
        const subset = cases.filter((c) => c[field] === name)
        return { name, ...computeStats(subset) }
      }),
    [cases, names, field],
  )

  const ring =
    accent === 'teal'
      ? 'ring-teal-500/40 bg-teal-500/15'
      : 'ring-amber-500/40 bg-amber-500/15'

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map(({ name, caseCount, unitCount }) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className={`glass-card animate-fade-in p-4 text-right transition-all hover:scale-[1.02] ${
            selected === name ? `ring-2 ${ring}` : ''
          }`}
        >
          <p className="font-semibold text-white">{name}</p>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-slate-400">
              حالات:{' '}
              <span className="font-medium text-teal-300">{caseCount}</span>
            </span>
            <span className="text-slate-400">
              وحدات:{' '}
              <span className="font-medium text-amber-300">{unitCount}</span>
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

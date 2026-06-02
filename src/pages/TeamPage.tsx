import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { BUILD_UPS, DESIGNERS } from '../constants'
import { CasesTable } from '../components/CasesTable'
import { DateFilterPanel } from '../components/DateFilterPanel'
import { StatsBar } from '../components/StatsBar'
import { TeamSummary } from '../components/TeamSummary'
import { useCasesContext } from '../context/CasesContext'
import type { BuildUp, DateFilterState, Designer } from '../types'
import {
  computeStats,
  defaultDateFilter,
  filterByDateFilter,
} from '../utils/filters'
import { exportCasesToExcel } from '../utils/excel'

type TeamMode = 'designer' | 'buildUp'

export function TeamPage() {
  const { cases } = useCasesContext()
  const [mode, setMode] = useState<TeamMode>('designer')
  const [selectedDesigner, setSelectedDesigner] = useState<Designer>(DESIGNERS[0])
  const [selectedBuildUp, setSelectedBuildUp] = useState<BuildUp>(BUILD_UPS[0])
  const [filter, setFilter] = useState<DateFilterState>(defaultDateFilter)

  const dateFiltered = useMemo(
    () => filterByDateFilter(cases, filter),
    [cases, filter],
  )

  const personCases = useMemo(() => {
    const list =
      mode === 'designer'
        ? dateFiltered.filter((c) => c.designer === selectedDesigner)
        : dateFiltered.filter((c) => c.buildUp === selectedBuildUp)

    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [dateFiltered, mode, selectedDesigner, selectedBuildUp])

  const stats = useMemo(() => computeStats(personCases), [personCases])

  const personName = mode === 'designer' ? selectedDesigner : selectedBuildUp
  const personLabel = mode === 'designer' ? 'المصمم' : 'Build Up'
  const teamTitle = mode === 'designer' ? 'تقرير حسب المصمم' : 'تقرير حسب Build Up'

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">تقارير الفريق</h2>
            <p className="mt-1 text-slate-400">
              حالات كل مصمم أو Build Up مع الإحصائيات
            </p>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              exportCasesToExcel({
                cases: personCases,
                stats,
                context: {
                  kind: 'team',
                  title: teamTitle,
                  filterLabel: `ضمن ${filter.mode === 'daily' ? filter.date : filter.mode === 'monthly' ? filter.month : `${filter.startDate} إلى ${filter.endDate}`}`,
                  personLabel,
                  personName,
                },
              })
            }
          >
            <Download className="h-4 w-4" />
            تصدير Excel
          </button>
        </div>
      </div>

      <div className="glass-card animate-fade-in p-5">
        <p className="mb-4 text-sm font-medium text-slate-300">نوع التقرير</p>
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('designer')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              mode === 'designer'
                ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            حسب المصمم
          </button>
          <button
            type="button"
            onClick={() => setMode('buildUp')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              mode === 'buildUp'
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            حسب Build Up
          </button>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-400">
            اختر {personLabel}
          </span>
          <select
            className="input-field max-w-sm"
            value={mode === 'designer' ? selectedDesigner : selectedBuildUp}
            onChange={(e) => {
              if (mode === 'designer') {
                setSelectedDesigner(e.target.value as Designer)
              } else {
                setSelectedBuildUp(e.target.value as BuildUp)
              }
            }}
          >
            {(mode === 'designer' ? DESIGNERS : BUILD_UPS).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DateFilterPanel filter={filter} onChange={setFilter} />

      <div>
        <p className="mb-3 text-sm text-slate-400">ملخص سريع — اضغط للتفاصيل</p>
        <TeamSummary
          cases={dateFiltered}
          names={mode === 'designer' ? DESIGNERS : BUILD_UPS}
          field={mode === 'designer' ? 'designer' : 'buildUp'}
          selected={personName}
          onSelect={(name) => {
            if (mode === 'designer') setSelectedDesigner(name as Designer)
            else setSelectedBuildUp(name as BuildUp)
          }}
          accent={mode === 'designer' ? 'teal' : 'amber'}
        />
      </div>

      <StatsBar
        stats={stats}
        label={`إحصائيات ${personLabel}: ${personName}`}
      />

      <CasesTable
        cases={personCases}
        showDate
        emptyMessage={`لا توجد حالات لـ ${personName} في الفترة المحددة`}
      />
    </div>
  )
}

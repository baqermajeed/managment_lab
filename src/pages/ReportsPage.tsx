import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { DateFilterPanel } from '../components/DateFilterPanel'
import { CasesTable } from '../components/CasesTable'
import { StatsBar } from '../components/StatsBar'
import { useCasesContext } from '../context/CasesContext'
import type { DateFilterState } from '../types'
import {
  computeStats,
  defaultDateFilter,
  filterByDateFilter,
} from '../utils/filters'
import { exportCasesToExcel } from '../utils/excel'

function filterLabel(filter: DateFilterState): string {
  if (filter.mode === 'daily') return `إحصائيات يوم ${filter.date}`
  if (filter.mode === 'monthly') return `إحصائيات شهر ${filter.month}`
  return `إحصائيات من ${filter.startDate} إلى ${filter.endDate}`
}

export function ReportsPage() {
  const { cases, deleteCase } = useCasesContext()
  const [filter, setFilter] = useState<DateFilterState>(defaultDateFilter)

  const filtered = useMemo(
    () =>
      filterByDateFilter(cases, filter).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [cases, filter],
  )

  const stats = useMemo(() => computeStats(filtered), [filtered])

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">الجدول اليومي والتقارير</h2>
            <p className="mt-1 text-slate-400">
              عرض الحالات حسب اليوم أو الشهر أو فترة محددة
            </p>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              exportCasesToExcel({
                cases: filtered,
                stats,
                context: {
                  kind: 'reports',
                  title: 'تقرير الحالات',
                  filterLabel: filterLabel(filter),
                },
              })
            }
          >
            <Download className="h-4 w-4" />
            تصدير Excel
          </button>
        </div>
      </div>

      <DateFilterPanel filter={filter} onChange={setFilter} />

      <StatsBar stats={stats} label={filterLabel(filter)} />

      <CasesTable
        cases={filtered}
        onDelete={deleteCase}
        emptyMessage="لا توجد حالات في الفترة المحددة"
      />
    </div>
  )
}

import type { DateFilterState, FilterMode } from '../types'

interface DateFilterPanelProps {
  filter: DateFilterState
  onChange: (filter: DateFilterState) => void
}

const modes: { value: FilterMode; label: string }[] = [
  { value: 'daily', label: 'يومي' },
  { value: 'monthly', label: 'شهري' },
  { value: 'range', label: 'فترة محددة' },
]

export function DateFilterPanel({ filter, onChange }: DateFilterPanelProps) {
  const setMode = (mode: FilterMode) => onChange({ ...filter, mode })

  return (
    <div className="glass-card animate-fade-in p-5">
      <p className="mb-4 text-sm font-medium text-slate-300">تصفية حسب التاريخ</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {modes.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filter.mode === value
                ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {filter.mode === 'daily' && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-400">اختر اليوم</span>
            <input
              type="date"
              className="input-field max-w-xs"
              value={filter.date}
              onChange={(e) => onChange({ ...filter, date: e.target.value })}
            />
          </label>
        )}

        {filter.mode === 'monthly' && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-400">اختر الشهر</span>
            <input
              type="month"
              className="input-field max-w-xs"
              value={filter.month}
              onChange={(e) => onChange({ ...filter, month: e.target.value })}
            />
          </label>
        )}

        {filter.mode === 'range' && (
          <>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-slate-400">من تاريخ</span>
              <input
                type="date"
                className="input-field max-w-xs"
                value={filter.startDate}
                onChange={(e) =>
                  onChange({ ...filter, startDate: e.target.value })
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-slate-400">إلى تاريخ</span>
              <input
                type="date"
                className="input-field max-w-xs"
                value={filter.endDate}
                min={filter.startDate}
                onChange={(e) =>
                  onChange({ ...filter, endDate: e.target.value })
                }
              />
            </label>
          </>
        )}
      </div>
    </div>
  )
}

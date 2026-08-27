import { Pencil, Trash2 } from 'lucide-react'
import type { LabCase } from '../types'
import { formatCaseDate } from '../utils/filters'

interface CasesTableProps {
  cases: LabCase[]
  onDelete?: (id: string) => void
  onEdit?: (item: LabCase) => void
  showDate?: boolean
  emptyMessage?: string
}

function workTypeChip(type: LabCase['workType']) {
  const map = {
    Zercon: 'chip chip-zercon',
    Ceramic: 'chip chip-ceramic',
    'E-max': 'chip chip-emax',
  }
  return <span className={map[type]}>{type}</span>
}

export function CasesTable({
  cases,
  onDelete,
  onEdit,
  showDate = true,
  emptyMessage = 'لا توجد حالات في هذه الفترة',
}: CasesTableProps) {
  if (cases.length === 0) {
    return (
      <div className="glass-card animate-fade-in p-12 text-center">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="grid gap-3 sm:hidden">
        {cases.map((c, i) => (
          <div key={c.id} className="glass-card animate-fade-in p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">#{i + 1}</span>
                  {workTypeChip(c.workType)}
                  <span className="text-xs text-amber-300/90 font-semibold">
                    {c.units} وحدات
                  </span>
                </div>
                <p className="mt-2 truncate text-base font-bold text-white">
                  {c.patientName}
                </p>
                <p className="mt-0.5 truncate text-sm text-slate-400">
                  الطبيب: <span className="text-slate-200">{c.doctorName}</span>
                </p>
              </div>

              {(onEdit || onDelete) && (
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(c)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-teal-500/10 hover:text-teal-300"
                      title="تعديل"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                <p className="text-xs text-slate-500">المصمم</p>
                <p className="mt-0.5 font-medium text-slate-200 truncate">
                  {c.designer}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                <p className="text-xs text-slate-500">Build Up</p>
                <p className="mt-0.5 font-medium text-slate-200 truncate">
                  {c.buildUp}
                </p>
              </div>
              {showDate && (
                <div className="col-span-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                  <p className="text-xs text-slate-500">التاريخ</p>
                  <p className="mt-0.5 text-xs text-slate-300 whitespace-nowrap">
                    {formatCaseDate(c.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="glass-card animate-fade-in overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {showDate && <th>التاريخ</th>}
                <th>الطبيب</th>
                <th>المريض</th>
                <th>نوع العمل</th>
                <th>الوحدات</th>
                <th>المصمم</th>
                <th>Build Up</th>
                {(onEdit || onDelete) && <th>إجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr key={c.id}>
                  <td className="text-slate-500">{i + 1}</td>
                  {showDate && (
                    <td className="whitespace-nowrap text-slate-400 text-xs">
                      {formatCaseDate(c.createdAt)}
                    </td>
                  )}
                  <td className="font-medium">{c.doctorName}</td>
                  <td>{c.patientName}</td>
                  <td>{workTypeChip(c.workType)}</td>
                  <td>
                    <span className="font-semibold text-amber-300/90">
                      {c.units}
                    </span>
                  </td>
                  <td>{c.designer}</td>
                  <td>{c.buildUp}</td>
                  {(onEdit || onDelete) && (
                    <td>
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(c)}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-teal-500/10 hover:text-teal-300"
                            title="تعديل"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(c.id)}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

import { useMemo, useState } from 'react'
import { CheckCircle2, Plus } from 'lucide-react'
import { BUILD_UPS, DESIGNERS, WORK_TYPES } from '../constants'
import { CasesTable } from '../components/CasesTable'
import { StatsBar } from '../components/StatsBar'
import { useCasesContext } from '../context/CasesContext'
import type { BuildUp, Designer, WorkType } from '../types'
import { computeStats } from '../utils/filters'

const emptyForm = {
  doctorName: '',
  patientName: '',
  workType: '' as WorkType | '',
  units: '',
  designer: '' as Designer | '',
  buildUp: '' as BuildUp | '',
}

export function EntryPage() {
  const { addCase, cases, deleteCase, error: apiError, loading } = useCasesContext()
  const [form, setForm] = useState(emptyForm)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const latestCases = useMemo(() => cases.slice(0, 25), [cases])
  const stats = useMemo(() => computeStats(latestCases), [latestCases])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (
      !form.doctorName.trim() ||
      !form.patientName.trim() ||
      !form.workType ||
      !form.designer ||
      !form.buildUp
    ) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }

    const units = parseInt(form.units, 10)
    if (!units || units < 1) {
      setError('عدد الوحدات يجب أن يكون رقماً أكبر من صفر')
      return
    }

    addCase({
      doctorName: form.doctorName.trim(),
      patientName: form.patientName.trim(),
      workType: form.workType,
      units,
      designer: form.designer,
      buildUp: form.buildUp,
    })

    setForm(emptyForm)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const field = (
    label: string,
    children: React.ReactNode,
    required = true,
  ) => (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-teal-400"> *</span>}
      </span>
      {children}
    </label>
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-white">إدخال حالة جديدة</h2>
        <p className="mt-1 text-slate-400">
          أدخل بيانات الحالة وسيتم حفظها تلقائياً
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-teal-300 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>تم حفظ الحالة بنجاح</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 animate-fade-in">
          {error}
        </div>
      )}

      {apiError && !error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 animate-fade-in">
          تعذر الاتصال بقاعدة البيانات. تأكد من تشغيل السيرفر و MongoDB.
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card animate-fade-in space-y-5 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {field(
            'اسم الطبيب',
            <input
              type="text"
              className="input-field"
              placeholder="مثال: د. أحمد"
              value={form.doctorName}
              onChange={(e) =>
                setForm((f) => ({ ...f, doctorName: e.target.value }))
              }
            />,
          )}

          {field(
            'اسم المريض',
            <input
              type="text"
              className="input-field"
              placeholder="اسم المريض"
              value={form.patientName}
              onChange={(e) =>
                setForm((f) => ({ ...f, patientName: e.target.value }))
              }
            />,
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {field(
            'نوع العمل',
            <select
              className="input-field"
              value={form.workType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  workType: e.target.value as WorkType,
                }))
              }
            >
              <option value="">— اختر نوع العمل —</option>
              {WORK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>,
          )}

          {field(
            'عدد الوحدات',
            <input
              type="number"
              min={1}
              className="input-field"
              placeholder="1"
              value={form.units}
              onChange={(e) =>
                setForm((f) => ({ ...f, units: e.target.value }))
              }
            />,
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {field(
            'اسم المصمم',
            <select
              className="input-field"
              value={form.designer}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  designer: e.target.value as Designer,
                }))
              }
            >
              <option value="">— اختر المصمم —</option>
              {DESIGNERS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>,
          )}

          {field(
            'اسم Build Up',
            <select
              className="input-field"
              value={form.buildUp}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  buildUp: e.target.value as BuildUp,
                }))
              }
            >
              <option value="">— اختر Build Up —</option>
              {BUILD_UPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>,
          )}
        </div>

        <div className="pt-2">
          <button type="submit" className="btn-primary w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            إضافة الحالة
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="animate-fade-in">
          <h3 className="text-lg font-bold text-white">آخر الحالات المدخلة</h3>
          <p className="mt-1 text-sm text-slate-400">
            عرض سريع لآخر 25 حالة (مع إمكانية الحذف)
          </p>
        </div>

        {loading && (
          <div className="glass-card animate-fade-in p-6 text-sm text-slate-400">
            جاري تحميل البيانات...
          </div>
        )}

        <StatsBar stats={stats} label="إحصائية آخر الحالات" />

        <CasesTable
          cases={latestCases}
          onDelete={deleteCase}
          emptyMessage="لا توجد حالات بعد — ابدأ بإضافة أول حالة من الأعلى"
        />
      </div>
    </div>
  )
}

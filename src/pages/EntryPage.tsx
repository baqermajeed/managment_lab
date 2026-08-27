import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Plus, Search, X } from 'lucide-react'
import { WORK_TYPES } from '../constants'
import { CasesTable } from '../components/CasesTable'
import { RemovableSelect } from '../components/RemovableSelect'
import { StatsBar } from '../components/StatsBar'
import { useCasesContext } from '../context/CasesContext'
import { useTeamOptions } from '../hooks/useTeamOptions'
import type { BuildUp, Designer, LabCase, WorkType } from '../types'
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
  const { addCase, cases, deleteCase, error: apiError, loading, searchCases } =
    useCasesContext()
  const {
    designers,
    buildUps,
    hideOption,
    error: teamError,
  } = useTeamOptions()
  const [form, setForm] = useState(emptyForm)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LabCase[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const latestCases = useMemo(() => cases.slice(0, 25), [cases])
  const displayedCases = searchResults ?? latestCases
  const stats = useMemo(() => computeStats(displayedCases), [displayedCases])
  const isSearching = query.trim().length > 0

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setSearchResults(null)
      setSearchError('')
      setSearching(false)
      return
    }

    const timer = window.setTimeout(() => {
      setSearching(true)
      setSearchError('')
      void searchCases(q)
        .then((results) => {
          setSearchResults(results)
        })
        .catch(() => {
          setSearchResults([])
          setSearchError('تعذر البحث في قاعدة البيانات')
        })
        .finally(() => setSearching(false))
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query, searchCases])

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

      {(apiError || teamError) && !error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 animate-fade-in">
          {teamError ||
            'تعذر الاتصال بقاعدة البيانات. تأكد من تشغيل السيرفر و MongoDB.'}
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
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-300">
              اسم المصمم
              <span className="text-teal-400"> *</span>
            </span>
            <RemovableSelect
              value={form.designer}
              options={designers}
              placeholder="— اختر المصمم —"
              onChange={(designer) =>
                setForm((f) => ({ ...f, designer: designer as Designer }))
              }
              onRemove={(name) => {
                void hideOption('designer', name)
                setForm((f) =>
                  f.designer === name ? { ...f, designer: '' } : f,
                )
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-300">
              اسم Build Up
              <span className="text-teal-400"> *</span>
            </span>
            <RemovableSelect
              value={form.buildUp}
              options={buildUps}
              placeholder="— اختر Build Up —"
              onChange={(buildUp) =>
                setForm((f) => ({ ...f, buildUp: buildUp as BuildUp }))
              }
              onRemove={(name) => {
                void hideOption('buildUp', name)
                setForm((f) =>
                  f.buildUp === name ? { ...f, buildUp: '' } : f,
                )
              }}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          أيقونة الحذف تخفي الاسم من قائمة الإضافة فقط، والحالات السابقة تبقى كما هي.
        </p>

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
            ابحث في قاعدة البيانات مباشرة حسب الطبيب أو المريض أو نوع العمل
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            className="input-field pr-10 pl-10"
            placeholder="بحث في الحالات من قاعدة البيانات..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:text-slate-200"
              onClick={() => setQuery('')}
              title="مسح البحث"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {(loading || searching) && (
          <div className="glass-card animate-fade-in p-6 text-sm text-slate-400">
            {searching ? 'جاري البحث في قاعدة البيانات...' : 'جاري تحميل البيانات...'}
          </div>
        )}

        {searchError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {searchError}
          </div>
        )}

        <StatsBar
          stats={stats}
          label={isSearching ? 'نتائج البحث' : 'إحصائية آخر الحالات'}
        />

        <CasesTable
          cases={displayedCases}
          onDelete={(id) => {
            deleteCase(id)
            setSearchResults((prev) =>
              prev ? prev.filter((c) => c.id !== id) : prev,
            )
          }}
          emptyMessage={
            isSearching
              ? 'لا توجد حالات مطابقة لبحثك في قاعدة البيانات'
              : 'لا توجد حالات بعد — ابدأ بإضافة أول حالة من الأعلى'
          }
        />
      </div>
    </div>
  )
}

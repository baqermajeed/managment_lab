import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'

interface RemovableSelectProps {
  value: string
  options: readonly string[]
  placeholder: string
  onChange: (value: string) => void
  onRemove: (value: string) => void
  onAdd?: () => void
  addLabel?: string
  removeTitle?: string
}

export function RemovableSelect({
  value,
  options,
  placeholder,
  onChange,
  onRemove,
  onAdd,
  addLabel = 'إضافة جديد',
  removeTitle = 'إخفاء من قائمة الإضافة فقط',
}: RemovableSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="input-field flex cursor-pointer items-center justify-between gap-3 text-right"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? 'text-slate-100' : 'text-slate-500'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#111827] shadow-xl">
          {options.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">لا توجد أسماء في القائمة</p>
          ) : (
            <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
              {options.map((option) => (
                <li
                  key={option}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-white/5"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === option}
                    className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-right text-sm ${
                      value === option ? 'text-teal-300' : 'text-slate-200'
                    }`}
                    onClick={() => {
                      onChange(option)
                      setOpen(false)
                    }}
                  >
                    {option}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    title={removeTitle}
                    onClick={(event) => {
                      event.stopPropagation()
                      onRemove(option)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {onAdd && (
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-white/10 px-4 py-3 text-right text-sm font-medium text-teal-300 transition-colors hover:bg-teal-500/10"
              onClick={() => {
                setOpen(false)
                onAdd()
              }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10">+</span>
              <span>{addLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

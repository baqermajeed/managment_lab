import { useCallback, useEffect, useState } from 'react'
import type { LabCase } from '../types'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  // 204 no content
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function useCases() {
  const [cases, setCases] = useState<LabCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const refresh = useCallback(async () => {
    setError('')
    try {
      const data = await api<LabCase[]>('/api/cases')
      setCases(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addCase = useCallback((entry: Omit<LabCase, 'id' | 'createdAt'>) => {
    setError('')

    const optimistic: LabCase = {
      ...entry,
      id: `optimistic-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    }

    setCases((prev) => [optimistic, ...prev])

    void (async () => {
      try {
        const created = await api<LabCase>('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        })

        setCases((prev) => {
          const withoutOptimistic = prev.filter((c) => c.id !== optimistic.id)
          return [created, ...withoutOptimistic]
        })
      } catch (e) {
        setCases((prev) => prev.filter((c) => c.id !== optimistic.id))
        setError(e instanceof Error ? e.message : 'فشل حفظ الحالة')
      }
    })()

    return optimistic
  }, [])

  const searchCases = useCallback(async (query: string) => {
    const q = query.trim()
    if (!q) return []
    return api<LabCase[]>(`/api/cases?q=${encodeURIComponent(q)}`)
  }, [])

  const deleteCase = useCallback((id: string) => {
    setError('')
    setCases((prev) => prev.filter((c) => c.id !== id))

    void (async () => {
      try {
        await api<void>(`/api/cases/${id}`, { method: 'DELETE' })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'فشل حذف الحالة')
        void refresh()
      }
    })()
  }, [])

  return { cases, addCase, deleteCase, searchCases, refresh, loading, error }
}

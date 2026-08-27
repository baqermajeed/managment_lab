import { useCallback, useEffect, useState } from 'react'
import { BUILD_UPS, DESIGNERS } from '../constants'
import type { BuildUp, Designer } from '../types'

type TeamKind = 'designer' | 'buildUp'

interface TeamOptions {
  designers: Designer[]
  buildUps: BuildUp[]
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export function useTeamOptions() {
  const [designers, setDesigners] = useState<Designer[]>(DESIGNERS)
  const [buildUps, setBuildUps] = useState<BuildUp[]>(BUILD_UPS)
  const [error, setError] = useState('')

  const apply = useCallback((data: TeamOptions) => {
    setDesigners(data.designers.length ? data.designers : [])
    setBuildUps(data.buildUps.length ? data.buildUps : [])
  }, [])

  const refresh = useCallback(async () => {
    try {
      const data = await api<TeamOptions>('/api/team-options')
      apply(data)
      setError('')
    } catch {
      setError('تعذر تحميل قائمة المصممين و Build Up')
    }
  }, [apply])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const hideOption = useCallback(
    async (kind: TeamKind, name: string) => {
      const previous = { designers, buildUps }
      if (kind === 'designer') {
        setDesigners((prev) => prev.filter((item) => item !== name))
      } else {
        setBuildUps((prev) => prev.filter((item) => item !== name))
      }

      try {
        const data = await api<TeamOptions>('/api/team-options/hide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, name }),
        })
        apply(data)
        setError('')
      } catch {
        setDesigners(previous.designers)
        setBuildUps(previous.buildUps)
        setError('تعذر إخفاء الاسم من القائمة')
      }
    },
    [apply, designers, buildUps],
  )

  return { designers, buildUps, hideOption, error }
}

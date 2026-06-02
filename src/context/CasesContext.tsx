import { createContext, useContext, type ReactNode } from 'react'
import { useCases } from '../hooks/useCases'
import type { LabCase } from '../types'

type CasesContextValue = ReturnType<typeof useCases>

const CasesContext = createContext<CasesContextValue | null>(null)

export function CasesProvider({ children }: { children: ReactNode }) {
  const value = useCases()
  return (
    <CasesContext.Provider value={value}>{children}</CasesContext.Provider>
  )
}

export function useCasesContext() {
  const ctx = useContext(CasesContext)
  if (!ctx) throw new Error('useCasesContext must be used within CasesProvider')
  return ctx
}

export type { LabCase }

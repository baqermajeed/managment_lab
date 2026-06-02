import {
  endOfDay,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import type { CaseStats, DateFilterState, LabCase } from '../types'

export function computeStats(cases: LabCase[]): CaseStats {
  return {
    caseCount: cases.length,
    unitCount: cases.reduce((sum, c) => sum + c.units, 0),
  }
}

export function filterByDateFilter(
  cases: LabCase[],
  filter: DateFilterState,
): LabCase[] {
  return cases.filter((c) => isCaseInFilter(c, filter))
}

function isCaseInFilter(c: LabCase, filter: DateFilterState): boolean {
  const created = parseISO(c.createdAt)

  if (filter.mode === 'daily') {
    const day = parseISO(filter.date)
    const start = startOfDay(day)
    const end = endOfDay(day)
    return isWithinInterval(created, { start, end })
  }

  if (filter.mode === 'monthly') {
    const [year, month] = filter.month.split('-').map(Number)
    const monthStart = startOfMonth(new Date(year, month - 1, 1))
    const monthEnd = endOfMonth(monthStart)
    return isWithinInterval(created, { start: monthStart, end: monthEnd })
  }

  const start = startOfDay(parseISO(filter.startDate))
  const end = endOfDay(parseISO(filter.endDate))
  return isWithinInterval(created, { start, end })
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function currentMonthISO(): string {
  return format(new Date(), 'yyyy-MM')
}

export function formatCaseDate(iso: string): string {
  return format(parseISO(iso), 'yyyy/MM/dd — HH:mm')
}

export function formatDisplayDate(iso: string): string {
  return format(parseISO(iso), 'yyyy/MM/dd')
}

export function defaultDateFilter(): DateFilterState {
  return {
    mode: 'daily',
    date: todayISO(),
    month: currentMonthISO(),
    startDate: todayISO(),
    endDate: todayISO(),
  }
}

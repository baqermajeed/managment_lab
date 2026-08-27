export type WorkType = 'Zercon' | 'Ceramic' | 'E-max'

export type Designer = string

export type BuildUp = string

export interface LabCase {
  id: string
  doctorName: string
  patientName: string
  workType: WorkType
  units: number
  designer: Designer
  buildUp: BuildUp
  createdAt: string
}

export type FilterMode = 'daily' | 'monthly' | 'range'

export interface DateFilterState {
  mode: FilterMode
  date: string
  month: string
  startDate: string
  endDate: string
}

export interface CaseStats {
  caseCount: number
  unitCount: number
}

import { LAB_NAME } from '../constants'
import type { CaseStats, LabCase } from '../types'
import { formatCaseDate } from './filters'
import ExcelJS from 'exceljs'

type ExportContext =
  | { kind: 'reports'; title: string; filterLabel: string }
  | { kind: 'team'; title: string; filterLabel: string; personLabel: string; personName: string }

function safeFilePart(s: string) {
  return s
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

function getPersonMeta(context: ExportContext) {
  if (context.kind === 'team') {
    return { label: context.personLabel, name: context.personName }
  }
  return null
}

async function downloadXlsx(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function buildStyledWorkbook(params: {
  cases: LabCase[]
  stats: CaseStats
  context: ExportContext
}) {
  const { cases, stats, context } = params

  const workbook = new ExcelJS.Workbook()
  workbook.creator = LAB_NAME
  workbook.created = new Date()

  const ws = workbook.addWorksheet('الحالات', {
    views: [{ rightToLeft: true }],
  })

  // Columns
  ws.columns = [
    { header: '#', key: 'idx', width: 5 },
    { header: 'التاريخ', key: 'date', width: 22 },
    { header: 'اسم الطبيب', key: 'doctor', width: 18 },
    { header: 'اسم المريض', key: 'patient', width: 18 },
    { header: 'نوع العمل', key: 'work', width: 12 },
    { header: 'عدد الوحدات', key: 'units', width: 12 },
    { header: 'المصمم', key: 'designer', width: 14 },
    { header: 'Build Up', key: 'buildup', width: 14 },
  ]

  // Meta block (A:B) - styled
  const metaRows: [string, string | number][] = [
    ['المختبر', LAB_NAME],
    ['التقرير', context.title],
    ['الفلترة', context.filterLabel],
  ]

  const person = getPersonMeta(context)
  if (person) metaRows.push([person.label, person.name])
  metaRows.push(['عدد الحالات', stats.caseCount], ['عدد الوحدات', stats.unitCount])

  const metaStartRow = 1
  metaRows.forEach(([k, v], i) => {
    const r = metaStartRow + i
    const a = ws.getCell(`A${r}`)
    const b = ws.getCell(`B${r}`)
    a.value = k
    b.value = v

    const isCases = k === 'عدد الحالات'
    const isUnits = k === 'عدد الوحدات'

    a.font = {
      bold: true,
      color: { argb: isCases ? 'FF99F6E4' : isUnits ? 'FFFDE68A' : 'FF94A3B8' },
    }
    b.font = {
      bold: true,
      color: { argb: isCases || isUnits ? 'FFF8FAFC' : 'FFE2E8F0' },
    }

    if (isCases || isUnits) {
      const fill = isCases ? 'FF0F766E' : 'FFB45309'
      a.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
      b.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
      a.border = {
        top: { style: 'thin', color: { argb: 'FF1F2937' } },
        left: { style: 'thin', color: { argb: 'FF1F2937' } },
        bottom: { style: 'thin', color: { argb: 'FF1F2937' } },
        right: { style: 'thin', color: { argb: 'FF1F2937' } },
      }
      b.border = a.border
    }
  })

  // Space then header
  const headerRowNumber = metaRows.length + 3
  const headerRow = ws.getRow(headerRowNumber)
  headerRow.values = ws.columns.map((c) => c.header as string)
  headerRow.height = 22
  headerRow.font = { bold: true, color: { argb: 'FFF8FAFC' } }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' },
    }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1F2937' } },
      left: { style: 'thin', color: { argb: 'FF1F2937' } },
      bottom: { style: 'thin', color: { argb: 'FF1F2937' } },
      right: { style: 'thin', color: { argb: 'FF1F2937' } },
    }
  })

  // Data rows
  // One distinct color per column (stronger contrast).
  const colPalette = [
    'FF0B1220', // #
    'FF0A1B3A', // date (navy)
    'FF06281B', // doctor (green)
    'FF1F1438', // patient (purple)
    'FF2A1B07', // work (brown)
    'FF3A2406', // units (amber/brown)
    'FF061B2A', // designer (blue-gray)
    'FF2A0E22', // Build Up (magenta)
  ]

  cases.forEach((c, i) => {
    const row = ws.getRow(headerRowNumber + i + 1)
    row.values = [
      i + 1,
      formatCaseDate(c.createdAt),
      c.doctorName,
      c.patientName,
      c.workType,
      c.units,
      c.designer,
      c.buildUp,
    ]

    row.height = 20
    row.alignment = { vertical: 'middle', horizontal: 'right' }

    row.eachCell((cell, colNumber) => {
      cell.font = { color: { argb: 'FFE2E8F0' } }
      const fillByCol = colPalette[colNumber - 1]
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fillByCol ?? 'FF0B1220' },
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF111827' } },
        left: { style: 'thin', color: { argb: 'FF111827' } },
        bottom: { style: 'thin', color: { argb: 'FF111827' } },
        right: { style: 'thin', color: { argb: 'FF111827' } },
      }
    })
  })

  // Freeze rows above the table header
  ws.views = [{ rightToLeft: true, state: 'frozen', ySplit: headerRowNumber }]

  // Make the meta section nicer
  ws.getColumn(1).alignment = { horizontal: 'right' }
  ws.getColumn(2).alignment = { horizontal: 'right' }

  return workbook
}

export async function exportCasesToExcel(params: {
  cases: LabCase[]
  stats: CaseStats
  context: ExportContext
}) {
  const { cases, stats, context } = params

  const workbook = buildStyledWorkbook({ cases, stats, context })
  const fileBase = safeFilePart(
    `${LAB_NAME} - ${context.title} - ${context.filterLabel}`,
  )
  const buffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer
  await downloadXlsx(buffer, `${fileBase}.xlsx`)
}


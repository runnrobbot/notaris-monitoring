/**
 * excelUtils.js — Import/Export compatible with CONTOH_MONITORING.xlsx
 *
 * KEY INSIGHT from file analysis:
 *   - All KEGIATAN fields are DATES (not status strings)
 *   - Row 3 = group headers (merged), Row 4 = sub-headers, Row 5+ = data
 *   - Column positions A-R are fixed and must be preserved on export
 */

import * as XLSX from 'xlsx'
import { format, parseISO, isValid } from 'date-fns'
import {
  EXCEL_COL_TO_FIELD,
  EXPORT_COLUMNS,
  GROUP_HEADERS,
  ALL_DATE_FIELDS,
  SEED_COMPANIES,
  SEED_BANKS,
} from './columnMap'

// ─── Date Helpers ──────────────────────────────────────────────────────────────

export function toDateString(value) {
  if (!value && value !== 0) return ''
  try {
    let d
    if (value instanceof Date) {
      d = value
    } else if (typeof value === 'string') {
      d = parseISO(value)
      if (!isValid(d)) d = new Date(value)
    } else if (typeof value === 'number') {
      const excelEpoch = new Date(1899, 11, 30)
      d = new Date(excelEpoch.getTime() + value * 86400000)
    } else {
      return ''
    }
    return isValid(d) ? format(d, 'yyyy-MM-dd') : ''
  } catch {
    return ''
  }
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return null
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'dd/MM/yyyy') : null
  } catch {
    return null
  }
}

function toDateObject(dateStr) {
  if (!dateStr) return null
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

// ─── IMPORT ───────────────────────────────────────────────────────────────────

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:R100')

        // Detect data start: first row where col A has a numeric value
        let dataStartRowIdx = 4 // Default row index 4 = Row 5
        for (let r = 0; r <= range.e.r; r++) {
          const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })]
          if (cellA && (typeof cellA.v === 'number' || /^\d+$/.test(String(cellA.v || '')))) {
            dataStartRowIdx = r
            break
          }
        }

        const results = []

        for (let r = dataStartRowIdx; r <= range.e.r; r++) {
          const rowObj = {}
          let hasData = false

          // Map columns A (0) through R (17)
          for (let c = 0; c <= 17; c++) {
            const colLetter = String.fromCharCode(65 + c)
            const field = EXCEL_COL_TO_FIELD[colLetter]
            if (!field) continue

            const cell = sheet[XLSX.utils.encode_cell({ r, c })]

            if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
              hasData = true
              if (ALL_DATE_FIELDS.includes(field)) {
                rowObj[field] = toDateString(cell.v)
              } else if (field === 'no') {
                rowObj[field] = Number(cell.v) || String(cell.v)
              } else {
                rowObj[field] = String(cell.v).trim()
              }
            } else {
              rowObj[field] = ''
            }
          }

          if (!hasData) continue

          // Ensure all fields present
          const fullRow = {}
          Object.values(EXCEL_COL_TO_FIELD).forEach((f) => {
            fullRow[f] = rowObj[f] !== undefined ? rowObj[f] : ''
          })
          results.push(fullRow)
        }

        resolve(results)
      } catch (err) {
        reject(new Error(`Parse error: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

function buildMonitoringSheet(documents) {
  // Build rows array (0-indexed):
  // Index 0 = Row 1 (empty)
  // Index 1 = Row 2 (empty)
  // Index 2 = Row 3 (group headers)
  // Index 3 = Row 4 (sub-headers)
  // Index 4+ = Data

  const rows = [
    Array(18).fill(null), // Row 1
    Array(18).fill(null), // Row 2
  ]

  // Row 3: group headers
  const groupRow = Array(18).fill(null)
  GROUP_HEADERS.forEach(({ label, startCol }) => {
    groupRow[startCol - 1] = label
  })
  rows.push(groupRow)

  // Row 4: sub-column headers
  // Cols that are merged in Row 3 and have no separate sub-header: A(0), Q(16), R(17)
  const mergedGroupCols = new Set([0, 16, 17])
  const subRow = Array(18).fill(null)
  EXPORT_COLUMNS.forEach(({ header }, idx) => {
    if (!mergedGroupCols.has(idx)) {
      subRow[idx] = header
    }
  })
  rows.push(subRow)

  // Data rows
  documents.forEach((doc) => {
    const dataRow = EXPORT_COLUMNS.map(({ field, type }) => {
      const val = doc[field]
      if (val === '' || val === null || val === undefined) return null
      if (type === 'date') return toDateObject(val)
      if (type === 'number') return Number(val) || val
      return val
    })
    rows.push(dataRow)
  })

  const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true })

  // Merged cells — exactly matches original file
  ws['!merges'] = [
    { s: { r: 2, c: 0 },  e: { r: 3, c: 0 }  }, // A3:A4   NO
    { s: { r: 2, c: 1 },  e: { r: 2, c: 4 }  }, // B3:E3   AKAD
    { s: { r: 2, c: 5 },  e: { r: 2, c: 6 }  }, // F3:G3   PEMINJAMAN SERTIPIKAT
    { s: { r: 2, c: 7 },  e: { r: 3, c: 7 }  }, // H3:H4   PAJAK
    { s: { r: 2, c: 8 },  e: { r: 3, c: 8 }  }, // I3:I4   PENOMORAN AKTA
    { s: { r: 2, c: 9 },  e: { r: 2, c: 15 } }, // J3:P3   KEGIATAN
    { s: { r: 2, c: 16 }, e: { r: 3, c: 16 } }, // Q3:Q4   SELESAI
    { s: { r: 2, c: 17 }, e: { r: 3, c: 17 } }, // R3:R4   REGISTER
  ]

  // Column widths — exact from original
  ws['!cols'] = EXPORT_COLUMNS.map(({ width }) => ({ wch: width }))

  // Apply date number format to all date cells in data rows
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let r = 4; r <= range.e.r; r++) {
    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      const cell = ws[addr]
      if (cell && cell.v instanceof Date) {
        cell.t = 'd'
        cell.z = 'dd-mmm-yy'
      }
    }
  }

  return ws
}

export function exportToExcel(documents, companies, filename = 'MONITORING') {
  const workbook = XLSX.utils.book_new()

  companies.forEach((company) => {
    const companyDocs = documents
      .filter((d) => d.companyId === company.id)
      .sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0))

    const ws = buildMonitoringSheet(companyDocs)
    const sheetName = company.name.replace(/[\\/*?[\]:]/g, '_').slice(0, 31)
    XLSX.utils.book_append_sheet(workbook, ws, sheetName)
  })

  if (workbook.SheetNames.length === 0) {
    const ws = buildMonitoringSheet(documents)
    XLSX.utils.book_append_sheet(workbook, ws, 'MONITORING')
  }

  // Append NAMA DEVELOPER reference sheet
  const devRows = [
    ['NAMA DEVELOPER', null, 'BANK'],
    ...SEED_COMPANIES.map((name, i) => [name, null, SEED_BANKS[i] || null]),
  ]
  const devSheet = XLSX.utils.aoa_to_sheet(devRows)
  devSheet['!cols'] = [{ wch: 28 }, { wch: 5 }, { wch: 35 }]
  XLSX.utils.book_append_sheet(workbook, devSheet, 'NAMA DEVELOPER')

  const today = format(new Date(), 'yyyyMMdd')
  XLSX.writeFile(workbook, `${filename}_${today}.xlsx`)
}

export function exportCompanyToExcel(documents, companyName) {
  const workbook = XLSX.utils.book_new()
  const sorted = [...documents].sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0))
  const ws = buildMonitoringSheet(sorted)
  const sheetName = companyName.replace(/[\\/*?[\]:]/g, '_').slice(0, 31)
  XLSX.utils.book_append_sheet(workbook, ws, sheetName)

  const today = format(new Date(), 'yyyyMMdd')
  XLSX.writeFile(workbook, `${companyName}_${today}.xlsx`)
}

// ─── Progress Helper ──────────────────────────────────────────────────────────

export function getActivityProgress(doc) {
  const fields = [
    'tanggalPengecekan', 'tanggalZNT', 'tanggalAlihMedia',
    'tanggalBalikNama', 'tanggalPeningkatanSHM', 'tanggalHT', 'tanggalRoya',
  ]
  const total = fields.length
  const done = fields.filter((f) => !!doc[f]).length
  return { done, total, percent: Math.round((done / total) * 100) }
}

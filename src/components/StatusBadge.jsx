/**
 * StatusBadge & DateActivityBadge
 * =================================
 * Since ALL kegiatan (activity) fields are DATES in the original Excel,
 * status is derived from date presence:
 *   - Has date  → "Selesai"  (green)  — shows the date
 *   - No date   → "Belum"    (gray)   — not yet done
 *
 * The old string-based Pending/In Progress/Completed is replaced by
 * date-based display everywhere.
 */

import { formatDisplayDate } from '../utils/excelUtils'
import { CheckCircle2, Clock } from 'lucide-react'

/**
 * DateActivityBadge
 * Displays a kegiatan date field:
 *   - If date exists: green badge with the date (DD/MM/YYYY)
 *   - If empty:       gray "Belum" badge
 */
export function DateActivityBadge({ dateValue }) {
  const display = formatDisplayDate(dateValue)

  if (display) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-semibold text-green-700 whitespace-nowrap">
        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
        {display}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-400 whitespace-nowrap">
      <Clock className="h-3 w-3 flex-shrink-0" />
      Belum
    </span>
  )
}

/**
 * DateCell — plain date display (not a badge), used for non-activity date cols
 * (Pinjam, Diterima, Tanggal Bayar Pajak, Tanggal Akta, Selesai, Register)
 */
export function DateCell({ value }) {
  const display = formatDisplayDate(value)
  if (!display) return <span className="text-slate-300 text-xs">—</span>
  return (
    <span className="text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap">
      {display}
    </span>
  )
}

/**
 * OverallStatusBadge — derived from tanggalSelesai
 * If the record has tanggalSelesai set → "Selesai"
 * Else if any activity done → "Proses"
 * Else → "Belum"
 */
export function OverallStatusBadge({ doc }) {
  const activityFields = [
    'tanggalPengecekan', 'tanggalZNT', 'tanggalAlihMedia',
    'tanggalBalikNama', 'tanggalPeningkatanSHM', 'tanggalHT', 'tanggalRoya',
  ]

  if (doc.tanggalSelesai) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Selesai
      </span>
    )
  }

  const anyDone = activityFields.some((f) => !!doc[f])
  if (anyDone) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Proses
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Belum
    </span>
  )
}

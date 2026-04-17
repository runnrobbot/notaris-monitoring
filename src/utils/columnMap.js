/**
 * COLUMN_MAP.js
 * =============
 * Single source of truth for all column mappings derived from
 * the actual CONTOH_MONITORING.xlsx file structure.
 *
 * EXCEL SHEET STRUCTURE:
 *   Row 1-2  : Empty / title area
 *   Row 3    : Group headers  (NO | AKAD | PEMINJAMAN SERTIPIKAT | PAJAK | PENOMORAN AKTA | KEGIATAN | SELESAI | REGISTER)
 *   Row 4    : Sub-headers    (Pihak Pertama | Pihak Kedua | Jenis Akad | Bank | Pinjam | Diterima | ...)
 *   Row 5+   : Data rows
 *
 * KEY INSIGHT:
 *   All KEGIATAN activity fields are stored as DATES (datetime), NOT status strings.
 *   - Has a date  → activity was completed on that date  (display: green badge + date)
 *   - Null/empty  → activity not yet done                (display: gray  "Belum")
 *   Status (Pending/In Progress/Done) is DERIVED from date presence, never stored.
 *
 * MERGED CELLS in original:
 *   A3:A4   → NO
 *   B3:E3   → AKAD
 *   F3:G3   → PEMINJAMAN SERTIPIKAT
 *   H3      → PAJAK (PPh-BPHTB)       (H4 = Tanggal Bayar)
 *   I3      → PENOMORAN AKTA          (I4 = Tanggal)
 *   J3:P3   → KEGIATAN
 *   Q3:Q4   → SELESAI
 *   R3:R4   → REGISTER (PENYERAHAN KE BANK)
 */

// ─── Excel Column Letter → Firestore Field ────────────────────────────────────
// Maps Excel column letters (A, B, C…) to Firestore document field names.
// Used by the IMPORT parser to read cells by position.

export const EXCEL_COL_TO_FIELD = {
  A: 'no',                    // NO
  B: 'pihakPertama',          // AKAD → Pihak Pertama
  C: 'pihakKedua',            // AKAD → Pihak Kedua
  D: 'jenisAkad',             // AKAD → Jenis Akad
  E: 'bank',                  // AKAD → Bank
  F: 'tanggalPinjam',         // PEMINJAMAN SERTIPIKAT → Pinjam        (date)
  G: 'tanggalDiterima',       // PEMINJAMAN SERTIPIKAT → Diterima      (date)
  H: 'tanggalBayarPajak',     // PAJAK (PPh-BPHTB)    → Tanggal Bayar (date)
  I: 'tanggalAkta',           // PENOMORAN AKTA        → Tanggal       (date)
  J: 'tanggalPengecekan',     // KEGIATAN → Pengecekan                 (date)
  K: 'tanggalZNT',            // KEGIATAN → ZNT                        (date)
  L: 'tanggalAlihMedia',      // KEGIATAN → Alih Media                 (date)
  M: 'tanggalBalikNama',      // KEGIATAN → Balik Nama                 (date)
  N: 'tanggalPeningkatanSHM', // KEGIATAN → Peningkatan (SHM)          (date)
  O: 'tanggalHT',             // KEGIATAN → HT                         (date)
  P: 'tanggalRoya',           // KEGIATAN → Roya                       (date)
  Q: 'tanggalSelesai',        // SELESAI                               (date)
  R: 'tanggalRegister',       // REGISTER (PENYERAHAN KE BANK)         (date)
}

// ─── Excel Header Text → Firestore Field ─────────────────────────────────────
// Maps Row-4 sub-header text to field names.
// Used as a fallback for header-based parsing when column order might vary.

export const EXCEL_HEADER_TO_FIELD = {
  'NO':                   'no',
  'PIHAK PERTAMA':        'pihakPertama',
  'PIHAK KEDUA':          'pihakKedua',
  'JENIS AKAD':           'jenisAkad',
  'BANK':                 'bank',
  'PINJAM':               'tanggalPinjam',
  'DITERIMA':             'tanggalDiterima',
  'TANGGAL BAYAR':        'tanggalBayarPajak',
  'TANGGAL':              'tanggalAkta',
  'PENGECEKAN':           'tanggalPengecekan',
  'ZNT':                  'tanggalZNT',
  'ALIH MEDIA':           'tanggalAlihMedia',
  'BALIK NAMA':           'tanggalBalikNama',
  'PENINGKATAN (SHM)':    'tanggalPeningkatanSHM',
  'HT':                   'tanggalHT',
  'ROYA':                 'tanggalRoya',
  'SELESAI':              'tanggalSelesai',
  'REGISTER (PENYERAHAN KE BANK)': 'tanggalRegister',
}

// ─── Firestore Field → Export Config ─────────────────────────────────────────
// Defines the export column order, header labels, Excel col widths,
// and which Excel column letter each field maps to for exact reconstruction.

export const EXPORT_COLUMNS = [
  { col: 'A', field: 'no',                    header: 'NO',                              width: 9.14,  type: 'number' },
  { col: 'B', field: 'pihakPertama',          header: 'Pihak Pertama',                   width: 21.71, type: 'string' },
  { col: 'C', field: 'pihakKedua',            header: 'Pihak Kedua',                     width: 11.86, type: 'string' },
  { col: 'D', field: 'jenisAkad',             header: 'Jenis Akad',                      width: 10.29, type: 'string' },
  { col: 'E', field: 'bank',                  header: 'Bank',                            width: 26.86, type: 'string' },
  { col: 'F', field: 'tanggalPinjam',         header: 'Pinjam',                          width: 13.43, type: 'date'   },
  { col: 'G', field: 'tanggalDiterima',       header: 'Diterima',                        width: 13.43, type: 'date'   },
  { col: 'H', field: 'tanggalBayarPajak',     header: 'Tanggal Bayar',                   width: 18.57, type: 'date'   },
  { col: 'I', field: 'tanggalAkta',           header: 'Tanggal',                         width: 18.57, type: 'date'   },
  { col: 'J', field: 'tanggalPengecekan',     header: 'Pengecekan',                      width: 12.86, type: 'date'   },
  { col: 'K', field: 'tanggalZNT',            header: 'ZNT',                             width: 11.86, type: 'date'   },
  { col: 'L', field: 'tanggalAlihMedia',      header: 'Alih Media',                      width: 12.14, type: 'date'   },
  { col: 'M', field: 'tanggalBalikNama',      header: 'Balik Nama',                      width: 12.14, type: 'date'   },
  { col: 'N', field: 'tanggalPeningkatanSHM', header: 'Peningkatan (SHM)',               width: 18.29, type: 'date'   },
  { col: 'O', field: 'tanggalHT',             header: 'HT',                              width: 11.86, type: 'date'   },
  { col: 'P', field: 'tanggalRoya',           header: 'Roya',                            width: 11.86, type: 'date'   },
  { col: 'Q', field: 'tanggalSelesai',        header: 'SELESAI',                         width: 11.29, type: 'date'   },
  { col: 'R', field: 'tanggalRegister',       header: 'REGISTER (PENYERAHAN KE BANK)',   width: 32.00, type: 'date'   },
]

// ─── Group Header Definitions ─────────────────────────────────────────────────
// Reconstructs the Row-3 merged group header row on export.
// startCol/endCol are 1-based column indices.

export const GROUP_HEADERS = [
  { label: 'NO',                            startCol: 1,  endCol: 1  },
  { label: 'AKAD',                          startCol: 2,  endCol: 5  },
  { label: 'PEMINJAMAN SERTIPIKAT',         startCol: 6,  endCol: 7  },
  { label: 'PAJAK (PPh-BPHTB)',             startCol: 8,  endCol: 8  },
  { label: 'PENOMORAN AKTA',                startCol: 9,  endCol: 9  },
  { label: 'KEGIATAN',                      startCol: 10, endCol: 16 },
  { label: 'SELESAI',                       startCol: 17, endCol: 17 },
  { label: 'REGISTER (PENYERAHAN KE BANK)', startCol: 18, endCol: 18 },
]

// ─── Activity Date Fields ─────────────────────────────────────────────────────
// Only the KEGIATAN columns. Used to calculate completion progress.

export const ACTIVITY_DATE_FIELDS = [
  { field: 'tanggalPengecekan',     label: 'Pengecekan'       },
  { field: 'tanggalZNT',            label: 'ZNT'              },
  { field: 'tanggalAlihMedia',      label: 'Alih Media'       },
  { field: 'tanggalBalikNama',      label: 'Balik Nama'       },
  { field: 'tanggalPeningkatanSHM', label: 'Peningkatan (SHM)'},
  { field: 'tanggalHT',             label: 'HT'               },
  { field: 'tanggalRoya',           label: 'Roya'             },
]

// ─── All Date Fields ──────────────────────────────────────────────────────────
// Every field that holds a date value (not strings).

export const ALL_DATE_FIELDS = [
  'tanggalPinjam',
  'tanggalDiterima',
  'tanggalBayarPajak',
  'tanggalAkta',
  'tanggalPengecekan',
  'tanggalZNT',
  'tanggalAlihMedia',
  'tanggalBalikNama',
  'tanggalPeningkatanSHM',
  'tanggalHT',
  'tanggalRoya',
  'tanggalSelesai',
  'tanggalRegister',
]

// ─── Firestore Document Schema ────────────────────────────────────────────────
// Full schema for a document record with default values.

export const DOCUMENT_DEFAULTS = {
  // Identity
  companyId:              '',   // string — FK to companies collection
  no:                     '',   // string/number — sequential number

  // AKAD
  pihakPertama:           '',   // string — First party (developer PT name)
  pihakKedua:             '',   // string — Second party (buyer name)
  jenisAkad:              '',   // string — Agreement type: AJB, PPJB, APHT, etc.
  bank:                   '',   // string — Bank name

  // Peminjaman Sertipikat (Certificate Borrowing)
  tanggalPinjam:          '',   // date string YYYY-MM-DD — date borrowed
  tanggalDiterima:        '',   // date string YYYY-MM-DD — date received back

  // Pajak (Tax)
  tanggalBayarPajak:      '',   // date string YYYY-MM-DD — PPh/BPHTB payment date

  // Penomoran Akta (Deed Numbering)
  tanggalAkta:            '',   // date string YYYY-MM-DD — deed numbering date

  // Kegiatan (Activities) — ALL ARE DATES
  // Presence of a date = activity completed on that date
  // Null/empty = not yet done (shown as "Belum")
  tanggalPengecekan:      '',   // date string — Checking
  tanggalZNT:             '',   // date string — ZNT
  tanggalAlihMedia:       '',   // date string — Media Transfer
  tanggalBalikNama:       '',   // date string — Name Transfer
  tanggalPeningkatanSHM:  '',   // date string — SHM Upgrade
  tanggalHT:              '',   // date string — HT
  tanggalRoya:            '',   // date string — Roya

  // Completion
  tanggalSelesai:         '',   // date string — Completed date
  tanggalRegister:        '',   // date string — Bank submission date

  // Meta (set by app, not from Excel)
  // companyId, createdBy, createdAt, updatedAt are added by firestoreService
}

// ─── Companies from NAMA DEVELOPER sheet ─────────────────────────────────────
// Pre-seeded from the NAMA DEVELOPER sheet in the original Excel.

export const SEED_COMPANIES = [
  'PT ADSTON CITRA LESTARI',
  'PT ARMINDO TEKNIK',
  'PT ASATU REALTY ASRI',
  'PT ASKARA MAKMUR',
  'PT KRAMAT JAYA CIPTA',
  'PT LEBAK NAGKA AL',
  'PT UNILOA ARDIYANTO',
  'PT BERINGIN GRAHA',
  'PT ARGA',
  'PT BESTOW',
  'PT HASAN DINAR',
  'PT GENTALA',
  'PT BAHTERA KARYA',
  'PT PELANGI',
  'PT SAGITARIUS',
  'PT TRI YASA PERSADA',
  'PT INSAN INDAH',
  'PT MAHARANI SELATAN',
  'PT MULYA CIPTA JAYA',
  'PT SENTRAD NALURI',
  'PT PURI RAISAH',
  'PT BHUMI CAHAYA S',
]

// ─── Banks from NAMA DEVELOPER sheet ─────────────────────────────────────────

export const SEED_BANKS = [
  'PT BANK TABUNGAN NEGARA (JL JAWA)',
  'PT BANK TABUNGAN NEGARA (BDG TIMUR)',
  'PT BANK SYARIAH NASIONAL',
  'PT BJBS',
  'HIK',
]

// ─── Jenis Akad options ───────────────────────────────────────────────────────

export const JENIS_AKAD_OPTIONS = [
  'AJB',
  'PPJB',
  'APHT',
  'SKMHT',
  'Lainnya',
]

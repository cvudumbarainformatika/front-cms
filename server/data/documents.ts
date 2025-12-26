export interface DocumentItem {
  id: number
  name: string
  type: string
  validUntil: string
  status: 'valid' | 'expired' | 'pending'
  url: string
}

export const documents: DocumentItem[] = [
  {
    id: 1,
    name: 'Surat Tanda Registrasi (STR)',
    type: 'STR',
    validUntil: '31 Des 2025',
    status: 'valid',
    url: '#'
  },
  {
    id: 2,
    name: 'Surat Izin Praktik (SIP) - RSUD',
    type: 'SIP',
    validUntil: '15 Mar 2026',
    status: 'valid',
    url: '#'
  },
  {
    id: 3,
    name: 'Sertifikat Kompetensi',
    type: 'Serkom',
    validUntil: '20 Nov 2024',
    status: 'expired',
    url: '#'
  },
  {
    id: 4,
    name: 'KTP',
    type: 'Identitas',
    validUntil: 'Seumur Hidup',
    status: 'valid',
    url: '#'
  }
]

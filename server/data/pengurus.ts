/**
 * Dummy Data: Pengurus PDPI
 * Data struktur pengurus pusat, wilayah, dan cabang
 */

import type { PengurusItem } from '../../app/types/content'

export const pengurusItems: PengurusItem[] = [
  // Pengurus Pusat
  {
    id: '1',
    name: 'Prof. Dr. dr. Agus Dwi Susanto, Sp.P(K)',
    position: 'Ketua Umum',
    bidang: 'Ketua',
    level: 'pusat',
    periode: '2023-2026',
    email: 'ketua@pdpi.or.id'
  },
  {
    id: '2',
    name: 'Dr. dr. Faisal Yunus, Sp.P(K), MARS, FISR',
    position: 'Wakil Ketua Umum',
    bidang: 'Wakil Ketua',
    level: 'pusat',
    periode: '2023-2026'
  },
  {
    id: '3',
    name: 'Dr. dr. Erlina Burhan, MSc, Sp.P(K)',
    position: 'Sekretaris Jenderal',
    bidang: 'Sekretariat',
    level: 'pusat',
    periode: '2023-2026',
    email: 'sekjen@pdpi.or.id'
  },
  {
    id: ' 4',
    name: 'dr. Budhi Antariksa, Sp.P(K)',
    position: 'Bendahara Umum',
    bidang: 'Keuangan',
    level: 'pusat',
    periode: '2023-2026'
  },
  {
    id: '5',
    name: 'Prof. Dr. dr. Suradi, Sp.P(K)',
    position: 'Ketua Bidang Pendidikan',
    bidang: 'Pendidikan',
    level: 'pusat',
    periode: '2023-2026'
  },
  {
    id: '6',
    name: 'Dr. dr. Menaldi Rasmin, Sp.P(K)',
    position: 'Ketua Bidang Penelitian',
    bidang: 'Penelitian',
    level: 'pusat',
    periode: '2023-2026'
  },
  {
    id: '7',
    name: 'dr. Jamal Zaini, Sp.P(K)',
    position: 'Ketua Bidang Organisasi dan Keanggotaan',
    bidang: 'Organisasi',
    level: 'pusat',
    periode: '2023-2026'
  },
  {
    id: '8',
    name: 'dr. Anna Uyainah, Sp.P(K)',
    position: 'Ketua Bidang Hubungan Masyarakat',
    bidang: 'Humas',
    level: 'pusat',
    periode: '2023-2026'
  },

  // Pengurus Wilayah (contoh beberapa wilayah)
  {
    id: '9',
    name: 'dr. Ahmad Rizal, Sp.P(K)',
    position: 'Ketua Wilayah Jawa Barat',
    bidang: 'Wilayah',
    level: 'wilayah',
    periode: '2023-2026'
  },
  {
    id: '10',
    name: 'dr. Siti Nurjanah, Sp.P(K)',
    position: 'Ketua Wilayah Jawa Tengah',
    bidang: 'Wilayah',
    level: 'wilayah',
    periode: '2023-2026'
  },
  {
    id: '11',
    name: 'dr. Budi Santoso, Sp.P(K)',
    position: 'Ketua Wilayah Jawa Timur',
    bidang: 'Wilayah',
    level: 'wilayah',
    periode: '2023-2026'
  },
  {
    id: '12',
    name: 'dr. Dewi Anggraini, Sp.P(K)',
    position: 'Ketua Wilayah Sumatera Utara',
    bidang: 'Wilayah',
    level: 'wilayah',
    periode: '2023-2026'
  },

  // Pengurus Cabang (contoh)
  {
    id: '13',
    name: 'dr. Rina Kartika, Sp.P',
    position: 'Ketua Cabang Jakarta Selatan',
    bidang: 'Cabang',
    level: 'cabang',
    periode: '2023-2026'
  },
  {
    id: '14',
    name: 'dr. Hendra Wijaya, Sp.P',
    position: 'Ketua Cabang Bandung',
    bidang: 'Cabang',
    level: 'cabang',
    periode: '2023-2026'
  },
  {
    id: '15',
    name: 'dr. Lisa Permata, Sp.P',
    position: 'Ketua Cabang Surabaya',
    bidang: 'Cabang',
    level: 'cabang',
    periode: '2023-2026'
  }
]

// Helper functions
export function getPengurusByLevel(level: string): PengurusItem[] {
  return pengurusItems.filter(item => item.level === level)
}

export function getPengurusPusat(): PengurusItem[] {
  return getPengurusByLevel('pusat')
}

export function getPengurusWilayah(): PengurusItem[] {
  return getPengurusByLevel('wilayah')
}

export function getPengurusCabang(): PengurusItem[] {
  return getPengurusByLevel('cabang')
}

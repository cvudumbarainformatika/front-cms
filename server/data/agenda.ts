/**
 * Dummy Data: Agenda Kegiatan PDPI
 * Collection agenda webinar, workshop, seminar, kongres
 */

import type { AgendaItem } from '../../app/types/content'

export const agendaItems: AgendaItem[] = [
  {
    id: '1',
    slug: 'webinar-ppok-desember-2024',
    title: 'Webinar: Update Tatalaksana Eksaserbasi Akut PPOK',
    description: 'Webinar dengan topik tatalaksana terkini eksaserbasi akut PPOK menghadirkan Prof. Dr. dr. Suradi, Sp.P(K) sebagai pembicara. Membahas guideline terbaru, algoritma penanganan, dan kasus-kasus menantang.',
    type: 'webinar',
    date: '2026-01-28T19:00:00Z',
    location: 'Online via Zoom',
    isOnline: true,
    skp: 4,
    quota: 500,
    registered: 342,
    registrationUrl: 'https://pdpi.or.id/register/webinar-ppok-des2024',
    image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800',
    fee: 'Gratis untuk anggota'
  },
  {
    id: '2',
    slug: 'workshop-bronkoskopi-januari-2025',
    title: 'Workshop Bronkoskopi Tingkat Lanjut',
    description: 'Workshop hands-on bronkoskopi diagnostik dan terapeutik dengan simulator, live demonstration, dan supervised practice. Dipimpin oleh team bronkoskopi terbaik dari berbagai pusat pendidikan.',
    type: 'workshop',
    date: '2026-02-15T08:00:00Z',
    endDate: '2026-02-17T17:00:00Z',
    location: 'Hotel Santika Jakarta',
    isOnline: false,
    skp: 12,
    quota: 30,
    registered: 28,
    registrationUrl: 'https://pdpi.or.id/register/workshop-bronko-jan2025',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    fee: 'Rp 5.000.000'
  },
  {
    id: '3',
    slug: 'kongres-nasional-2025',
    title: 'Kongres Nasional PDPI ke-29',
    description: 'Kongres Nasional PDPI 2025 dengan tema "Transformasi Digital dalam Pelayanan Respiratori". Menghadirkan 50+ pembicara nasional dan internasional, workshop, simposium, dan presentasi penelitian.',
    type: 'kongres',
    date: '2026-11-18T08:00:00Z',
    endDate: '2026-11-20T17:00:00Z',
    location: 'Bali Nusa Dua Convention Center',
    isOnline: false,
    skp: 25,
    quota: 2000,
    registered: 456,
    registrationUrl: 'https://pdpi.or.id/register/konas-2025',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    fee: 'Early bird: Rp 3.500.000'
  },
  {
    id: '4',
    slug: 'webinar-asma-januari-2025',
    title: 'Webinar: Personalized Medicine in Asthma Management',
    description: 'Webinar membahas pendekatan personalized medicine dalam penatalaksanaan asma termasuk penggunaan biologics dan terapi target. Pembicara: Dr. dr. Faisal Yunus, Sp.P(K), MARS.',
    type: 'webinar',
    date: '2026-01-10T19:00:00Z',
    location: 'Online via Zoom',
    isOnline: true,
    skp: 4,
    quota: 500,
    registered: 187,
    registrationUrl: 'https://pdpi.or.id/register/webinar-asma-jan2025',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    fee: 'Gratis untuk anggota'
  },
  {
    id: '5',
    slug: 'pelatihan-spirometri-februari-2025',
    title: 'Pelatihan Spirometri dan Interpretasi',
    description: 'Pelatihan komprehensif spirometri mencakup teknik pemeriksaan yang benar, quality control, dan interpretasi hasil. Hands-on practice dengan alat spirometri terkini.',
    type: 'pelatihan',
    date: '2026-02-08T08:00:00Z',
    endDate: '2026-02-09T16:00:00Z',
    location: 'RS Persahabatan Jakarta',
    isOnline: false,
    skp: 8,
    quota: 40,
    registered: 35,
    registrationUrl: 'https://pdpi.or.id/register/pelatihan-spiro-feb2025',
    image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800',
    fee: 'Rp 2.500.000'
  },
  {
    id: '6',
    slug: 'seminar-tb-maret-2025',
    title: 'Seminar National TB Control Program Update',
    description: 'Seminar update program pengendalian TB nasional, membahas strategi eliminasi TB 2030, penanganan TB resisten obat, dan implementasi DOTS-Plus di Indonesia.',
    type: 'seminar',
    date: '2025-03-15T08:00:00Z',
    location: 'Hotel Grand Hyatt Jakarta',
    isOnline: false,
    skp: 6,
    quota: 300,
    registered: 142,
    registrationUrl: 'https://pdpi.or.id/register/seminar-tb-mar2025',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
    fee: 'Rp 750.000'
  },
  {
    id: '7',
    slug: 'webinar-kanker-paru-februari-2025',
    title: 'Webinar: Advances in Lung Cancer Treatment',
    description: 'Update terkini terapi kanker paru termasuk targeted therapy, immunotherapy, dan kombinasi kemoterapi. Membahas guideline terbaru dan pengalaman klinis.',
    type: 'webinar',
    date: '2025-02-20T19:00:00Z',
    location: 'Online via Zoom',
    isOnline: true,
    skp: 4,
    quota: 500,
    registered: 234,
    registrationUrl: 'https://pdpi.or.id/register/webinar-kanker-feb2025',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
    fee: 'Gratis untuk anggota'
  },
  {
    id: '8',
    slug: 'workshop-critical-care-april-2025',
    title: 'Workshop Respiratory Critical Care',
    description: 'Workshop intensif penanganan kasus kritis respiratori di ICU. Mencakup mekanical ventilation, ARDS management, weaning strategies, dan acute respiratory failure.',
    type: 'workshop',
    date: '2025-04-10T08:00:00Z',
    endDate: '2025-04-12T17:00:00Z',
    location: 'RSUP Dr. Sardjito Yogyakarta',
    isOnline: false,
    skp: 12,
    quota: 35,
    registered: 22,
    registrationUrl: 'https://pdpi.or.id/register/workshop-critical-apr2025',
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800',
    fee: 'Rp 4.500.000'
  },
  {
    id: '9',
    slug: 'webinar-pulmonary-rehabilitation-maret-2025',
    title: 'Webinar: Pulmonary Rehabilitation Best Practices',
    description: 'Webinar membahas best practices rehabilitasi paru untuk pasien PPOK, post-COVID, dan penyakit respiratori kronis lainnya. Evidence-based approach dan implementasi praktis.',
    type: 'webinar',
    date: '2025-03-25T19:00:00Z',
    location: 'Online via Zoom',
    isOnline: true,
    skp: 4,
    quota: 500,
    registered: 156,
    registrationUrl: 'https://pdpi.or.id/register/webinar-rehab-mar2025',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    fee: 'Gratis untuk anggota'
  }
]

// Helper functions
export function getAllAgenda(): AgendaItem[] {
  return agendaItems.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

export function getUpcomingAgenda(): AgendaItem[] {
  const now = new Date()
  return agendaItems
    .filter(item => new Date(item.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getAgendaByType(type: string): AgendaItem[] {
  return agendaItems.filter(item => item.type === type)
}

export function getAgendaBySlug(slug: string): AgendaItem | undefined {
  return agendaItems.find(item => item.slug === slug)
}

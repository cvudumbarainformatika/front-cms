/**
 * Content Type Definitions
 * Types untuk konten publik (berita, agenda, pengurus, direktori)
 */

/**
 * Kategori berita
 */
export type BeritaCategory = 'umum' | 'ilmiah' | 'kegiatan' | 'pengumuman' | 'prestasi'

/**
 * Item berita
 */
export interface BeritaItem {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string
  category: BeritaCategory
  author: string
  publishedAt: string
  tags: string[]
  views?: number
}

/**
 * Tipe agenda/kegiatan
 */
export type AgendaType = 'webinar' | 'workshop' | 'seminar' | 'kongres' | 'pelatihan'

/**
 * Item agenda kegiatan
 */
export interface AgendaItem {
  id: string
  slug: string
  title: string
  description: string
  type: AgendaType
  date: string
  endDate?: string
  location: string
  isOnline: boolean
  skp: number
  quota?: number
  registered?: number
  registrationUrl?: string
  image?: string
  fee?: string
}

/**
 * Level organisasi
 */
export type OrganisasiLevel = 'pusat' | 'wilayah' | 'cabang'

/**
 * Jabatan pengurus
 */
export interface PengurusItem {
  id: string
  name: string
  position: string
  photo?: string
  bidang: string
  level: OrganisasiLevel
  periode: string
  email?: string
  phone?: string
}

/**
 * Tipe fasilitas kesehatan
 */
export type DirektoriType = 'rumah_sakit' | 'klinik' | 'instansi' | 'laboratorium'

/**
 * Item direktori
 */
export interface DirektoriItem {
  id: string
  name: string
  type: DirektoriType
  address: string
  phone: string
  email?: string
  website?: string
  city: string
  province: string
  hasRespirologist: boolean
  facilities?: string[]
}

/**
 * Visi & Misi organisasi
 */
export interface VisiMisi {
  visi: string
  misi: string[]
}

/**
 * Timeline item untuk sejarah
 */
export interface TimelineItem {
  year: string
  title: string
  description: string
  image?: string
}

/**
 * Sejarah organisasi
 */
export interface Sejarah {
  content: string
  timeline: TimelineItem[]
}

/**
 * AD/ART dokumen
 */
export interface AdArt {
  title: string
  description: string
  url: string
  lastUpdated: string
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Item dokumen anggota
 */
export interface DocumentItem {
  id: number | string
  name: string
  type: string
  validUntil: string
  status: 'valid' | 'expired' | 'pending'
  url: string
}

/**
 * Item statistik beranda
 */
export interface StatItem {
  label: string
  value: string
}

/**
 * Item fitur/keunggulan beranda
 */
export interface FeatureItem {
  title: string
  description: string
  icon: string
}

/**
 * Data Beranda (Homepage)
 */
export interface HomepageData {
  hero: {
    title: string
    description: string
    images: string[]
  }
  stats: StatItem[]
  features: FeatureItem[]
  seo: {
    title: string
    description: string
  }
}

/**
 * API Response dengan pagination
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    pagination: PaginationMeta
  }
  message?: string
}

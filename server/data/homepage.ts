/**
 * Data Beranda PDPI (Homepage)
 * Digunakan sebagai state awal dan storage sederhana (file-based)
 */

import type { HomepageData } from '../../app/types/content'

export let homepageData: HomepageData = {
  hero: {
    title: 'Perhimpunan Dokter Paru Indonesia',
    description: 'Organisasi profesi dokter spesialis paru terkemuka di Indonesia yang berkomitmen meningkatkan kualitas pelayanan kesehatan respiratori melalui pendidikan, penelitian, dan inovasi.',
    images: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=2074&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?q=80&w=2070&auto=format&fit=crop'
    ]
  },
  stats: [
    { label: 'Anggota Aktif', value: '2.500+' },
    { label: 'Tahun Berdiri', value: '1972' },
    { label: 'Cabang Wilayah', value: '34' },
    { label: 'Kegiatan/Tahun', value: '100+' }
  ],
  features: [
    {
      title: 'Pendidikan Berkelanjutan',
      description: 'Program pelatihan, webinar, dan workshop berkualitas untuk peningkatan kompetensi anggota.',
      icon: 'i-lucide-graduation-cap'
    },
    {
      title: 'Penelitian & Inovasi',
      description: 'Mendorong riset dan pengembangan di bidang kedokteran respiratori.',
      icon: 'i-lucide-microscope'
    },
    {
      title: 'Jaringan Profesional',
      description: 'Menghubungkan dokter spesialis paru di seluruh Indonesia.',
      icon: 'i-lucide-users'
    },
    {
      title: 'Standar Pelayanan',
      description: 'Pedoman dan standar terkini untuk pelayanan respiratori berkualitas.',
      icon: 'i-lucide-file-check'
    },
    {
      title: 'Sertifikasi Kompetensi',
      description: 'Program sertifikasi dan SKP untuk pengembangan profesional.',
      icon: 'i-lucide-award'
    },
    {
      title: 'Kerjasama Global',
      description: 'Kolaborasi dengan organisasi respirologi internasional.',
      icon: 'i-lucide-globe'
    }
  ],
  seo: {
    title: 'PDPI - Perhimpunan Dokter Paru Indonesia',
    description: 'Organisasi profesi dokter spesialis paru terkemuka di Indonesia. Meningkatkan kompetensi anggota dan kualitas pelayanan kesehatan respiratori.'
  }
}

/**
 * Update data beranda
 */
export function updateHomepageData(newData: Partial<HomepageData>) {
  homepageData = {
    ...homepageData,
    ...newData,
    hero: { ...homepageData.hero, ...newData.hero },
    seo: { ...homepageData.seo, ...newData.seo }
  }
  return homepageData
}

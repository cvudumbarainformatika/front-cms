/**
 * Dummy Data: Profil Organisasi
 * Data visi misi, sejarah, dan AD/ART PDPI
 */

import type { VisiMisi, Sejarah, AdArt } from '../../app/types/content'

/**
 * Visi & Misi PDPI
 */
export const visiMisi: VisiMisi = {
  visi: 'Menjadi organisasi profesi dokter spesialis paru terkemuka di Asia Tenggara yang berperan aktif dalam peningkatan kualitas pelayanan kesehatan respiratori, pendidikan, dan penelitian untuk kesejahteraan masyarakat Indonesia.',
  misi: [
    'Meningkatkan kompetensi dan profesionalisme anggota melalui pendid ikan dan pelatihan berkelanjutan',
    'Mengembangkan standar pelayanan kesehatan respiratori yang berkualitas',
    'Mendorong penelitian dan inovasi di bidang kedokteran respiratori',
    'Menjalin kerjasama nasional dan internasional untuk pertukaran ilmu pengetahuan',
    'Berperan aktif dalam kebijakan kesehatan nasional terkait penyakit respiratori',
    'Meningkatkan kesadaran masyarakat tentang pentingnya kesehatan paru-paru'
  ]
}

/**
 * Sejarah PDPI
 */
export const sejarah: Sejarah = {
  content: `Perhimpunan Dokter Paru Indonesia (PDPI) didirikan pada tanggal 25 Juli 1972 di Jakarta. Organisasi ini lahir dari kebutuhan para dokter spesialis paru untuk memiliki wadah profesional yang dapat meningkatkan kualitas pelayanan kesehatan respiratori di Indonesia.

Sejak awal berdirinya, PDPI telah berkomitmen untuk meningkatkan kompetensi anggota, mengembangkan penelitian, dan berkontribusi dalam kebijakan kesehatan nasional. Perjalanan panjang PDPI telah menghasilkan berbagai pencapaian signifikan dalam dunia kedokteran respiratori Indonesia.`,
  timeline: [
    {
      year: '1972',
      title: 'Pendirian PDPI',
      description: 'PDPI resmi didirikan pada 25 Juli 1972 di Jakarta oleh sekelompok dokter spesialis paru pelopor.'
    },
    {
      year: '1985',
      title: 'Kongres Nasional Pertama',
      description: 'Penyelenggaraan Kongres Nasional PDPI pertama yang menjadi ajang pertemuan ilmiah tahunan.'
    },
    {
      year: '1992',
      title: 'Program Sertifikasi',
      description: 'Peluncuran program sertifikasi kompetensi untuk dokter spesialis paru.'
    },
    {
      year: '2000',
      title: 'Kerjasama Internasional',
      description: 'Menjalin kerjasama dengan Asian Pacific Society of Respirology (APSR).'
    },
    {
      year: '2010',
      title: 'Pedoman Nasional PPOK',
      description: 'Penerbitan Pedoman Diagnosis dan Penatalaksanaan PPOK di Indonesia.'
    },
    {
      year: '2015',
      title: 'Program E-Learning',
      description: 'Peluncuran platform e-learning untuk pendidikan berkelanjutan anggota.'
    },
    {
      year: '2020',
      title: 'Peran di Pandemi COVID-19',
      description: 'PDPI menjadi garda terdepan dalam penanganan pandemi COVID-19 di Indonesia.'
    },
    {
      year: '2024',
      title: 'Transformasi Digital',
      description: 'Implementasi sistem manajemen anggota digital dan portal anggota online.'
    }
  ]
}

/**
 * AD/ART PDPI
 */
export const adArt: AdArt = {
  title: 'Anggaran Dasar dan Anggaran Rumah Tangga PDPI',
  description: 'Dokumen AD/ART PDPI hasil Munas 2023 yang mengatur struktur organisasi, keanggotaan, dan tata kelola Perhimpunan Dokter Paru Indonesia.',
  url: '/documents/ad-art-pdpi-2023.pdf',
  lastUpdated: '2023-11-15'
}

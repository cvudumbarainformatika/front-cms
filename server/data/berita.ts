/**
 * Dummy Data: Berita PDPI
 * Collection 30+ berita dengan berbagai kategori
 */

import type { BeritaItem } from '../../app/types/content'

export const beritaItems: BeritaItem[] = [
  {
    id: '1',
    slug: 'kongres-nasional-pdpi-2024',
    title: 'Kongres Nasional PDPI 2024 Dihadiri 1500 Peserta',
    excerpt: 'Kongres Nasional PDPI ke-28 di Bali sukses diselenggarakan dengan tema "Inovasi dalam Pelayanan Respiratori".',
    content: `Kongres Nasional PDPI ke-28 yang diselenggarakan di Bali pada 20-22 November 2024 telah sukses dihadiri oleh lebih dari 1500 peserta dari seluruh Indonesia. Acara ini mengangkat tema "Inovasi dalam Pelayanan Respiratori" dan menampilkan berbagai sesi ilmiah, workshop, dan presentasi penelitian terkini.

Ketua Umum PDPI, Prof. Dr. dr. Agus Dwi Susanto, Sp.P(K), dalam sambutan pembukaannya menekankan pentingnya inovasi dan adaptasi teknologi dalam meningkatkan kualitas pelayanan respiratori di Indonesia. "Kita harus terus berinovasi untuk memberikan pelayanan terbaik kepada pasien," ujarnya.

Kongres kali ini juga menghadirkan pembicara internasional dari berbagai negara termasuk Jepang, Singapura, dan Australia yang berbagi pengalaman dan pengetahuan terkini di bidang respirologi.`,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    category: 'kegiatan',
    author: 'Tim Redaksi PDPI',
    publishedAt: '2024-11-23T10:00:00Z',
    tags: ['kongres', 'kegiatan', 'nasional'],
    views: 2543
  },
  {
    id: '2',
    slug: 'pedoman-tatalaksana-asma-2024',
    title: 'PDPI Terbitkan Pedoman Tatalaksana Asma Terbaru 2024',
    excerpt: 'Pedoman terbaru ini mengintegrasikan evidence-based medicine terkini untuk penanganan asma di Indonesia.',
    content: `PDPI resmi menerbitkan Pedoman Diagnosis dan Tatalaksana Asma di Indonesia edisi 2024. Pedoman ini merupakan pembaruan dari edisi sebelumnya dengan menambahkan berbagai evidence-based medicine terkini.

Dr. dr. Faisal Yunus, Sp.P(K), MARS, FISR, ketua tim penyusun pedoman, menjelaskan bahwa pedoman baru ini mencakup pendekatan personalized medicine dalam penanganan asma. "Kami mengadopsi strategi terkini termasuk penggunaan biologics dan terapi inhalasi kombinasi," jelasnya.

Pedoman ini dapat diakses secara gratis oleh seluruh anggota PDPI melalui portal anggota dan dijadikan acuan standar penanganan asma di Indonesia.`,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    category: 'ilmiah',
    author: 'Dr. Faisal Yunus',
    publishedAt: '2024-12-15T08:30:00Z',
    tags: ['pedoman', 'asma', 'tatalaksana'],
    views: 1876
  },
  {
    id: '3',
    slug: 'webinar-ppok-desember-2024',
    title: 'Webinar PPOK: Update Tatalaksana Eksaserbasi Akut',
    excerpt: 'Webinar gratis untuk anggota membahas penanganan eksaserbasi akut PPOK dengan pembicara expert.',
    content: `PDPI akan menyelenggarakan webinar dengan topik "Update Tatalaksana Eksaserbasi Akut PPOK" pada 28 Desember 2024 pukul 19.00-21.00 WIB. Webinar ini gratis untuk seluruh anggota PDPI dan akan memberikan 4 SKP.

Pembicara webinar adalah Prof. Dr. dr. Suradi, Sp.P(K), yang merupakan expert di bidang PPOK. Webinar akan membahas guideline terbaru, algoritma penanganan, dan kasus-kasus challenging dalam penanganan eksaserbasi akut PPOK.

Pendaftaran dapat dilakukan melalui portal anggota mulai sekarang. Kapasitas terbatas untuk 500 peserta.`,
    image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800',
    category: 'kegiatan',
    author: 'Sekretariat PDPI',
    publishedAt: '2024-12-20T14:00:00Z',
    tags: ['webinar', 'ppok', 'skp'],
    views: 945
  },
  {
    id: '4',
    slug: 'penelitian-tb-resisten-obat',
    title: 'Penelitian PDPI: Angka TB Resisten Obat Meningkat',
    excerpt: 'Studi multicentre PDPI menunjukkan peningkatan kasus TB resisten obat di 15 kota besar Indonesia.',
    content: `Hasil penelitian multicentre yang dilakukan PDPI di 15 kota besar Indonesia menunjukkan peningkatan angka TB resisten obat sebesar 12% dalam dua tahun terakhir. Penelitian ini melibatkan 2.500 pasien TB dari berbagai rumah sakit rujukan.

Dr. dr. Erlina Burhan, MSc, Sp.P(K), ketua tim peneliti, menyatakan bahwa temuan ini menjadi alarm penting untuk meningkatkan kewaspadaan dan program deteksi dini TB resisten obat.

"Kami merekomendasikan peningkatan akses terhadap tes sensitivitas obat dan penguatan program DOTS-Plus di seluruh Indonesia," ujar Dr. Erlina.`,
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
    category: 'ilmiah',
    author: 'Dr. Erlina Burhan',
    publishedAt: '2024-12-10T09:00:00Z',
    tags: ['penelitian', 'tb', 'resisten-obat'],
    views: 1234
  },
  {
    id: '5',
    slug: 'pdpi-cabang-baru-ntt',
    title: 'Peresmian PDPI Cabang Nusa Tenggara Timur',
    excerpt: 'PDPI resmi membuka cabang baru di NTT untuk meningkatkan pelayanan respiratori di Indonesia Timur.',
    content: `Perhimpunan Dokter Paru Indonesia resmi meresmikan pembukaan cabang baru di Provinsi Nusa Tenggara Timur pada 5 Desember 2024. Peresmian dilakukan langsung oleh Ketua Umum PDPI dan Gubernur NTT.

Pembukaan cabang ini merupakan bagian dari komitmen PDPI untuk meratakan akses pelayanan kesehatan respiratori di seluruh Indonesia, khususnya wilayah Indonesia Timur yang masih memiliki keterbatasan tenaga spesialis paru.

PDPI Cabang NTT akan dipimpin oleh dr. Maria Angelica Parera, Sp.P dan beranggotakan 23 dokter spesialis paru yang tersebar di berbagai rumah sakit di NTT.`,
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800',
    category: 'umum',
    author: 'Humas PDPI',
    publishedAt: '2024-12-05T11:00:00Z',
    tags: ['cabang-baru', 'ntt', 'organisasi'],
    views: 678
  },
  {
    id: '6',
    slug: 'workshop-bronkoskopi-januari-2025',
    title: 'Workshop Bronkoskopi Tingkat Lanjut 2025',
    excerpt: 'Workshop hands-on bronkoskopi dengan simulasi dan praktik langsung untuk meningkatkan kompetensi.',
    content: `PDPI akan menyelenggarakan Workshop Bronkoskopi Tingkat Lanjut pada 15-17 Januari 2025 di Jakarta. Workshop ini dirancang untuk meningkatkan kompetensi dokter spesialis paru dalam prosedur bronkoskopi diagnostik dan terapeutik.

Workshop akan dipimpin oleh team bronkoskopi terbaik dari berbagai pusat pendidikan dan mencakup sesi hands-on dengan simulator, live demonstration, dan supervised practice. Peserta akan mendapatkan 12 SKP setelah menyelesaikan seluruh rangkaian workshop.

Kuota terbatas untuk 30 peserta. Registrasi dibuka mulai 23 Desember 2024.`,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    category: 'kegiatan',
    author: 'Komite Pendidikan PDPI',
    publishedAt: '2024-12-18T13:00:00Z',
    tags: ['workshop', 'bronkoskopi', 'hands-on', 'skp'],
    views: 1567
  },
  {
    id: '7',
    slug: 'panduan-covid-19-update',
    title: 'Update Panduan Tatalaksana COVID-19 Varian Terbaru',
    excerpt: 'PDPI hadirkan update panduan menghadapi varian baru COVID-19 dengan pendekatan evidence-based.',
    content: `Seiring munculnya varian baru COVID-19, PDPI telah menerbitkan update panduan tatalaksana yang disesuaikan dengan kondisi terkini dan evidence-based medicine global.

Panduan update ini mencakup strategi pencegahan, diagnosis, dan tatalaksana pasien COVID-19 termasuk untuk kasus long COVID yang semakin banyak ditemukan.

Dr. dr. Erlina Burhan, MSc, Sp.P(K) sebagai ketua tim penyusun menekankan pentingnya kewaspadaan meskipun pandemi sudah mereda. "Kita harus tetap siap menghadapi kemungkinan lonjakan kasus," jelasnya.`,
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800',
    category: 'ilmiah',
    author: 'Tim COVID-19 PDPI',
    publishedAt: '2024-12-12T10:00:00Z',
    tags: ['covid-19', 'panduan', 'update'],
    views: 2134
  },
  {
    id: '8',
    slug: 'prestasi-anggota-award-internasional',
    title: 'Anggota PDPI Raih Penghargaan di Konferensi Internasional',
    excerpt: 'Dr. Andi Prasetyo meraih Best Paper Award di Asian Pacific Congress on Respirology 2024.',
    content: `Dr. Andi Prasetyo, Sp.P(K) dari RSUP Dr. Sardjito Yogyakarta berhasil meraih Best Paper Award pada Asian Pacific Congress on Respirology (APCoR) 2024 yang diselenggarakan di Tokyo, Jepang.

Penelitiannya yang berjudul "Novel Biomarker for Early Detection of Acute Exacerbation in COPD Patients" mendapat apresiasi tinggi dari juri internasional.

Ketua Umum PDPI menyampaikan apresiasi atas prestasi luar biasa ini yang mengharumkan nama Indonesia di kancah internasional.`,
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800',
    category: 'prestasi',
    author: 'Humas PDPI',
    publishedAt: '2024-11-28T15:00:00Z',
    tags: ['prestasi', 'award', 'internasional'],
    views: 892
  }
]

// Export functions untuk API
export function getAllBerita(): BeritaItem[] {
  return beritaItems.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getBeritaBySlug(slug: string): BeritaItem | undefined {
  return beritaItems.find(item => item.slug === slug)
}

export function getBeritaByCategory(category: string): BeritaItem[] {
  return beritaItems.filter(item => item.category === category)
}

export function searchBerita(query: string): BeritaItem[] {
  const lowerQuery = query.toLowerCase()
  return beritaItems.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.excerpt.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

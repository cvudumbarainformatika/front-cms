/**
 * Dummy Data: Direktori Rumah Sakit
 * Data rumah sakit, klinik, dan institusi dengan layanan respirologi
 */

import type { DirektoriItem } from '../../app/types/content'

export const direktoriItems: DirektoriItem[] = [
  {
    id: '1',
    name: 'RSUP Persahabatan',
    type: 'rumah_sakit',
    address: 'Jl. Persahabatan Raya No. 1',
    phone: '021-4891708',
    email: 'info@rsuppersahabatan.co.id',
    website: 'https://rsuppersahabatan.co.id',
    city: 'Jakarta Timur',
    province: 'DKI Jakarta',
    hasRespirologist: true,
    facilities: ['Poliklinik Paru', 'IGD', 'ICU Respirologi', 'Bronkoskopi', 'Spirometri']
  },
  {
    id: '2',
    name: 'RS Paru Dr. M. Goenawan Partowidigdo',
    type: 'rumah_sakit',
    address: 'Jl. Prof. Dr. Soeharso No. 28',
    phone: '024-6711343',
    email: 'rsparu@smg.com',
    city: 'Semarang',
    province: 'Jawa Tengah',
    hasRespirologist: true,
    facilities: ['Poliklinik TB-DOTS', 'Bronkoskopi', 'Spirometri', 'Thoracoscopy']
  },
  {
    id: '3',
    name: 'RSUP Dr. Sardjito',
    type: 'rumah_sakit',
    address: 'Jl. Kesehatan No. 1',
    phone: '0274-587333',
    website: 'https://sardjito.co.id',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    hasRespirologist: true,
    facilities: ['Divisi Respirologi', 'ICU', 'Bronkoskopi', 'Sleep Study']
  },
  {
    id: '4',
    name: 'RSUP Dr. Soetomo',
    type: 'rumah_sakit',
    address: 'Jl. Mayjen Prof. Dr. Moestopo No. 6-8',
    phone: '031-5501078',
    website: 'https://rsud sotomo.jatimprov.go.id',
    city: 'Surabaya',
    province: 'Jawa Timur',
    hasRespirologist: true,
    facilities: ['Departemen Pulmonologi', 'ICU CVCU', 'Bronkoskopi', 'EBUS']
  },
  {
    id: '5',
    name: 'RS Paru Dr. H.A. Rotinsulu',
    type: 'rumah_sakit',
    address: 'Jl. Rumah Sakit Paru No. 2',
    phone: '021-4244871',
    city: 'Bandung',
    province: 'Jawa Barat',
    hasRespirologist: true,
    facilities: ['Poli TB MDR', 'Bronkoskopi', 'Spirometri', 'Rehabilitasi Paru']
  },
  {
    id: '6',
    name: 'RSUP H. Adam Malik',
    type: 'rumah_sakit',
    address: 'Jl. Bunga Lau No. 17',
    phone: '061-8360051',
    website: 'https://rshamadanmalik.co.id',
    city: 'Medan',
    province: 'Sumatera Utara',
    hasRespirologist: true,
    facilities: ['Divisi Pulmonologi', 'ICU', 'Bronkoskopi', 'Sleep Lab']
  },
  {
    id: '7',
    name: 'RSUP Dr. M. Djamil',
    type: 'rumah_sakit',
    address: 'Jl. Perintis Kemerdekaan',
    phone: '0751-37771',
    city: 'Padang',
    province: 'Sumatera Barat',
    hasRespirologist: true,
    facilities: ['Poli Paru', 'Bronkoskopi', 'Spirometri']
  },
  {
    id: '8',
    name: 'RSUP Dr. Wahidin Sudirohusodo',
    type: 'rumah_sakit',
    address: 'Jl. Perintis Kemerdekaan KM. 11',
    phone: '0411-510461',
    website: 'https://rswahidin.makassar.go.id',
    city: 'Makassar',
    province: 'Sulawesi Selatan',
    hasRespirologist: true,
    facilities: ['Bagian Pulmonologi', 'ICU', 'Bronkoskopi']
  },
  {
    id: '9',
    name: 'RSUP Sanglah',
    type: 'rumah_sakit',
    address: 'Jl. Diponegoro',
    phone: '0361-227911',
    website: 'https://sanglahhospital.com',
    city: 'Denpasar',
    province: 'Bali',
    hasRespirologist: true,
    facilities: ['SMF Paru', 'ICU', 'Bronkoskopi', 'Sleep Disorder Clinic']
  },
  {
    id: '10',
    name: 'Klinik Respirasi Prima',
    type: 'klinik',
    address: 'Jl. Gatot Subroto No. 123',
    phone: '021-5200987',
    email: 'info@respirasiprima.com',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    hasRespirologist: true,
    facilities: ['Konsultasi Paru', 'Spirometri', 'Nebulizer']
  }
]

// Helper functions
export function getAllDirektori(): DirektoriItem[] {
  return direktoriItems
}

export function getDirektoriByProvince(province: string): DirektoriItem[] {
  return direktoriItems.filter(item => item.province === province)
}

export function getDirektoriByCity(city: string): DirektoriItem[] {
  return direktoriItems.filter(item => item.city === city)
}

export function getDirektoriByType(type: string): DirektoriItem[] {
  return direktoriItems.filter(item => item.type === type)
}

export function searchDirektori(query: string): DirektoriItem[] {
  const lowerQuery = query.toLowerCase()
  return direktoriItems.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.city.toLowerCase().includes(lowerQuery) ||
    item.province.toLowerCase().includes(lowerQuery)
  )
}

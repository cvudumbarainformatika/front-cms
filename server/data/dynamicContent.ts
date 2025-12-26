export interface DynamicContentItem {
  slug: string // e.g. 'tentang-kami' or 'profil/visi-misi'
  title: string
  description?: string
  body?: string // markdown
  html?: string // optional HTML (WYSIWYG)
  date?: string // ISO date
  image?: { src: string }
  authors?: Array<{ name: string; to?: string; avatar?: { src: string } }>
  badge?: { label: string }
}

// In-memory storage
// WARNING: Data akan hilang setiap restart dev server
// Untuk production, gunakan database (PostgreSQL, MongoDB, dll)
export const dynamicContents: DynamicContentItem[] = []

// Debug: log semua konten saat diimpor
console.log('[Dynamic Content] Storage initialized. Current items:', dynamicContents.length)

export function upsertDynamicContent(item: DynamicContentItem) {
  const idx = dynamicContents.findIndex(c => c.slug === item.slug)
  if (idx !== -1) dynamicContents[idx] = item
  else dynamicContents.push(item)
  return item
}

export function getDynamicContent(slug: string) {
  return dynamicContents.find(c => c.slug === slug)
}

export function listDynamicContents() {
  return dynamicContents
}

# ⚠️ PENTING: Data Konten Dinamis (In-Memory)

## Status Saat Ini
- Konten dinamis disimpan di **in-memory array** (`server/data/dynamicContent.ts`)
- **Data akan hilang setiap restart dev server**

## Cara Uji
1. Edit konten di `/dashboard/admin/konten/editor/profil/visi-misi`
2. Simpan (klik tombol Simpan)
3. Cek console terminal untuk log: `[Dynamic Content] Saved: ...`
4. Buka `/profil/visi-misi` di tab baru - konten harus muncul
5. **JANGAN restart dev server** kalau mau konten tetap ada

## Solusi untuk Production
Untuk production, ganti in-memory storage dengan database:
- PostgreSQL + Prisma
- MongoDB + Mongoose
- Supabase
- Atau Nuxt Content (file-based CMS)

## Debugging
Jika konten tidak muncul di `/profil/visi-misi`:
1. Cek console terminal untuk log:
   - `[Dynamic Content] Saved: { slug: 'profil/visi-misi', ... }`
   - `[Dynamic Content GET] Looking for slug: profil/visi-misi`
   - `[Dynamic Content GET] Found: Yes ...`
2. Pastikan slug konsisten (tanpa leading slash)
3. Pastikan tidak restart dev server setelah simpan

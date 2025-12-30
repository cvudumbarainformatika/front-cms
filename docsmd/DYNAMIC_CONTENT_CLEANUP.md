# Dynamic Content System - Cleanup Static Pages

## Yang sudah dihapus:
- ✅ `app/pages/profil/visi-misi.vue` → Sekarang menggunakan dynamic content system via `[...slug].vue`

## Cara kerja sekarang:
1. Buat menu dinamis di `/dashboard/admin/konten/menu` dengan path `/profil/visi-misi`
2. Klik "Buat/Edit Konten" untuk mengisi kontennya
3. Halaman `/profil/visi-misi` akan otomatis dihandle oleh `[...slug].vue`
4. Konten ditarik dari `/api/dynamic-content/profil/visi-misi`

## File static lain di folder profil:
Jika ada file Vue lain di `app/pages/profil/` yang ingin dijadikan dinamis, hapus file tersebut agar menggunakan catch-all route.

## Catatan:
- Data konten dinamis disimpan **in-memory** (hilang saat restart dev server)
- Untuk production, ganti dengan database

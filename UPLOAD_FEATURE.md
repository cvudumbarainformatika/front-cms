# 📸 Upload Gambar - Implementasi Lengkap

## Fitur yang sudah dibuat:

### 1. Server API Upload (`server/api/upload.post.ts`)
✅ Endpoint: `POST /api/upload`
✅ Accept: multipart/form-data
✅ Validasi:
  - Tipe file: JPG, PNG, WEBP, GIF
  - Max size: 5MB
✅ Generate unique filename: `timestamp_hash_original.ext`
✅ Simpan di: `public/uploads/YYYY/MM/filename.ext`
✅ Return URL: `/uploads/2025/12/filename.jpg`

### 2. Editor Integration (`TiptapEditor.vue`)
✅ Tombol "Upload Image" di toolbar (icon image)
✅ File picker (accept image types)
✅ Upload progress indicator (loading icon)
✅ Toast notification:
  - Success: "Upload berhasil - filename"
  - Error: "Upload gagal - reason"
✅ Auto-insert image ke editor setelah upload

### 3. Storage & Git
✅ Folder: `public/uploads/`
✅ Structure: `uploads/YYYY/MM/filename.ext`
✅ .gitignore: ignore uploaded files, keep .gitkeep
✅ Files accessible via: `http://localhost:3000/uploads/...`

## Cara Pakai:

1. Buka editor konten
2. Klik tombol **Upload Image** (icon image di toolbar)
3. Pilih gambar dari komputer (max 5MB, JPG/PNG/WEBP/GIF)
4. Tunggu upload (icon berubah jadi loading)
5. Setelah berhasil:
   - Toast notification muncul
   - Gambar otomatis ter-insert di editor
6. Simpan konten, gambar akan muncul di halaman publik

## Tombol di Toolbar:
- **Upload Image** (icon image) → Upload dari komputer
- **Image URL** (icon link) → Insert image dari URL eksternal

## Migrasi ke Backend Go (Nanti):

Tinggal ubah endpoint di `handleImageUpload`:
```typescript
const response = await $fetch<any>('https://your-go-api.com/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

Response format tetap sama:
```json
{
  "success": true,
  "data": {
    "url": "/uploads/2025/12/filename.jpg",
    "filename": "...",
    "originalName": "...",
    "size": 123456,
    "type": "image/jpeg"
  }
}
```

## Testing:
1. Upload image kecil (< 5MB) → harus sukses
2. Upload image besar (> 5MB) → harus error dengan toast
3. Upload non-image file → harus error
4. Simpan konten dengan image → harus muncul di public page
5. Restart dev server → image tetap ada (karena di public/)

## Production Considerations:
- [ ] Resize/compress image sebelum simpan
- [ ] Generate thumbnail
- [ ] CDN untuk serve images
- [ ] Migrate ke S3/MinIO
- [ ] Rate limiting upload
- [ ] Virus scan uploaded files

# Fix Avatar Upload & Profile Update

## Masalah yang Diperbaiki

### Sebelumnya:
1. **Blob URL dikirim ke server** - `blob:http://localhost:3000/...` tidak valid di server
2. **Content-Type mismatch** - Mengirim JSON tapi Content-Type multipart/form-data
3. **Dummy implementation** - updateProfile hanya fake 500ms delay, tidak call API

### Sesudah:
✅ Blob URL hanya untuk UI preview (tidak dikirim ke server)  
✅ Support dua mode: JSON (tanpa avatar) dan FormData (dengan avatar)  
✅ Real API implementation dengan endpoint backend Go `/auth/profile` (PUT)

---

## Flow Implementasi

### 1. Frontend: app/pages/dashboard/profil/index.vue

```typescript
// State tambahan
const avatarFile = ref<File | null>(null)

// Handle file change
function onFileChange(e: Event) {
  const file = input.files[0]
  
  // Validasi ukuran (max 1MB)
  if (file.size > 1024 * 1024) return
  
  // Simpan file reference
  avatarFile.value = file
  
  // Preview HANYA dengan blob URL (tidak dikirim ke server)
  state.avatar = URL.createObjectURL(file)
}

// Submit form
async function onSaveProfile(event) {
  if (avatarFile.value) {
    // Ada file baru → kirim FormData
    const formData = new FormData()
    formData.append('name', event.data.name)
    formData.append('phone', event.data.phone || '')
    formData.append('address', event.data.address || '')
    formData.append('bio', event.data.bio || '')
    formData.append('avatar', avatarFile.value)
    
    await updateProfile(formData) // FormData
    avatarFile.value = null
  } else {
    // Tidak ada file baru → kirim JSON
    const profileData = {
      ...event.data,
      avatar: '' // Jangan kirim blob URL!
    }
    await updateProfile(profileData) // JSON
  }
}
```

### 2. Composable: app/composables/useAuth.ts

```typescript
const updateProfile = async (data: UpdateProfileData | FormData) => {
  const isFormData = data instanceof FormData
  
  const options: any = {
    method: 'PUT'
  }

  if (isFormData) {
    // FormData: browser auto-set Content-Type: multipart/form-data
    options.body = data
  } else {
    // JSON: default Content-Type: application/json
    options.body = data
  }

  const res = await $apiFetch<ApiResponse<User>>('/auth/profile', {
    ...options
  })

  // Update state dan localStorage dengan response
  if (res?.data) {
    authState.value.user = {
      ...authState.value.user,
      ...res.data
    }
    localStorage.setItem('auth_user', JSON.stringify(authState.value.user))
  }
}
```

### 3. Backend Go: /api/v1/auth/profile (PUT)

Handled oleh backend Go (melalui proxy `/auth/profile`):
- Menerima FormData atau JSON
- Validasi dan simpan file avatar
- Return updated user data

Backend Go sudah menghandle:
- File validation
- Avatar upload ke storage backend
- User profile update di database
- Response dengan user data terbaru

---

## File yang Diubah

### Modified:
- `app/components/DashboardHeader.vue` - Fix logout button (UDropdown + UMenu)
- `app/pages/dashboard/profil/index.vue` - Avatar handling & FormData support
- `app/composables/useAuth.ts` - Support FormData & JSON, endpoint `/auth/profile`

---

## Testing Checklist

- [ ] Update nama tanpa avatar → JSON request ke `/auth/profile`
- [ ] Update nama + avatar baru → FormData request ke `/auth/profile`
- [ ] Avatar file tersimpan di backend Go storage
- [ ] Avatar URL di-return dan disimpan di state
- [ ] Refresh halaman → avatar masih muncul (dari localStorage)
- [ ] Max 1MB validation works (frontend)
- [ ] Error handling untuk upload gagal
- [ ] Logout button bekerja dengan sempurna

---

## Key Points

1. **Blob URL ≠ Avatar Storage**
   - `blob:` URL hanya untuk browser preview
   - Tidak pernah dikirim ke server
   - Dihapus setelah page reload

2. **Dua Mode Request**
   - **FormData** (ada file): multipart/form-data
   - **JSON** (tanpa file): application/json

3. **File Storage**
   - Tersimpan di backend Go storage (lokasi ditentukan backend)
   - URL di-return oleh backend dalam response
   - Frontend menyimpan URL di state dan localStorage

4. **State Management**
   - Frontend state: avatar string (URL atau blob URL untuk preview)
   - Backend state: avatar URL dari database Go
   - localStorage: avatar URL dari response backend
   - Blob URL hanya temporary (di-refresh setiap kali page reload)

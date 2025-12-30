# Image URL Helper - Dokumentasi

## Overview

Helper `useImageUrl()` untuk menangani image URL dari backend dengan flexible dan robust.

## File
- `app/composables/useImageUrl.ts`

## Fungsi Utama

### 1. `getImageUrl(path?, placeholder?)`

Convert image path menjadi accessible URL.

**Parameters:**
- `path` - Image path dari backend (optional)
  - Full URL: `http://localhost:8080/api/v1/files/avatar/avatar_1.jpeg`
  - Relative path: `/api/v1/files/avatar/avatar_1.jpeg`
  - Filename: `avatar_1.jpeg`
- `placeholder` - Default placeholder jika path kosong (default: `/placeholder-avatar.png`)

**Returns:** Full URL yang siap digunakan di img src

**Examples:**
```typescript
const { getImageUrl } = useImageUrl()

// Full URL dari backend
getImageUrl('http://localhost:8080/api/v1/files/avatar/avatar_1.jpeg')
// → 'http://localhost:8080/api/v1/files/avatar/avatar_1.jpeg'

// Relative path
getImageUrl('/api/v1/files/avatar/avatar_1.jpeg')
// → 'http://localhost:3000/backend/api/v1/files/avatar/avatar_1.jpeg' (dengan proxy)

// Kosong - return placeholder
getImageUrl('')
// → '/placeholder-avatar.png'

// Custom placeholder
getImageUrl('', '/custom-placeholder.png')
// → '/custom-placeholder.png'
```

### 2. `isValidImageUrl(url?)`

Validasi jika image URL bisa di-load.

**Parameters:**
- `url` - URL untuk dicek

**Returns:** `true` jika URL valid format

**Examples:**
```typescript
isValidImageUrl('http://localhost:8080/api/v1/files/avatar/avatar_1.jpeg') // true
isValidImageUrl('/api/v1/files/avatar/avatar_1.jpeg') // true
isValidImageUrl('') // false
isValidImageUrl(undefined) // false
```

### 3. `getPlaceholder(type?)`

Get placeholder berdasarkan tipe.

**Parameters:**
- `type` - 'avatar' | 'banner' | 'default' (default: 'default')

**Returns:** Placeholder URL

**Examples:**
```typescript
getPlaceholder('avatar') // '/placeholder-avatar.png'
getPlaceholder('banner') // '/placeholder-banner.png'
getPlaceholder() // '/placeholder.png'
```

### 4. `getOptimizedImageUrl(path?, options?)`

Get image URL dengan optional optimization params (query strings).

**Parameters:**
- `path` - Image path
- `options` - Object dengan:
  - `width` - Image width
  - `height` - Image height
  - `quality` - Image quality

**Returns:** URL dengan query params

**Examples:**
```typescript
getOptimizedImageUrl('http://localhost:8080/api/v1/files/avatar/avatar_1.jpeg', {
  width: 200,
  height: 200,
  quality: 80
})
// → 'http://localhost:8080/api/v1/files/avatar/avatar_1.jpeg?w=200&h=200&q=80'
```

## Usage di Components

### Avatar Component
```vue
<script setup>
const { user } = useAuth()
const { getImageUrl } = useImageUrl()
</script>

<template>
  <UAvatar :src="getImageUrl(user?.avatar)" :alt="user?.name" />
</template>
```

### Image Component
```vue
<script setup>
const { getImageUrl } = useImageUrl()

const imageUrl = ref('http://localhost:8080/api/v1/files/avatar/avatar_1.jpeg')
</script>

<template>
  <img :src="getImageUrl(imageUrl)" alt="Profile" />
</template>
```

### Dengan Fallback
```vue
<script setup>
const { getImageUrl, getPlaceholder } = useImageUrl()

const imageUrl = ref('')
</script>

<template>
  <img :src="getImageUrl(imageUrl, getPlaceholder('avatar'))" alt="Avatar" />
</template>
```

## Component yang Sudah Updated

1. ✅ `app/components/DashboardHeader.vue`
   - Avatar di user menu menggunakan `getImageUrl()`

2. ✅ `app/components/PublicHeader.vue`
   - Avatar di user menu menggunakan `getImageUrl()`

3. ✅ `app/pages/dashboard/profil/index.vue`
   - Avatar preview menggunakan `getImageUrl()`

## Best Practices

1. **Always use getImageUrl()** untuk menampilkan image dari backend
   ```vue
   <!-- ❌ Jangan -->
   <img :src="user.avatar" />
   
   <!-- ✅ Lakukan -->
   <img :src="getImageUrl(user.avatar)" />
   ```

2. **Provide placeholder** untuk better UX
   ```vue
   <img :src="getImageUrl(user.avatar, '/placeholder.png')" />
   ```

3. **Validate URL** sebelum rendering jika perlu strict validation
   ```typescript
   if (isValidImageUrl(imageUrl)) {
     // Render image
   }
   ```

4. **Use optimized URL** untuk performa
   ```vue
   <img :src="getOptimizedImageUrl(user.avatar, { width: 200, height: 200 })" />
   ```

## Environment Variables

Helper menggunakan `runtimeConfig.public.apiBase` dari `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || '/backend'
    }
  }
})
```

Jika URL backend berubah, cukup update di `.env` atau `nuxt.config.ts`.

## Troubleshooting

### Image tidak muncul
1. Check di Network tab - apakah URL correct?
2. Check backend - apakah image file ada?
3. Check CORS - apakah backend allow cross-origin?

### CORS Error
Backend Go perlu tambah header:
```go
w.Header().Set("Access-Control-Allow-Origin", "*")
```

### 404 Not Found
1. Check backend storage path
2. Check URL format - apakah sesuai backend endpoint?
3. Check file exists - upload berhasil?

## Future Enhancements

- [ ] Image caching di localStorage
- [ ] Image compression before upload
- [ ] Multiple image formats support (WebP, AVIF)
- [ ] CDN integration

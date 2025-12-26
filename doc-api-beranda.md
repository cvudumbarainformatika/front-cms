# Dokumentasi API - Manajemen Konten Beranda

Dokumen ini menjelaskan endpoint API yang digunakan untuk mengelola konten di halaman depan (Beranda).

## Ringkasan API

Semua endpoint berada di bawah prefix `/api/homepage`.

| Endpoint        | Method | Middleware | Deskripsi                               |
| --------------- | ------ | ---------- | --------------------------------------- |
| `/api/homepage` | `GET`  | -          | Mengambil seluruh konten beranda        |
| `/api/homepage` | `POST` | `auth.ts`  | Memperbarui konten beranda (Admin Only) |

---

## 1. Ambil Konten Beranda

Mengambil data Hero, Statistik, Fitur, dan SEO.

- **URL:** `/api/homepage`
- **Method:** `GET`
- **Auth Required:** No

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "hero": {
      "title": "Perhimpunan Dokter Paru Indonesia",
      "description": "Organisasi profesi dokter spesialis paru...",
      "images": [
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
        "..."
      ]
    },
    "stats": [{ "label": "Anggota Aktif", "value": "2.500+" }, "..."],
    "features": [
      {
        "title": "Pendidikan Berkelanjutan",
        "description": "Program pelatihan, webinar...",
        "icon": "i-lucide-graduation-cap"
      },
      "..."
    ],
    "seo": {
      "title": "PDPI - Perhimpunan Dokter Paru Indonesia",
      "description": "Organisasi profesi dokter spesialis paru..."
    }
  }
}
```

---

## 2. Perbarui Konten Beranda

Memperbarui sebagian atau seluruh konten beranda.

- **URL:** `/api/homepage`
- **Method:** `POST`
- **Auth Required:** Yes (Admin Role)
- **Middleware:** `server/middleware/auth.ts`

### Security Headers

| Header          | Required | Value / Format                                              |
| --------------- | -------- | ----------------------------------------------------------- |
| `Authorization` | Yes      | `Bearer <token>` (Untuk simulasi: `Bearer dummy-token-xxx`) |
| `x-user-role`   | Yes      | `admin_pusat`, `admin_wilayah`, atau `admin_cabang`         |

### Request Body

Mengikuti struktur `HomepageData` (boleh parsial).

```json
{
  "hero": {
    "title": "Judul Baru",
    "description": "Deskripsi Baru",
    "images": ["url-gambar-1", "url-gambar-2"]
  },
  "stats": [...],
  "features": [...],
  "seo": {
    "title": "Meta Title Baru",
    "description": "Meta Description Baru"
  }
}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "data": { ... updated data ... },
  "message": "Konten beranda berhasil diperbarui"
}
```

### Response Error

- **401 Unauthorized**: Token tidak ada atau tidak valid.
- **403 Forbidden**: Role bukan admin.
- **400 Bad Request**: Body kosong atau data tidak valid.

---

## Type Definitions (Frontend Reference)

Data structure follows the `HomepageData` interface:

```typescript
export interface HomepageData {
  hero: {
    title: string;
    description: string;
    images: string[];
  };
  stats: Array<{ label: string; value: string }>;
  features: Array<{ title: string; description: string; icon: string }>;
  seo: {
    title: string;
    description: string;
  };
}
```

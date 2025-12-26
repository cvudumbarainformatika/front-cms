# Dummy Data & API Specification

Dokumentasi untuk semua dummy data dan spesifikasi API yang digunakan dalam development.

---

## API Endpoints

### 1. GET /api/menus

Mengambil semua menu atau filter by position.

**URL:** `/api/menus`  
**Method:** `GET`  
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| position | string | No | Filter: `header`, `sidebar`, `footer` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "home",
      "label": "Beranda",
      "slug": "beranda",
      "to": "/",
      "icon": "i-lucide-home",
      "parentId": null,
      "position": "header",
      "order": 1,
      "isActive": true,
      "roles": [
        "public",
        "member",
        "admin_cabang",
        "admin_wilayah",
        "admin_pusat"
      ],
      "children": []
    }
  ],
  "message": "Menus fetched successfully"
}
```

---

### 2. GET /api/menus/:position

Mengambil menu berdasarkan position.

**URL:** `/api/menus/{position}`  
**Method:** `GET`  
**Path Params:**
| Param | Type | Values |
|-------|------|--------|
| position | string | `header`, `sidebar`, `footer` |

**Response:** Sama dengan `/api/menus` tapi sudah difilter.

---

## Type Definitions

### MenuItem

```typescript
interface MenuItem {
  id: string;
  label: string;
  slug: string;
  to?: string;
  href?: string;
  icon?: string;
  parentId?: string | null;
  position: "header" | "sidebar" | "footer";
  order: number;
  isActive: boolean;
  roles: UserRole[];
  target?: "_blank" | "_self";
  children?: MenuItem[];
}
```

### UserRole

```typescript
type UserRole =
  | "public"
  | "member"
  | "admin_cabang"
  | "admin_wilayah"
  | "admin_pusat";
```

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  memberId?: string;
  organizationLevel?: "pusat" | "wilayah" | "cabang";
  branchId?: string;
  regionId?: string;
}
```

---

## Dummy Data

### Menu Header

| ID                | Label       | Path              | Icon                |
| ----------------- | ----------- | ----------------- | ------------------- |
| home              | Beranda     | /                 | i-lucide-home       |
| profile           | Profil      | /profil           | i-lucide-building-2 |
| profile-visi-misi | Visi & Misi | /profil/visi-misi | i-lucide-target     |
| profile-sejarah   | Sejarah     | /profil/sejarah   | i-lucide-history    |
| profile-pengurus  | Pengurus    | /profil/pengurus  | i-lucide-users      |
| profile-ad-art    | AD / ART    | /profil/ad-art    | i-lucide-file-text  |
| berita            | Berita      | /berita           | i-lucide-newspaper  |
| agenda            | Agenda      | /agenda           | i-lucide-calendar   |
| direktori         | Direktori   | /direktori        | i-lucide-map-pin    |

### Menu Sidebar (Dashboard)

| ID                   | Label          | Path                          | Roles             |
| -------------------- | -------------- | ----------------------------- | ----------------- |
| dashboard            | Dashboard      | /dashboard                    | member, admin\_\* |
| member-profile       | Profil Saya    | /dashboard/profil             | member, admin\_\* |
| documents            | Dokumen        | /dashboard/dokumen            | member, admin\_\* |
| documents-str        | STR            | /dashboard/dokumen/str        | member, admin\_\* |
| documents-sip        | SIP            | /dashboard/dokumen/sip        | member, admin\_\* |
| documents-sertifikat | Sertifikat     | /dashboard/dokumen/sertifikat | member, admin\_\* |
| skp                  | Rekap SKP      | /dashboard/skp                | member, admin\_\* |
| admin-members        | Kelola Anggota | /dashboard/admin/anggota      | admin\_\* only    |
| admin-content        | Kelola Konten  | /dashboard/admin/konten       | admin\_\* only    |
| admin-reports        | Laporan        | /dashboard/admin/laporan      | admin\_\* only    |

### Menu Footer

| ID             | Label              | Path               |
| -------------- | ------------------ | ------------------ |
| footer-kontak  | Kontak             | /kontak            |
| footer-privacy | Kebijakan Privasi  | /kebijakan-privasi |
| footer-terms   | Syarat & Ketentuan | /syarat-ketentuan  |

---

### Dummy Users (untuk testing login)

| Role          | Email                    | Name                    | NPA           |
| ------------- | ------------------------ | ----------------------- | ------------- |
| member        | anggota@pdpi.or.id       | Dr. Ahmad Respirologi   | PDPI-2024-001 |
| admin_cabang  | admin.cabang@pdpi.or.id  | Dr. Budi Admin Cabang   | PDPI-2020-042 |
| admin_wilayah | admin.wilayah@pdpi.or.id | Dr. Citra Admin Wilayah | PDPI-2018-015 |
| admin_pusat   | admin.pusat@pdpi.or.id   | Dr. Diana Admin Pusat   | PDPI-2015-003 |

---

### Dashboard Stats (Dummy)

```json
[
  { "label": "Total SKP", "value": "125", "icon": "i-lucide-award" },
  { "label": "Sertifikat", "value": "8", "icon": "i-lucide-file-badge" },
  {
    "label": "Status STR",
    "value": "Aktif",
    "description": "Berlaku s/d Des 2025"
  },
  {
    "label": "Status SIP",
    "value": "Aktif",
    "description": "Berlaku s/d Mar 2026"
  }
]
```

### Upcoming Events (Dummy)

```json
[
  {
    "title": "Webinar Tatalaksana PPOK 2024",
    "date": "28 Des 2024",
    "type": "webinar",
    "skp": 4
  },
  {
    "title": "Workshop Bronkoskopi",
    "date": "15 Jan 2025",
    "type": "workshop",
    "skp": 8
  },
  {
    "title": "Kongres Nasional PDPI",
    "date": "20-22 Feb 2025",
    "type": "kongres",
    "skp": 25
  }
]
```

### Notifications (Dummy)

```json
[
  {
    "title": "Iuran Tahunan 2025",
    "message": "Pembayaran iuran tahunan akan jatuh tempo pada 31 Januari 2025",
    "type": "warning"
  },
  {
    "title": "STR Akan Berakhir",
    "message": "STR Anda akan berakhir dalam 12 bulan. Segera persiapkan perpanjangan.",
    "type": "info"
  }
]
```

---

## File Lokasi Dummy Data

| File                            | Deskripsi                         |
| ------------------------------- | --------------------------------- |
| `server/data/menus.ts`          | Data menu header, sidebar, footer |
| `app/composables/useAuth.ts`    | Dummy users untuk testing         |
| `app/pages/dashboard/index.vue` | Stats, events, notifications      |

---

## API Endpoints Fase 2 (Halaman Publik)

### 3. GET /api/profil

Mengambil data profil organisasi (visi misi, sejarah, AD/ART).

**URL:** `/api/profil`  
**Method:** `GET`  
**Query Params:** Tidak ada

**Response:**
```json
{
  "success": true,
  "data": {
    "visiMisi": {
      "visi": "Menjadi organisasi profesi dokter spesialis paru terkemuka...",
      "misi": ["...", "..."]
    },
    "sejarah": {
      "content": "Sejarah panjang PDPI...",
      "timeline": [
        { "year": "1972", "title": "Pendirian PDPI", "description": "..." }
      ]
    },
    "adArt": {
      "title": "AD/ART PDPI",
      "url": "/documents/ad-art-pdpi-2023.pdf",
      "lastUpdated": "2023-11-15"
    }
  }
}
```

---

### 4. GET /api/berita

Mengambil list berita dengan pagination dan filter.

**URL:** `/api/berita`  
**Method:** `GET`  
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Default: 1 |
| limit | number | No | Default: 9 |
| category | string | No | Filter: `umum`, `ilmiah`, `kegiatan`, `pengumuman`, `prestasi` |
| search | string | No | Search by title, excerpt, tags |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "slug": "kongres-nasional-pdpi-2024",
        "title": "Kongres Nasional PDPI 2024...",
        "excerpt": "Kongres Nasional...",
        "content": "Full content...",
        "image": "https://...",
        "category": "kegiatan",
        "author": "Tim Redaksi PDPI",
        "publishedAt": "2024-11-23T10:00:00Z",
        "tags": ["kongres", "kegiatan"],
        "views": 2543
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 9,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

---

### 5. GET /api/berita/:slug

Mengambil detail berita berdasarkan slug.

**URL:** `/api/berita/{slug}`  
**Method:** `GET`  
**Path Params:**
| Param | Type | Required |
|-------|------|----------|
| slug | string | Yes |

**Response:** Object BeritaItem atau 404 error

---

### 6. GET /api/agenda

Mengambil list agenda dengan filter.

**URL:** `/api/agenda`  
**Method:** `GET`  
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Default: 1 |
| limit | number | No | Default: 12 |
| upcoming | boolean | No | Filter upcoming events only |
| type | string | No | Filter: `webinar`, `workshop`, `seminar`, `kongres`, `pelatihan` |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "slug": "webinar-ppok-desember-2024",
        "title": "Webinar: Update Tatalaksana...",
        "description": "...",
        "type": "webinar",
        "date": "2024-12-28T19:00:00Z",
        "location": "Online via Zoom",
        "isOnline": true,
        "skp": 4,
        "quota": 500,
        "registered": 342,
        "registrationUrl": "...",
        "fee": "Gratis untuk anggota"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 7. GET /api/pengurus

Mengambil data pengurus organisasi.

**URL:** `/api/pengurus`  
**Method:** `GET`  
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| level | string | No | Filter: `pusat`, `wilayah`, `cabang` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Prof. Dr. dr. Agus Dwi Susanto, Sp.P(K)",
      "position": "Ketua Umum",
      "bidang": "Ketua",
      "level": "pusat",
      "periode": "2023-2026",
      "email": "ketua@pdpi.or.id"
    }
  ]
}
```

---

### 8. GET /api/direktori

Mengambil data direktori rumah sakit/klinik.

**URL:** `/api/direktori`  
**Method:** `GET`  
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Default: 1 |
| limit | number | No | Default: 20 |
| province | string | No | Filter by province |
| type | string | No | Filter: `rumah_sakit`, `klinik`, `instansi`, `laboratorium` |
| search | string | No | Search by name, city, province |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "name": "RSUP Persahabatan",
        "type": "rumah_sakit",
        "address": "Jl. Persahabatan Raya No. 1",
        "phone": "021-4891708",
        "city": "Jakarta Timur",
        "province": "DKI Jakarta",
        "hasRespirologist": true,
        "facilities": ["Poliklinik Paru", "ICU Respirologi"]
      }
    ],
    "pagination": { ... }
  }
}
```

---

## Dummy Data Fase 2

### Berita (8 items)

| ID | Slug | Title | Category |
|----|------|-------|----------|
| 1 | kongres-nasional-pdpi-2024 | Kongres Nasional PDPI 2024... | kegiatan |
| 2 | pedoman-tatalaksana-asma-2024 | PDPI Terbitkan Pedoman... | ilmiah |
| 3 | webinar-ppok-desember-2024 | Webinar PPOK: Update... | kegiatan |
| 4 | penelitian-tb-resisten-obat | Penelitian PDPI: Angka TB... | ilmiah |
| 5 | pdpi-cabang-baru-ntt | Peresmian PDPI Cabang NTT | umum |
| 6 | workshop-bronkoskopi-januari-2025 | Workshop Bronkoskopi... | kegiatan |
| 7 | panduan-covid-19-update | Update Panduan COVID-19... | ilmiah |
| 8 | prestasi-anggota-award-internasional | Anggota PDPI Raih... | prestasi |

### Agenda (9 items)

| ID | Title | Type | Date | SKP |
|----|-------|------|------|-----|
| 1 | Webinar: Update Tatalaksana Eksaserbasi Akut PPOK | webinar | 28 Des 2024 | 4 |
| 2 | Workshop Bronkoskopi Tingkat Lanjut | workshop | 15-17 Jan 2025 | 12 |
| 3 | Kongres Nasional PDPI ke-29 | kongres | 18-20 Nov 2025 | 25 |
| 4 | Webinar: Personalized Medicine in Asthma | webinar | 10 Jan 2025 | 4 |
| 5 | Pelatihan Spirometri dan Interpretasi | pelatihan | 8-9 Feb 2025 | 8 |
| 6 | Seminar National TB Control Program | seminar | 15 Mar 2025 | 6 |
| 7 | Webinar: Advances in Lung Cancer Treatment | webinar | 20 Feb 2025 | 4 |
| 8 | Workshop Respiratory Critical Care | workshop | 10-12 Apr 2025 | 12 |
| 9 | Webinar: Pulmonary Rehabilitation | webinar | 25 Mar 2025 | 4 |

### Pengurus (15 items)

**Pengurus Pusat:**
- Ketua Umum: Prof. Dr. dr. Agus Dwi Susanto, Sp.P(K)
- Wakil Ketua: Dr. dr. Faisal Yunus, Sp.P(K), MARS, FISR
- Sekjen: Dr. dr. Erlina Burhan, MSc, Sp.P(K)
- Bendahara: dr. Budhi Antariksa, Sp.P(K)
- Bidang Pendidikan, Penelitian, Organisasi, Humas

**Pengurus Wilayah:** Jawa Barat, Jawa Tengah, Jawa Timur, Sumatera Utara

**Pengurus Cabang:** Jakarta Selatan, Bandung, Surabaya

### Direktori (10 items)

| ID | Name | Type | City | Province |
|----|------|------|------|----------|
| 1 | RSUP Persahabatan | rumah_sakit | Jakarta Timur | DKI Jakarta |
| 2 | RS Paru Dr. M. Goenawan | rumah_sakit | Semarang | Jawa Tengah |
| 3 | RSUP Dr. Sardjito | rumah_sakit | Yogyakarta | DI Yogyakarta |
| 4 | RSUP Dr. Soetomo | rumah_sakit | Surabaya | Jawa Timur |
| 5 | RS Paru Dr. H.A. Rotinsulu | rumah_sakit | Bandung | Jawa Barat |
| 6 | RSUP H. Adam Malik | rumah_sakit | Medan | Sumatera Utara |
| 7 | RSUP Dr. M. Djamil | rumah_sakit | Padang | Sumatera Barat |
| 8 | RSUP Dr. Wahidin Sudirohusodo | rumah_sakit | Makassar | Sulawesi Selatan |
| 9 | RSUP Sanglah | rumah_sakit | Denpasar | Bali |
| 10 | Klinik Respirasi Prima | klinik | Jakarta Selatan | DKI Jakarta |

---

## File Lokasi Dummy Data Fase 2

| File | Deskripsi |
|------|-----------|
| `server/data/profil.ts` | Visi misi, sejarah, AD/ART |
| `server/data/berita.ts` | 8 artikel berita berbagai kategori |
| `server/data/agenda.ts` | 9 agenda webinar, workshop, kongres |
| `server/data/pengurus.ts` | Struktur pengurus pusat, wilayah, cabang |
| `server/data/direktori.ts` | 10 rumah sakit dan klinik |


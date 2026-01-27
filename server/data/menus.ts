/**
 * Menu Dummy Data
 * Data menu statis untuk development sebelum integrasi backend
 */

import type { MenuItem } from '../types/menu'

/**
 * Menu Header untuk halaman publik
 */
export const headerMenus: MenuItem[] = [
  {
    id: 'home',
    label: 'Beranda',
    slug: 'beranda',
    to: '/',
    icon: 'i-lucide-home',
    parentId: null,
    position: 'header',
    order: 1,
    isActive: true,
    isFixed: true,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'profile',
    label: 'Profil',
    slug: 'profil',
    to: '/profil',
    icon: 'i-lucide-building-2',
    parentId: null,
    position: 'header',
    order: 2,
    isActive: true,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat'],
    children: [
      {
        id: 'profile-visi-misi',
        label: 'Visi & Misi',
        slug: 'visi-misi',
        to: '/profil/visi-misi',
        icon: 'i-lucide-target',
        parentId: 'profile',
        position: 'header',
        order: 1,
        isActive: true,
        roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
      },
      {
        id: 'profile-sejarah',
        label: 'Sejarah',
        slug: 'sejarah',
        to: '/profil/sejarah',
        icon: 'i-lucide-history',
        parentId: 'profile',
        position: 'header',
        order: 2,
        isActive: true,
        roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
      },
      {
        id: 'profile-pengurus',
        label: 'Pengurus',
        slug: 'pengurus',
        to: '/profil/pengurus',
        icon: 'i-lucide-users',
        parentId: 'profile',
        position: 'header',
        order: 3,
        isActive: true,
        roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
      },
      {
        id: 'profile-ad-art',
        label: 'AD / ART',
        slug: 'ad-art',
        to: '/profil/ad-art',
        icon: 'i-lucide-file-text',
        parentId: 'profile',
        position: 'header',
        order: 4,
        isActive: true,
        roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
      }
    ]
  },
  {
    id: 'berita',
    label: 'Berita',
    slug: 'berita',
    to: '/berita',
    icon: 'i-lucide-newspaper',
    parentId: null,
    position: 'header',
    order: 3,
    isActive: true,
    isFixed: true,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'agenda',
    label: 'Agenda',
    slug: 'agenda',
    to: '/agenda',
    icon: 'i-lucide-calendar',
    parentId: null,
    position: 'header',
    order: 4,
    isActive: true,
    isFixed: true,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'direktori',
    label: 'Direktori',
    slug: 'direktori',
    to: '/direktori',
    icon: 'i-lucide-map-pin',
    parentId: null,
    position: 'header',
    order: 5,
    isActive: true,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  }
]

/**
 * Menu Sidebar untuk Dashboard
 */
export const sidebarMenus: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    slug: 'dashboard',
    to: '/dashboard',
    icon: 'i-lucide-layout-dashboard',
    parentId: null,
    position: 'sidebar',
    order: 1,
    isActive: true,
    roles: ['member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  // {
  //   id: 'member-profile',
  //   label: 'Profile',
  //   slug: 'profil-saya',
  //   to: '/dashboard/profil',
  //   icon: 'i-lucide-user',
  //   parentId: null,
  //   position: 'sidebar',
  //   order: 2,
  //   isActive: true,
  //   roles: ['member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  // },
  {
    id: 'member-profile',
    label: 'Profile',
    slug: 'profile-saya',
    to: '/dashboard/profil',
    icon: 'i-lucide-file-edit',
    parentId: null,
    position: 'sidebar',
    order: 2,
    isActive: true,
    roles: ['member', 'admin_cabang', 'admin_wilayah', 'admin_pusat'],
    children: [
      {
        id: 'profile-saya',
        label: 'Profile',
        slug: 'beranda',
        to: '/dashboard/profil',
        icon: 'i-lucide-home',
        parentId: 'admin-content',
        position: 'sidebar',
        order: 0,
        isActive: true,
        isFixed: true,
        roles: ['member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
      },
      {
        id: 'profile-security',
        label: 'Security',
        slug: 'berita',
        to: '/dashboard/profil/security',
        icon: 'i-lucide-newspaper',
        parentId: 'admin-content',
        position: 'sidebar',
        order: 1,
        isActive: true,
        isFixed: true,
        roles: ['member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
      }
    ]
  },
  {
    id: 'documents',
    label: 'Dokumen',
    slug: 'dokumen',
    to: '/dashboard/dokumen',
    icon: 'i-lucide-folder-open',
    parentId: null,
    position: 'sidebar',
    order: 3,
    isActive: true,
    roles: ['member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'skp',
    label: 'Rekap SKP',
    slug: 'skp',
    to: '/dashboard/skp',
    icon: 'i-lucide-badge-check',
    parentId: null,
    position: 'sidebar',
    order: 4,
    isActive: true,
    roles: ['member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'admin-divider',
    label: 'Administrasi',
    slug: 'admin-divider',
    icon: 'i-lucide-settings',
    parentId: null,
    position: 'sidebar',
    order: 10,
    isActive: true,
    roles: ['admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'admin-members',
    label: 'Kelola Anggota',
    slug: 'kelola-anggota',
    to: '/dashboard/admin/anggota',
    icon: 'i-lucide-users',
    parentId: null,
    position: 'sidebar',
    order: 11,
    isActive: true,
    roles: ['admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'admin-content',
    label: 'Kelola Konten',
    slug: 'kelola-konten',
    to: '/dashboard/admin/konten',
    icon: 'i-lucide-file-edit',
    parentId: null,
    position: 'sidebar',
    order: 12,
    isActive: true,
    roles: ['admin_cabang', 'admin_wilayah', 'admin_pusat'],
    children: [
      {
        id: 'admin-content-beranda',
        label: 'Beranda',
        slug: 'beranda',
        to: '/dashboard/admin/konten/beranda',
        icon: 'i-lucide-home',
        parentId: 'admin-content',
        position: 'sidebar',
        order: 0,
        isActive: true,
        isFixed: true,
        roles: ['admin_cabang', 'admin_wilayah', 'admin_pusat']
      },
      {
        id: 'admin-content-berita',
        label: 'Berita',
        slug: 'berita',
        to: '/dashboard/admin/konten/berita',
        icon: 'i-lucide-newspaper',
        parentId: 'admin-content',
        position: 'sidebar',
        order: 1,
        isActive: true,
        isFixed: true,
        roles: ['admin_cabang', 'admin_wilayah', 'admin_pusat']
      },
      {
        id: 'admin-content-agenda',
        label: 'Agenda',
        slug: 'agenda',
        to: '/dashboard/admin/konten/agenda',
        icon: 'i-lucide-calendar',
        parentId: 'admin-content',
        position: 'sidebar',
        order: 2,
        isActive: true,
        isFixed: true,
        roles: ['admin_cabang', 'admin_wilayah', 'admin_pusat']
      },
      {
        id: 'admin-content-menu',
        label: 'Menu Navigasi',
        slug: 'menu',
        to: '/dashboard/admin/konten/menu',
        icon: 'i-lucide-menu',
        parentId: 'admin-content',
        position: 'sidebar',
        order: 3,
        isActive: true,
        roles: ['admin_pusat']
      }
    ]
  },
  {
    id: 'admin-reports',
    label: 'Laporan',
    slug: 'laporan',
    to: '/dashboard/admin/laporan',
    icon: 'i-lucide-bar-chart-3',
    parentId: null,
    position: 'sidebar',
    order: 13,
    isActive: true,
    roles: ['admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'admin-pdpi-sync',
    label: 'Sync PDPI',
    slug: 'pdpi-sync',
    to: '/dashboard/admin/pdpi-sync',
    icon: 'i-lucide-refresh-cw',
    parentId: null,
    position: 'sidebar',
    order: 14,
    isActive: true,
    roles: ['admin_pusat']
  }
]

/**
 * Menu Footer
 */
export const footerMenus: MenuItem[] = [
  {
    id: 'footer-kontak',
    label: 'Kontak',
    slug: 'kontak',
    to: '/kontak',
    icon: 'i-lucide-mail',
    parentId: null,
    position: 'footer',
    order: 1,
    isActive: true,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'footer-privacy',
    label: 'Kebijakan Privasi',
    slug: 'kebijakan-privasi',
    to: '/kebijakan-privasi',
    icon: 'i-lucide-shield',
    parentId: null,
    position: 'footer',
    order: 2,
    isActive: true,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  },
  {
    id: 'footer-terms',
    label: 'Syarat & Ketentuan',
    slug: 'syarat-ketentuan',
    to: '/syarat-ketentuan',
    icon: 'i-lucide-file-text',
    parentId: null,
    position: 'footer',
    order: 3,
    isActive: true,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat']
  }
]

/**
 * Gabungan semua menu
 */
export const allMenus: MenuItem[] = [
  ...headerMenus,
  ...sidebarMenus,
  ...footerMenus
]

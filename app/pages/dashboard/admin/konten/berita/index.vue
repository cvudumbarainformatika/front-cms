<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })

import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()

const page = computed(() => parseInt(route.query.page as string) || 1)
const search = computed(() => route.query.search as string || '')
const status = computed(() => (route.query.status as string) || 'all')

// Fetch data from backend Go API
const { data, refresh, pending } = await useAsyncData(
  'berita-list',
  () => $apiFetch('/berita', {
    query: { 
      page: page.value, 
      limit: 10, 
      search: search.value, 
      status: status.value === 'all' ? undefined : status.value 
    }
  }),
  { 
    watch: [page, search, status]
  }
)

const rows = computed(() => [...(data.value?.data?.items || [])])

const columns: TableColumn<any>[] = [
  { accessorKey: 'title', header: 'Judul' },
  { accessorKey: 'category', header: 'Kategori' },
  { accessorKey: 'status', header: 'Status' },
  {
    accessorKey: 'published_at',
    header: 'Dipublish',
    cell: ({ row }) => row.original.published_at ? new Date(row.original.published_at).toLocaleString('id-ID') : '-'
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const UButton = resolveComponent('UButton')
      return h('div', { class: 'flex justify-end' }, [
        !row.original.deleted_at && h(UButton, { to: `/dashboard/admin/konten/berita/${row.original.id}`, icon: 'i-lucide-pencil', color: 'neutral', variant: 'ghost' }),
        !row.original.deleted_at && h(UButton, { icon: 'i-lucide-trash', color: 'error', variant: 'ghost', onClick: () => onDelete(row.original.id) }),
        row.original.deleted_at && h(UButton, { icon: 'i-lucide-rotate-ccw', color: 'primary', variant: 'ghost', onClick: () => onRestore(row.original.id) })
      ])
    }
  }
]

function setStatus(s: string) {
  router.push({ query: { ...route.query, status: s || undefined, page: undefined } })
}

async function onDelete(id: number) {
  if (!confirm('Hapus berita ini?')) return
  try {
    await $apiFetch(`/berita/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Berita berhasil dihapus', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Gagal menghapus berita', description: error.message, color: 'error' })
  }
}

async function onRestore(id: number) {
  try {
    await $apiFetch(`/berita/${id}`, { method: 'PATCH', body: { deleted_at: '' } })
    toast.add({ title: 'Berita berhasil dipulihkan', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Gagal memulihkan berita', description: error.message, color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Kelola Berita</h1>
        <p class="text-muted">Buat, edit, dan publish berita</p>
      </div>
      <UButton to="/dashboard/admin/konten/berita/baru" icon="i-lucide-plus" label="Berita Baru" />
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-wrap gap-3 items-center justify-between">
          <div class="flex gap-2">
            <UButton :variant="status==='all'?'solid':'outline'" size="sm" @click="setStatus('all')">Semua</UButton>
            <UButton :variant="status==='draft'?'solid':'outline'" size="sm" @click="setStatus('draft')">Draft</UButton>
            <UButton :variant="status==='published'?'solid':'outline'" size="sm" @click="setStatus('published')">Published</UButton>
            <UButton :variant="status==='deleted'?'solid':'outline'" size="sm" color="neutral" @click="setStatus('deleted')">Deleted</UButton>
          </div>
          <UInput :model-value="search" placeholder="Cari..." icon="i-lucide-search" size="sm" @update:model-value="v=>router.push({ query: { ...route.query, search: v||undefined, page: undefined } })" />
        </div>
      </template>

      <ClientOnly>
        <div>
          <UTable :key="`${page}-${status}-${search}`" v-if="rows.length" :data="rows" :columns="columns">
            <template #title-data="{ row }">
              <div class="min-w-0">
                <p class="font-medium line-clamp-1">{{ row.title }}</p>
                <p class="text-xs text-muted line-clamp-1">/berita/{{ row.slug }}</p>
              </div>
            </template>
            <template #published_at-data="{ row }">
              <span class="text-xs">{{ row.published_at ? new Date(row.published_at).toLocaleString('id-ID') : '-' }}</span>
            </template>
            <template #actions-data="{ row }">
              <div class="flex gap-2">
                <UButton v-if="!row.deleted_at" :to="`/dashboard/admin/konten/berita/${row.id}`" icon="i-lucide-pencil" color="neutral" variant="ghost" />
                <UButton v-if="!row.deleted_at" icon="i-lucide-trash" color="error" variant="ghost" @click="onDelete(row.id)" />
                <UButton v-else icon="i-lucide-rotate-ccw" color="primary" variant="ghost" @click="onRestore(row.id)" />
              </div>
            </template>
          </UTable>
          <div v-else class="p-6 text-sm text-muted">Tidak ada data. Coba ubah filter Status (Semua/Draft/Published/Deleted) atau kosongkan pencarian.</div>
        </div>
      </ClientOnly>
    </UCard>
  </div>
</template>

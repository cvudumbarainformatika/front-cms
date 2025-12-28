<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })

import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const page = computed(() => parseInt(route.query.page as string) || 1)
const search = computed(() => route.query.search as string || '')
const status = computed(() => (route.query.status as string) || 'all')

const { data, refresh, pending } = await useFetch('/api/berita', {
  query: { page, limit: 10, search, status },
  watch: [page, search, status]
})

const rows = computed(() => [...(data.value?.data?.items || [])])

const columns: TableColumn<any>[] = [
  { accessorKey: 'title', header: 'Judul' },
  { accessorKey: 'category', header: 'Kategori' },
  { accessorKey: 'status', header: 'Status' },
  {
    accessorKey: 'publishedAt',
    header: 'Dipublish',
    cell: ({ row }) => row.original.publishedAt ? new Date(row.original.publishedAt).toLocaleString('id-ID') : '-'
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const UButton = resolveComponent('UButton')
      return h('div', { class: 'flex justify-end' }, [
        !row.original.deletedAt && h(UButton, { to: `/dashboard/admin/konten/berita/${row.original.id}`, icon: 'i-lucide-pencil', color: 'neutral', variant: 'ghost' }),
        !row.original.deletedAt && h(UButton, { icon: 'i-lucide-trash', color: 'error', variant: 'ghost', onClick: () => onDelete(row.original.id) }),
        row.original.deletedAt && h(UButton, { icon: 'i-lucide-rotate-ccw', color: 'primary', variant: 'ghost', onClick: () => onRestore(row.original.id) })
      ])
    }
  }
]

// console.log('rows', rows.value);


function setStatus(s: string) {
  router.push({ query: { ...route.query, status: s || undefined, page: undefined } })
}

async function onDelete(id: string) {
  if (!confirm('Hapus berita ini?')) return
  await $fetch(`/api/berita/${id}`, { method: 'DELETE' })
  toast.add({ title: 'Terhapus', color: 'success' })
  refresh()
}

async function onRestore(id: string) {
  await $fetch(`/api/berita/${id}`, { method: 'PATCH', body: { deletedAt: '' } })
  toast.add({ title: 'Dipulihkan', color: 'success' })
  refresh()
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
            <template #publishedAt-data="{ row }">
              <span class="text-xs">{{ row.publishedAt ? new Date(row.publishedAt).toLocaleString('id-ID') : '-' }}</span>
            </template>
            <template #actions-data="{ row }">
              <div class="flex gap-2">
                <UButton v-if="!row.deletedAt" :to="`/dashboard/admin/konten/berita/${row.id}`" icon="i-lucide-pencil" color="neutral" variant="ghost" />
                <UButton v-if="!row.deletedAt" icon="i-lucide-trash" color="error" variant="ghost" @click="onDelete(row.id)" />
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

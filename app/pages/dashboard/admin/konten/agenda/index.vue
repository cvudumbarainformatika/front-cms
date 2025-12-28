<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const page = computed(() => parseInt(route.query.page as string) || 1)
const search = computed(() => route.query.search as string || '')
const status = computed(() => (route.query.status as string) || 'all')

const { data, refresh } = await useFetch('/api/agenda', { query: { page, limit: 10, search, status } , watch: [page, search, status] })
const rows = computed(() => [...(data.value?.data?.items || [])])

const columns: TableColumn<any>[] = [
  { accessorKey: 'title', header: 'Judul' },
  { accessorKey: 'type', header: 'Jenis' },
  { accessorKey: 'date', header: 'Tanggal', cell: ({ row }) => new Date(row.original.date).toLocaleString('id-ID') },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: 'Aksi', cell: ({ row }) => {
    const UButton = resolveComponent('UButton')
    return h('div', { class: 'flex justify-end gap-2' }, [
      !row.original.deletedAt && h(UButton, { to: `/dashboard/admin/konten/agenda/${row.original.id}`, icon: 'i-lucide-pencil', color: 'neutral', variant: 'ghost' }),
      !row.original.deletedAt && h(UButton, { icon: 'i-lucide-trash', color: 'error', variant: 'ghost', onClick: () => onDelete(row.original.id) }),
      row.original.deletedAt && h(UButton, { icon: 'i-lucide-rotate-ccw', color: 'primary', variant: 'ghost', onClick: () => onRestore(row.original.id) }),
    ])
  }}
]

function setStatus(s: string) { router.push({ query: { ...route.query, status: s || undefined, page: undefined } }) }
async function onDelete(id: string) { if (!confirm('Hapus agenda ini?')) return; await $fetch(`/api/agenda/${id}`, { method: 'DELETE' }); toast.add({ title: 'Terhapus', color: 'success' }); refresh() }
async function onRestore(id: string) { await $fetch(`/api/agenda/${id}`, { method: 'PATCH', body: { deletedAt: '' } }); toast.add({ title: 'Dipulihkan', color: 'success' }); refresh() }
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Kelola Agenda</h1>
        <p class="text-muted">Buat, edit, dan publish agenda</p>
      </div>
      <UButton to="/dashboard/admin/konten/agenda/baru" icon="i-lucide-plus" label="Agenda Baru" />
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-wrap gap-3 items-center justify-between">
          <div class="flex gap-2">
            <UButton :variant="status==='all'?'solid':'outline'" size="sm" @click="setStatus('all')">Semua</UButton>
            <UButton :variant="status==='draft'?'solid':'outline'" size="sm" @click="setStatus('draft')">Draft</UButton>
            <UButton :variant="status==='published'?'solid':'outline'" size="sm" @click="setStatus('published')">Published</UButton>
            <UButton :variant="status==='deleted'?'solid':'outline'" size="sm" @click="setStatus('deleted')">Deleted</UButton>
          </div>
          <UInput :model-value="search" placeholder="Cari..." icon="i-lucide-search" size="sm" @update:model-value="v=>router.push({ query: { ...route.query, search: v||undefined, page: undefined } })" />
        </div>
      </template>

      <ClientOnly>
        <div>
          <UTable :key="`${page}-${status}-${search}`" :data="rows" :columns="columns" />
        </div>
      </ClientOnly>
    </UCard>
  </div>
</template>
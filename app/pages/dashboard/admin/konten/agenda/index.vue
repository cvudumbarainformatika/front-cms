<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()

const page = computed(() => parseInt(route.query.page as string) || 1)
const search = computed(() => route.query.search as string || '')
const status = computed(() => (route.query.status as string) || 'all')

// Fetch API
const { data, refresh, status: fetchStatus } = await useAsyncData(
  'admin-agenda-list',
  () => $apiFetch('/agenda', {
    query: {
      page: page.value,
      limit: 10,
      search: search.value || undefined,
      status: status.value !== 'all' ? status.value : undefined
    }
  }),
  {
    watch: [page, search, status],
    server: false
  }
)

const rows = computed(() => data.value?.data?.items || [])
const total = computed(() => data.value?.data?.pagination?.total || 0)

const columns: TableColumn<any>[] = [
  { accessorKey: 'title', header: 'Judul' },
  { accessorKey: 'type', header: 'Jenis' },
  { 
    accessorKey: 'date', 
    header: 'Tanggal', 
    cell: ({ row }: any) => new Date(row.original.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) 
  },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }: any) => h('span', { class: row.original.status === 'published' ? 'text-green-600' : 'text-gray-500' }, row.original.status)
  },
  { 
    id: 'actions', 
    header: 'Aksi', 
    cell: ({ row }: any) => {
      const UButton = resolveComponent('UButton')
      return h('div', { class: 'flex justify-end gap-2' }, [
        !row.original.deleted_at && h(UButton, { to: `/dashboard/admin/konten/agenda/${row.original.id}`, icon: 'i-lucide-pencil', color: 'neutral', variant: 'ghost' }),
        !row.original.deleted_at && h(UButton, { icon: 'i-lucide-trash', color: 'error', variant: 'ghost', onClick: () => onDelete(row.original.id) }),
        row.original.deleted_at && h(UButton, { icon: 'i-lucide-rotate-ccw', color: 'primary', variant: 'ghost', onClick: () => onRestore(row.original.id) }),
      ])
    }
  }
]

function setStatus(s: string) { 
  router.push({ query: { ...route.query, status: s || undefined, page: undefined } }) 
}

async function onDelete(id: string) { 
  if (!confirm('Hapus agenda ini?')) return; 
  try {
    await $apiFetch(`/agenda/${id}`, { method: 'DELETE' }); 
    toast.add({ title: 'Terhapus', color: 'success' }); 
    refresh()
  } catch (e: any) {
    toast.add({ title: 'Gagal menghapus', description: e.message, color: 'error' })
  }
}

async function onRestore(id: string) { 
  try {
    // Backend restore logic usually involves PATCH with specific intent, or we might need to implement /restore endpoint.
    // Based on BeritaController, PATCH with deleted_at = "" restores it.
    await $apiFetch(`/agenda/${id}`, { method: 'PATCH', body: { deleted_at: '' } }); 
    toast.add({ title: 'Dipulihkan', color: 'success' }); 
    refresh() 
  } catch (e: any) {
    toast.add({ title: 'Gagal memulihkan', description: e.message, color: 'error' })
  }
}
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
            <!-- Backend might filter 'deleted' via status or extra param. BeritaController shows 'deleted_at IS NULL' by default. 
                 To see deleted, we might need to adjust backend. For now, standard filter. -->
          </div>
          <UInput :model-value="search" placeholder="Cari..." icon="i-lucide-search" size="sm" @update:model-value="v=>router.push({ query: { ...route.query, search: v||undefined, page: undefined } })" />
        </div>
      </template>

      <ClientOnly>
        <div>
          <UTable 
            :loading="fetchStatus === 'pending'"
            :data="rows" 
            :columns="columns" 
          />
          <div class="flex justify-center mt-4 border-t pt-4">
            <UPagination
              v-if="total > 0"
              :model-value="page"
              :total="total"
              :page-count="10"
              @update:model-value="p => router.push({ query: { ...route.query, page: p } })"
            />
          </div>
        </div>
      </ClientOnly>
    </UCard>
  </div>
</template>
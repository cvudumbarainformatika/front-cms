<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

const page = computed(() => parseInt(route.query.page as string) || 1)
const search = computed(() => route.query.search as string || '')
const status = computed(() => (route.query.status as string) || 'all')

const { data, refresh, pending } = await useAsyncData(
  'agenda-list',
  () => $apiFetch('/agenda', {
    query: { 
      page: page.value, 
      limit: 10, 
      search: search.value || undefined, 
      status: status.value === 'all' ? undefined : status.value 
    }
  }),
  { 
    watch: [page, search, status],
    server: false
  }
)

const rows = computed(() => data.value?.data?.items || [])
const total = computed(() => data.value?.data?.pagination?.total || 0)

const columns = [
  { accessorKey: 'image', id: 'image', header: 'Gambar', meta: { class: { th: 'w-16', td: 'w-16' } } },
  { accessorKey: 'title', id: 'title', header: 'Nama Agenda', meta: { class: { th: 'min-w-[300px]', td: 'min-w-[300px]' } } },
  { accessorKey: 'type', id: 'type', header: 'Jenis' },
  { accessorKey: 'status', id: 'status', header: 'Status' },
  { accessorKey: 'date', id: 'date', header: 'Tanggal' },
  { accessorKey: 'actions', id: 'actions', header: 'Aksi', meta: { class: { th: 'text-right', td: 'text-right' } } }
]

function setStatus(s: string) {
  router.push({ query: { ...route.query, status: s || undefined, page: undefined } })
}

async function onDelete(id: number) {
  if (!confirm('Hapus agenda ini?')) return
  try {
    await $apiFetch(`/agenda/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Agenda berhasil dihapus', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Gagal menghapus agenda', description: error.message, color: 'error' })
  }
}

async function onRestore(id: number) {
  try {
    await $apiFetch(`/agenda/${id}`, { method: 'PATCH', body: { deleted_at: '' } })
    toast.add({ title: 'Agenda berhasil dipulihkan', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Gagal memulihkan agenda', description: error.message, color: 'error' })
  }
}

function getItems(row: any) {
  const items = [
    [
      {
        label: 'Edit',
        icon: 'i-lucide-pencil',
        onSelect: () => router.push(`/dashboard/admin/konten/agenda/${row.id}`)
      }
    ],
    [
      {
        label: 'Hapus',
        icon: 'i-lucide-trash',
        onSelect: () => onDelete(row.id)
      }
    ]
  ]

  if (row.deleted_at) {
    return [
      [
        {
          label: 'Pulihkan',
          icon: 'i-lucide-rotate-ccw',
          onSelect: () => onRestore(row.id)
        }
      ]
    ]
  }

  return items
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Kelola Agenda</h1>
        <p class="text-muted">Buat, edit, dan publikasikan agenda</p>
      </div>
      <UButton to="/dashboard/admin/konten/agenda/baru" icon="i-lucide-plus" label="Agenda Baru" size="lg" />
    </div>

    <UCard :ui="{ body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-4 sm:p-6' } }">
      <template #header>
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <UButton :variant="status==='all'?'solid':'soft'" :color="status==='all'?'primary':'gray'" size="sm" class="cursor-pointer" @click="setStatus('all')">Semua</UButton>
            <UButton :variant="status==='draft'?'solid':'soft'" :color="status==='draft'?'primary':'gray'" size="sm" class="cursor-pointer" @click="setStatus('draft')">Draft</UButton>
            <UButton :variant="status==='published'?'solid':'soft'" :color="status==='published'?'primary':'gray'" size="sm" class="cursor-pointer" @click="setStatus('published')">Published</UButton>
            <UButton :variant="status==='deleted'?'solid':'soft'" :color="status==='deleted'?'primary':'gray'" size="sm" class="cursor-pointer" @click="setStatus('deleted')">Deleted</UButton>
          </div>
          <div class="w-full sm:w-72">
             <UInput :model-value="search" placeholder="Cari judul..." icon="i-lucide-search" :ui="{ icon: { trailing: { pointer: '' } } }" @update:model-value="v=>router.push({ query: { ...route.query, search: v||undefined, page: undefined } })">
                <template #trailing v-if="search">
                  <UButton
                    color="gray"
                    variant="link"
                    size="xs"
                    icon="i-lucide-x"
                    :padded="false"
                    @click="router.push({ query: { ...route.query, search: undefined } })"
                  />
                </template>
             </UInput>
          </div>
        </div>
      </template>

      <ClientOnly>
        <div>
          <UTable 
            :key="`${page}-${status}-${search}`" 
            :loading="pending"
            :data="rows" 
            :columns="columns"
            class="w-full"
          >
            <!-- Image Slot -->
            <template #image-cell="{ row }">
               <img 
                 v-if="row.original.image_url"
                 :src="getImageUrl(row.original.image_url)" 
                 :alt="row.original.title" 
                 class="w-16 h-10 object-cover rounded shadow-sm border border-gray-100"
               />
               <UAvatar v-else :src="getImageUrl(row.original.image_url)" size="md" :alt="row.original.title" class="bg-gray-100" />
            </template>

            <!-- Title Slot -->
            <template #title-cell="{ row }">
              <div class="min-w-0">
                <p class="font-semibold text-highlighted line-clamp-2 leading-snug">{{ row.original.title }}</p>
                <div class="flex items-center gap-2 mt-1">
                   <UBadge color="gray" variant="subtle" size="xs" class="capitalize">{{ row.original.slug?.slice(0, 20) || '...' }}...</UBadge>
                </div>
              </div>
            </template>

            <!-- Status Slot -->
            <template #status-cell="{ row }">
               <UBadge 
                 :color="row.original.status === 'published' ? 'primary' : row.original.status === 'draft' ? 'orange' : 'gray'" 
                 variant="subtle"
                 size="xs"
                 class="capitalize font-semibold"
               >
                 {{ row.original.status }}
               </UBadge>
            </template>

            <!-- Date Slot -->
            <template #date-cell="{ row }">
              <span class="text-sm text-muted">{{ row.original.date ? new Date(row.original.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}</span>
            </template>

            <!-- Actions Slot -->
            <template #actions-cell="{ row }">
              <div class="flex items-center justify-end">
                <UDropdownMenu :items="getItems(row.original)">
                  <UButton icon="i-lucide-more-horizontal" color="gray" variant="ghost" size="sm" class="cursor-pointer" />
                </UDropdownMenu>
              </div>
            </template>
          </UTable>

          <div v-if="!pending && !rows.length" class="p-12 text-center">
             <div class="rounded-full bg-gray-50 p-4 inline-flex mb-4">
               <UIcon name="i-lucide-file-x" class="w-8 h-8 text-gray-400" />
             </div>
             <p class="text-muted font-medium">Tidak ada agenda ditemukan</p>
             <p class="text-xs text-muted mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        </div>
      </ClientOnly>
      
      <template #footer>
         <div class="flex items-center justify-between py-2">
           <span class="text-xs text-muted">Menampilkan {{ rows.length }} dari {{ total }} data</span>
           <UPagination 
             :model-value="page" 
             :total="total" 
             :page-count="10" 
             size="sm"
             @update:model-value="p => router.push({ query: { ...route.query, page: p } })"
           />
         </div>
      </template>
    </UCard>
  </div>
</template>
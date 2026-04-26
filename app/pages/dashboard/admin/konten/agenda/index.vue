<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

const columnPinning = ref({
  right: ['actions']
})

const page = ref(parseInt(route.query.page as string) || 1)
const search = computed(() => route.query.search as string || '')
const status = computed(() => (route.query.status as string) || 'all')

// Sync page with route query
watch(() => route.query.page, (newVal) => {
  const p = parseInt(newVal as string) || 1
  if (page.value !== p) {
    page.value = p
  }
})

// Sync route query with page change
watch(page, (newVal) => {
  if (parseInt(route.query.page as string) !== newVal) {
    router.push({ query: { ...route.query, page: newVal > 1 ? newVal : undefined } })
  }
})

// Broadcast modal state
const isModalOpen = ref(false)
const selectedAgendaId = ref<number | null>(null)
const broadcastMode = ref<'test' | 'warmup' | 'all'>('test')
const broadcastType = ref<'email' | 'whatsapp'>('email')

const { data, refresh, pending } = useAsyncData(
  'agenda-list',
  async () => {
    console.log('[Debug Agenda] Fetching data for page:', page.value)
    const res = await $apiFetch('/agenda', {
      query: { 
        page: page.value, 
        limit: 10, 
        search: search.value || undefined, 
        status: status.value === 'all' ? undefined : status.value 
      }
    })
    console.log('[Debug Agenda] API Response:', res)
    return res
  },
  { 
    server: false
  }
)

// Explicit watch to force refresh on search/status change
watch([page, search, status], (newVals) => {
  console.log('[Debug Agenda] Watch triggered:', { page: newVals[0], search: newVals[1], status: newVals[2] })
  refresh()
})

const rows = computed(() => {
  const res = data.value as any
  return res?.data?.items || res?.items || []
})

const total = computed(() => {
  const res = data.value as any
  // Check both wrapped (res.data.pagination) and unwrapped (res.pagination)
  return res?.data?.pagination?.total || res?.pagination?.total || 0
})

const totalPages = computed(() => Math.ceil(total.value / 10))

function onPageChange(p: number) {
  if (p < 1 || p > totalPages.value) return
  console.log('[Debug Agenda] onPageChange triggered with:', p)
  page.value = p
  router.push({ query: { ...route.query, page: p > 1 ? p : undefined } })
}

// Smart Pagination Logic
const visiblePages = computed(() => {
  const current = page.value
  const last = totalPages.value
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

const columns = [
  { accessorKey: 'image', id: 'image', header: 'Gambar', meta: { class: { th: 'w-16', td: 'w-16' } } },
  { accessorKey: 'title', id: 'title', header: 'Nama Agenda', meta: { class: { th: 'min-w-[250px]', td: 'min-w-[250px] whitespace-normal' } } },
  { accessorKey: 'type', id: 'type', header: 'Jenis', meta: { class: { th: 'w-32', td: 'w-32' } } },
  { accessorKey: 'status', id: 'status', header: 'Status', meta: { class: { th: 'w-32', td: 'w-32' } } },
  { accessorKey: 'date', id: 'date', header: 'Tanggal', meta: { class: { th: 'w-40', td: 'w-40' } } },
  { accessorKey: 'actions', id: 'actions', header: 'Aksi', meta: { class: { th: 'w-16 text-right', td: 'w-16 text-right bg-white dark:bg-gray-900 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]' } } }
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

function onBroadcastClick(id: number) {
  selectedAgendaId.value = id
  broadcastMode.value = 'test'
  broadcastType.value = 'email'
  isModalOpen.value = true
}

function onModeConfirm(mode: 'test' | 'warmup' | 'all') {
  if (selectedAgendaId.value) {
    if (broadcastType.value === 'email') {
      executeBroadcast(selectedAgendaId.value, mode)
    } else {
      // Cast safely since 'warmup' isn't available in WA type UI
      executeWABroadcast(selectedAgendaId.value, mode as 'test' | 'all')
    }
  }
  isModalOpen.value = false
}

async function executeBroadcast(id: number, mode: 'test' | 'warmup' | 'all') {
  const toastId = 'broadcast-toast-' + id
  const modeLabels = {
    test: 'Test Mode (7 email)',
    warmup: 'Warm-up Mode (57 email)',
    all: 'Full Blast (1800+ email)'
  }

  toast.add({
    id: toastId,
    title: 'Mengirim Broadcast...',
    description: `Mode: ${modeLabels[mode]}`,
    loading: true,
    timeout: 0
  })

  try {
    const url = mode === 'test' 
      ? `/broadcast/agenda/${id}` 
      : `/broadcast/agenda/${id}?target=${mode}`
      
    await $apiFetch(url, {
      method: 'POST'
    })
    
    toast.remove(toastId)
    toast.add({
      title: 'Berhasil',
      description: `Broadcast email (${modeLabels[mode]}) sedang diproses di background`,
      color: 'success'
    })
  } catch (error: any) {
    toast.remove(toastId)
    toast.add({
      title: 'Gagal',
      description: error.data?.message || 'Gagal mengirim broadcast',
      color: 'error'
    })
  }
}

function onBroadcastWAAgendaClick(id: number) {
  selectedAgendaId.value = id
  broadcastMode.value = 'test'
  broadcastType.value = 'whatsapp'
  isModalOpen.value = true
}

async function executeWABroadcast(id: number, mode: 'test' | 'all') {
  const toastId = `wa-broadcast-agenda-${id}`
  const modeLabel = mode === 'test' ? 'Test (Tim Testing)' : 'Semua Anggota'
  
  toast.add({
    id: toastId,
    title: 'Menyiapkan WA...',
    description: `Mode: ${modeLabel}`,
    loading: true,
    timeout: 0
  })

  try {
    const url = mode === 'test' 
      ? `/broadcast/agenda-wa/${id}` 
      : `/broadcast/agenda-wa/${id}?target=${mode}`

    await $apiFetch(url, {
      method: 'POST'
    })
    
    toast.remove(toastId)
    toast.add({
      title: 'WA Terkirim',
      description: `Agenda (${modeLabel}) sedang diproses di background`,
      color: 'success'
    })
  } catch (error: any) {
    toast.remove(toastId)
    toast.add({
      title: 'Gagal Kirim WA',
      description: error.data?.message || 'Gagal menghubungi service WhatsApp',
      color: 'error'
    })
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

  // Add Share via Email option for published items
  if (row.status === 'published' && !row.deleted_at) {
    items[0].push({
      label: 'Bagikan via Email',
      icon: 'i-lucide-share-2',
      onSelect: () => onBroadcastClick(row.id)
    })
    items[0].push({
      label: 'Bagikan via WhatsApp',
      icon: 'i-lucide-message-circle',
      onSelect: () => onBroadcastWAAgendaClick(row.id)
    })
  }

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
            <UButton :variant="status==='all'?'solid':'soft'" :color="status==='all'?'primary':'neutral'" size="sm" class="cursor-pointer" @click="setStatus('all')">Semua</UButton>
            <UButton :variant="status==='draft'?'solid':'soft'" :color="status==='draft'?'primary':'neutral'" size="sm" class="cursor-pointer" @click="setStatus('draft')">Draft</UButton>
            <UButton :variant="status==='published'?'solid':'soft'" :color="status==='published'?'primary':'neutral'" size="sm" class="cursor-pointer" @click="setStatus('published')">Published</UButton>
            <UButton :variant="status==='deleted'?'solid':'soft'" :color="status==='deleted'?'primary':'neutral'" size="sm" class="cursor-pointer" @click="setStatus('deleted')">Deleted</UButton>
          </div>
          <div class="w-full sm:w-72">
             <UInput :model-value="search" placeholder="Cari judul..." icon="i-lucide-search" :ui="{ icon: { trailing: { pointer: '' } } }" @update:model-value="v=>router.push({ query: { ...route.query, search: v||undefined, page: undefined } })">
                <template #trailing v-if="search">
                  <UButton
                    color="neutral"
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
        <div class="overflow-x-auto no-scrollbar">
          <UTable 
            :key="`${page}-${status}-${search}`" 
            v-model:column-pinning="columnPinning"
            :loading="pending"
            :data="rows" 
            :columns="columns"
            class="w-full min-w-[800px]"
            :ui="{
              tr: 'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hover:shadow-sm cursor-pointer'
            }"
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
              <div class="py-2">
                <p class="font-semibold text-highlighted leading-snug">{{ row.original.title }}</p>
                <div class="flex items-center gap-2 mt-1">
                   <UBadge color="neutral" variant="subtle" size="xs" class="capitalize">{{ row.original.slug?.slice(0, 20) || '...' }}...</UBadge>
                </div>
              </div>
            </template>

            <!-- Status Slot -->
            <template #status-cell="{ row }">
               <UBadge 
                 :color="row.original.status === 'published' ? 'primary' : row.original.status === 'draft' ? 'warning' : 'neutral'" 
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
                  <UButton icon="i-lucide-more-horizontal" color="neutral" variant="ghost" size="sm" class="cursor-pointer" />
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
           <span class="text-xs text-muted">Menampilkan {{ rows.length }} dari {{ total }} data (Hal: {{ page }}/{{ totalPages }})</span>
           
           <!-- CUSTOM PREMIUM PAGINATION -->
           <div v-if="totalPages > 1" class="flex items-center gap-1">
             <UButton 
               icon="i-lucide-chevrons-left" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               :disabled="page <= 1"
               @click="onPageChange(1)"
             />
             <UButton 
               icon="i-lucide-chevron-left" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               :disabled="page <= 1"
               @click="onPageChange(page - 1)"
             />
             
             <div class="flex items-center gap-1 mx-2">
                <template v-for="(p, i) in visiblePages" :key="i">
                  <span v-if="p === '...'" class="px-2 text-muted">...</span>
                  <UButton 
                    v-else
                    :color="page === p ? 'primary' : 'neutral'"
                    :variant="page === p ? 'solid' : 'ghost'"
                    size="xs"
                    class="min-w-[28px] justify-center"
                    @click="onPageChange(p as number)"
                  >
                    {{ p }}
                  </UButton>
                </template>
              </div>

             <UButton 
               icon="i-lucide-chevron-right" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               :disabled="page >= totalPages"
               @click="onPageChange(page + 1)"
             />
             <UButton 
               icon="i-lucide-chevrons-right" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               :disabled="page >= totalPages"
               @click="onPageChange(totalPages)"
             />
           </div>
         </div>
      </template>
    </UCard>

    <!-- Broadcast Mode Selection Modal -->
    <BroadcastModeModal 
      v-model="isModalOpen" 
      :type="broadcastType"
      @confirm="onModeConfirm"
    />
  </div>
</template>
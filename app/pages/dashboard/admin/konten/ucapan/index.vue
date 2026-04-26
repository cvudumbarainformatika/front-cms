<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

// Modal State using shared BroadcastModeModal
const isModalOpen = ref(false)
const selectedGreetingId = ref<number | null>(null)
const broadcastType = ref<'email' | 'whatsapp'>('email')

const columnPinning = ref({
  right: ['actions']
})

const page = ref(parseInt(route.query.page as string) || 1)
const search = computed(() => route.query.search as string || '')

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

const { data, refresh, pending } = useAsyncData(
  'greetings-list',
  async () => {
    console.log('[Debug Ucapan] Fetching data for page:', page.value)
    const res = await $apiFetch<{ success: boolean, data: { items: any[], pagination: { total: number } } }>('/greetings', {
      query: { 
        page: page.value, 
        limit: 10, 
        search: search.value 
      }
    })
    console.log('[Debug Ucapan] API Response:', res)
    return res
  }
)

// Explicit watch to force refresh on search change
watch([page, search], (newVals) => {
  console.log('[Debug Ucapan] Watch triggered:', { page: newVals[0], search: newVals[1] })
  refresh()
})

const rows = computed(() => {
  const res = data.value as any
  const items = res?.data?.items || res?.items || []
  console.log('[Debug Ucapan] Rows computed:', items.length)
  return items
})

const total = computed(() => {
  const res = data.value as any
  return res?.data?.pagination?.total || res?.pagination?.total || 0
})

const totalPages = computed(() => Math.ceil(total.value / 10))

function onPageChange(p: number) {
  if (p < 1 || p > totalPages.value) return
  console.log('[Debug Ucapan] onPageChange triggered with:', p)
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
  { accessorKey: 'image', id: 'image', header: 'Thumbnail', meta: { class: { th: 'w-24', td: 'w-24' } } },
  { accessorKey: 'title', id: 'title', header: 'Judul Ucapan', meta: { class: { th: 'min-w-[250px]', td: 'min-w-[250px] whitespace-normal' } } },
  { accessorKey: 'status', id: 'status', header: 'Status', meta: { class: { th: 'w-32', td: 'w-32' } } },
  { accessorKey: 'created_at', id: 'created_at', header: 'Dibuat Pada', meta: { class: { th: 'w-40', td: 'w-40' } } },
  { accessorKey: 'actions', id: 'actions', header: 'Aksi', meta: { class: { th: 'w-16 text-right', td: 'w-16 text-right bg-white dark:bg-gray-900 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]' } } }
]

async function onDelete(id: number) {
  if (!confirm('Hapus ucapan ini?')) return
  try {
    await $apiFetch(`/greetings/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Ucapan berhasil dihapus', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Gagal menghapus ucapan', description: error.message, color: 'error' })
  }
}

function onSendClick(id: number, type: 'whatsapp' | 'email') {
  selectedGreetingId.value = id
  broadcastType.value = type
  isModalOpen.value = true
}

function onModeConfirm(mode: 'test' | 'warmup' | 'all') {
  if (selectedGreetingId.value) {
    executeSend(selectedGreetingId.value, broadcastType.value, mode as 'test' | 'all')
  }
  isModalOpen.value = false
}

async function executeSend(id: number, type: 'email' | 'whatsapp', target: 'test' | 'all') {
  const toastId = 'send-toast-' + id
  const targetLabel = target === 'test' ? 'Internal/Test' : 'Semua Anggota'
  
  toast.add({
    id: toastId,
    title: `Mengirim ${type === 'whatsapp' ? 'WA' : 'Email'}...`,
    description: `Target: ${targetLabel}`,
    loading: true,
    timeout: 0
  })

  try {
    const endpoint = type === 'whatsapp' ? `/greetings/send-wa/${id}` : `/greetings/send-email/${id}`
    await $apiFetch(endpoint, {
      method: 'POST',
      query: { target }
    })
    
    toast.remove(toastId)
    toast.add({
      title: 'Berhasil',
      description: `Pengiriman ${type.toUpperCase()} (${targetLabel}) sedang diproses di background`,
      color: 'success'
    })
  } catch (error: any) {
    toast.remove(toastId)
    toast.add({
      title: 'Gagal',
      description: error.data?.message || 'Gagal melakukan pengiriman',
      color: 'error'
    })
  }
}

function getItems(row: any) {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-lucide-pencil',
        onSelect: () => router.push(`/dashboard/admin/konten/ucapan/${row.id}`)
      },
      {
        label: 'Kirim WhatsApp',
        icon: 'i-lucide-message-circle',
        onSelect: () => onSendClick(row.id, 'whatsapp')
      },
      {
        label: 'Kirim Email',
        icon: 'i-lucide-mail',
        onSelect: () => onSendClick(row.id, 'email')
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
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Ucapan Hari Besar</h1>
        <p class="text-muted">Kelola ucapan selamat hari besar untuk dikirim ke anggota</p>
      </div>
      <UButton to="/dashboard/admin/konten/ucapan/baru" icon="i-lucide-plus" label="Buat Ucapan Baru" size="lg" />
    </div>

    <UCard :ui="{ body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-4 sm:p-6' } }">
      <template #header>
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="w-full sm:w-72">
             <UInput 
               :model-value="search" 
               placeholder="Cari ucapan..." 
               icon="i-lucide-search" 
               @update:model-value="v => router.push({ query: { ...route.query, search: v || undefined, page: undefined } })"
             />
          </div>
        </div>
      </template>

      <ClientOnly>
        <div class="overflow-x-auto no-scrollbar">
          <UTable 
            v-model:column-pinning="columnPinning"
            :loading="pending"
            :data="rows" 
            :columns="columns"
            class="w-full min-w-[700px]"
          >
          <template #image-cell="{ row }">
             <img 
               v-if="row.original.image_url"
               :src="getImageUrl(row.original.image_url)" 
               class="w-16 h-10 object-cover rounded shadow-sm border border-gray-100"
             />
             <div v-else class="w-16 h-10 bg-gray-100 rounded flex items-center justify-center border border-gray-100">
               <UIcon name="i-lucide-image" class="text-gray-400" />
             </div>
          </template>

          <template #title-cell="{ row }">
            <div class="max-w-md py-2">
              <p class="font-semibold text-highlighted">{{ row.original.title }}</p>
              <p class="text-xs text-muted mt-0.5">{{ row.original.content }}</p>
            </div>
          </template>

          <template #status-cell="{ row }">
             <UBadge 
               :color="row.original.is_active ? 'primary' : 'neutral'" 
               variant="subtle"
               size="sm"
               :label="row.original.is_active ? 'Aktif' : 'Non-aktif'"
             />
          </template>

          <template #created_at-cell="{ row }">
            <span class="text-sm text-muted">{{ new Date(row.original.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end">
              <UDropdownMenu :items="getItems(row.original)">
                <UButton icon="i-lucide-more-horizontal" color="gray" variant="ghost" size="sm" class="cursor-pointer" />
              </UDropdownMenu>
            </div>
          </template>
        </UTable>

        <div v-if="!pending && !rows.length" class="p-12 text-center">
           <p class="text-muted font-medium">Belum ada ucapan yang dibuat</p>
           <UButton to="/dashboard/admin/konten/ucapan/baru" variant="link" label="Buat ucapan pertama Anda" class="mt-2" />
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

    <!-- Broadcast Mode Selection Modal (Consistent with Berita) -->
    <BroadcastModeModal 
      v-model="isModalOpen"
      :type="broadcastType"
      @confirm="onModeConfirm"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })

import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { userRole, user } = useAuth()

// Broadcast modal state
const isModalOpen = ref(false)
const selectedBeritaId = ref<number | null>(null)
const broadcastMode = ref<'test' | 'warmup' | 'all'>('test')
const broadcastType = ref<'email' | 'whatsapp'>('email')
const { $apiFetch } = useNuxtApp()

const columnPinning = ref({
  right: ['actions']
})

const importingId = ref<number | null>(null)

// Rejection Modal State
const isRejectionModalOpen = ref(false)
const selectedRejectionReason = ref('')

function openRejectionModal(reason: string) {
  if (!reason) return
  selectedRejectionReason.value = reason
  isRejectionModalOpen.value = true
}

const page = ref(parseInt(route.query.page as string) || 1)
const search = computed(() => route.query.search as string || '')
const status = computed(() => (route.query.status as string) || 'all')
const extStatus = computed(() => (route.query.ext_status as string) || 'new')
const currentTab = ref(route.query.tab as string || 'local')

// Helper to strip HTML tags from string
function stripHtml(html: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim()
}

// Helper to format date safely
function formatDisplayDate(dateStr: any) {
  if (!dateStr) return '-'
  
  // Handle *time.Time format from backend (string ISO)
  const val = typeof dateStr === 'string' ? dateStr : (dateStr.Time || dateStr)
  if (!val || val === '0001-01-01T00:00:00Z') return '-'
  
  const date = new Date(val)
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return val
}

function setTab(t: string) {
  currentTab.value = t
  page.value = 1
  // Clear status/ext_status when switching tabs to avoid cross-filtering issues
  router.push({ query: { tab: t } })
}

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

// Sync currentTab with route query
watch(() => route.query.tab, (newTab) => {
  if (newTab && (newTab === 'local' || newTab === 'external')) {
    currentTab.value = newTab as string
  }
}, { immediate: true })

// Fetch data with a static key and automatic watching for all reactive dependencies
const { data, pending, refresh } = useAsyncData(
  'berita-list',
  async () => {
    const url = currentTab.value === 'local' ? '/berita' : '/external-news'
    return await $apiFetch(url, {
      query: {
        page: page.value,
        limit: 10,
        search: currentTab.value === 'local' ? search.value : undefined,
        status: currentTab.value === 'local' ? (status.value === 'all' ? undefined : status.value) : undefined,
        is_imported: currentTab.value === 'external' ? (extStatus.value === 'all' ? undefined : (extStatus.value === 'imported' ? '1' : '0')) : undefined,
        author_id: currentTab.value === 'local' && userRole.value !== 'admin_pusat' && user.value?.id ? String(user.value.id) : undefined
      }
    })
  },
  { watch: [page, currentTab, status, extStatus, search] }
)

const tableData = ref<any[]>([])

// Manual watch to force update rows when data arrives
watch(data, (newVal) => {
  if (newVal) {
    const res = newVal as any
    // Map items from any possible path
    tableData.value = res?.data?.items || res?.items || res?.data || []
  } else {
    tableData.value = []
  }
}, { immediate: true })

const total = computed(() => {
  if (!data.value) return 0
  const res = data.value as any
  return res?.data?.pagination?.total || res?.pagination?.total || res?.data?.total || res?.total || 0
})

const totalPages = computed(() => Math.ceil(total.value / 10))

function onPageChange(p: number) {
  if (p < 1 || p > totalPages.value) return
  console.log('[Debug Berita] onPageChange triggered with:', p)
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

const { getImageUrl } = useImageUrl()

const columns = computed(() => {
  if (currentTab.value === 'local') {
    return [
      { accessorKey: 'image', id: 'image', header: 'Gambar', meta: { class: { th: 'w-20', td: 'w-20' } } },
      { accessorKey: 'title', id: 'title', header: 'Judul Artikel', meta: { class: { th: 'min-w-[250px]', td: 'min-w-[250px] whitespace-normal' } } },
      { accessorKey: 'category', id: 'category', header: 'Kategori', meta: { class: { th: 'w-36', td: 'w-36' } } },
      { accessorKey: 'status', id: 'status', header: 'Status', meta: { class: { th: 'w-32', td: 'w-32 text-center' } } },
      { accessorKey: 'published_at', id: 'published_at', header: 'Tanggal Publish', meta: { class: { th: 'w-40', td: 'w-40' } } },
      { accessorKey: 'actions', id: 'actions', header: '', meta: { class: { th: 'w-16 text-right', td: 'w-16 text-right' } } }
    ]
  } else {
    return [
      { accessorKey: 'source', id: 'source', header: 'Sumber', meta: { class: { th: 'w-44', td: 'w-44' } } },
      { accessorKey: 'title', id: 'title', header: 'Judul Berita Luar', meta: { class: { th: 'min-w-[350px]', td: 'min-w-[350px] whitespace-normal' } } },
      { accessorKey: 'is_imported', id: 'is_imported', header: 'Status', meta: { class: { th: 'w-32', td: 'w-32' } } },
      { accessorKey: 'actions', id: 'actions', header: '', meta: { class: { th: 'w-56 text-right', td: 'w-56 text-right bg-white dark:bg-gray-900 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]' } } }
    ]
  }
})

function setStatus(s: string) {
  if (currentTab.value === 'local') {
    router.push({ query: { ...route.query, status: s || undefined, page: undefined } })
  } else {
    router.push({ query: { ...route.query, ext_status: s || undefined, page: undefined } })
  }
}

async function onDelete(id: number) {
  if (!confirm('Hapus berita ini?')) return
  try {
    await $apiFetch(`/berita/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Artikel berhasil dihapus', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Gagal menghapus berita', description: error.message, color: 'error' })
  }
}

async function onRestore(id: number) {
  try {
    await $apiFetch(`/berita/${id}`, { method: 'PATCH', body: { deleted_at: '' } })
    toast.add({ title: 'Artikel berhasil dipulihkan', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Gagal memulihkan berita', description: error.message, color: 'error' })
  }
}

function onBroadcastClick(id: number) {
  selectedBeritaId.value = id
  broadcastMode.value = 'test'
  broadcastType.value = 'email'
  isModalOpen.value = true
}

function onModeConfirm(mode: 'test' | 'warmup' | 'all') {
  if (selectedBeritaId.value) {
    if (broadcastType.value === 'email') {
      executeBroadcast(selectedBeritaId.value, mode)
    } else {
      executeWABroadcast(selectedBeritaId.value, mode as 'test' | 'all')
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
      ? `/broadcast/berita/${id}` 
      : `/broadcast/berita/${id}?target=${mode}`
    
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

function onBroadcastWAClick(id: number) {
  selectedBeritaId.value = id
  broadcastMode.value = 'test'
  broadcastType.value = 'whatsapp'
  isModalOpen.value = true
}

async function executeWABroadcast(id: number, mode: 'test' | 'all') {
  const toastId = `wa-broadcast-${id}`
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
      ? `/broadcast/berita-wa/${id}` 
      : `/broadcast/berita-wa/${id}?target=${mode}`

    await $apiFetch(url, {
      method: 'POST'
    })
    
    toast.remove(toastId)
    toast.add({
      title: 'WA Terkirim',
      description: `Pesan (${modeLabel}) sedang diproses di background`,
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
        onSelect: () => router.push(`/dashboard/admin/konten/berita/${row.id}`)
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
      onSelect: () => onBroadcastWAClick(row.id)
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

async function onImport(row: any, status: 'draft' | 'published' = 'draft') {
  importingId.value = row.id
  try {
    const res = await $apiFetch<{ success: boolean, data: { id: number } }>(`/external-news/import/${row.id}?status=${status}`, { method: 'POST' })
    if (res.success) {
      toast.add({ title: `Berita berhasil ${status === 'published' ? 'dipublikasikan' : 'dijadikan draft'}`, color: 'success' })
      refresh()
    }
  } catch (error: any) {
    console.error('[Import Error]', error)
    toast.add({ 
      title: 'Gagal mengimpor berita', 
      description: error.data?.message || error.message || 'Terjadi kesalahan sistem', 
      color: 'error' 
    })
  } finally {
    importingId.value = null
  }
}


</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Kelola Artikel</h1>
        <p class="text-muted">Kelola artikel, publikasi dan konten website</p>
      </div>
      <div class="flex gap-2">
        <UButton to="/dashboard/admin/konten/berita/baru" icon="i-lucide-plus" label="Artikel Baru" size="lg" />
      </div>
    </div>

    <!-- MAIN TABS (PREMIUM) -->
    <div class="flex p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl w-fit border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
      <button 
        class="px-8 py-2 text-sm font-semibold transition-all duration-300 rounded-lg flex items-center gap-2"
        :class="currentTab === 'local' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        @click="setTab('local')"
      >
        <UIcon name="i-lucide-database" class="w-4 h-4" />
        Artikel Lokal
      </button>
      <button 
        class="px-8 py-2 text-sm font-semibold transition-all duration-300 rounded-lg flex items-center gap-2"
        :class="currentTab === 'external' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        @click="setTab('external')"
      >
        <UIcon name="i-lucide-rss" class="w-4 h-4" />
        Berita Luar (RSS)
      </button>
    </div>

    <UCard v-if="currentTab === 'local'" :ui="{ root: 'overflow-hidden max-w-full', body: 'p-0 sm:p-0 overflow-hidden' }">
      <template #header>
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div class="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar items-center">
            <UButton :variant="status==='all'?'solid':'soft'" :color="status==='all'?'primary':'neutral'" size="sm" class="cursor-pointer whitespace-nowrap" @click="setStatus('all')">Semua</UButton>
            <UButton :variant="status==='draft'?'solid':'soft'" :color="status==='draft'?'primary':'neutral'" size="sm" class="cursor-pointer whitespace-nowrap" @click="setStatus('draft')">Draft</UButton>
            <UButton :variant="status==='published'?'solid':'soft'" :color="status==='published'?'primary':'neutral'" size="sm" class="cursor-pointer whitespace-nowrap" @click="setStatus('published')">Published</UButton>
            <UButton :variant="status==='rejected'?'solid':'soft'" :color="status==='rejected'?'primary':'neutral'" size="sm" class="cursor-pointer whitespace-nowrap" @click="setStatus('rejected')">Ditolak</UButton>
            <UButton :variant="status==='deleted'?'solid':'soft'" :color="status==='deleted'?'primary':'neutral'" size="sm" class="cursor-pointer whitespace-nowrap" @click="setStatus('deleted')">Deleted</UButton>
          </div>
          <div class="w-full lg:w-72">
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
        <div v-if="!pending" class="w-full overflow-x-auto no-scrollbar border-t border-gray-200 dark:border-gray-800">
          <UTable 
            v-model:column-pinning="columnPinning"
            :data="tableData" 
            :columns="columns"
            class="w-full min-w-[800px]"
            :ui="{
              tr: 'hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors cursor-pointer group'
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
                   <UBadge color="neutral" variant="subtle" size="xs" class="capitalize">{{ row.original.slug.slice(0, 20) }}...</UBadge>
                </div>
              </div>
            </template>

            <!-- Status Slot -->
            <template #status-cell="{ row }">
                <UBadge 
                  :color="row.original.status === 'published' ? 'primary' : row.original.status === 'rejected' ? 'error' : row.original.status === 'draft' ? 'warning' : 'neutral'" 
                  variant="subtle"
                  size="sm"
                  class="capitalize font-bold px-3 py-0.5 rounded-full ring-1 ring-inset"
                  :class="{
                    'ring-primary-200 dark:ring-primary-800': row.original.status === 'published',
                    'ring-error-200 dark:ring-error-800 cursor-pointer hover:bg-error-100 transition-colors': row.original.status === 'rejected',
                    'ring-warning-200 dark:ring-warning-800': row.original.status === 'draft'
                  }"
                  :label="row.original.status === 'published' ? 'Terbit' : row.original.status === 'rejected' ? 'Ditolak' : 'Draft'"
                  @click="row.original.status === 'rejected' && row.original.rejection_reason ? openRejectionModal(row.original.rejection_reason) : null"
                />
            </template>

            <!-- Published At Slot -->
            <template #published_at-cell="{ row }">
              <span class="text-sm text-muted">{{ row.original.published_at ? new Date(row.original.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}</span>
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

        </div>
        <div v-else class="flex flex-col items-center justify-center py-24 gap-3">
          <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary-500" />
          <p class="text-sm text-muted animate-pulse">Memuat artikel lokal...</p>
        </div>
      </ClientOnly>
      
      <template #footer>
         <div class="flex items-center justify-between py-2">
           <span class="text-xs text-muted">Menampilkan {{ tableData.length }} dari {{ total }} data (Hal: {{ page }}/{{ totalPages }})</span>
           
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

    <!-- EXTERNAL NEWS CARD -->
    <UCard v-else :ui="{ root: 'overflow-hidden max-w-full', body: 'p-0 sm:p-0 overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="font-bold text-highlighted">Katalog Berita Luar (RSS)</h3>
            <UBadge variant="subtle" size="sm" color="neutral" class="rounded-full">Auto-sync aktif</UBadge>
          </div>
          <div class="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
            <UButton :variant="extStatus==='all'?'solid':'soft'" :color="extStatus==='all'?'primary':'neutral'" size="sm" class="cursor-pointer whitespace-nowrap" @click="setStatus('all')">Semua</UButton>
            <UButton :variant="extStatus==='new'?'solid':'soft'" :color="extStatus==='new'?'primary':'neutral'" size="sm" class="cursor-pointer whitespace-nowrap" @click="setStatus('new')">Baru</UButton>
            <UButton :variant="extStatus==='imported'?'solid':'soft'" :color="extStatus==='imported'?'primary':'neutral'" size="sm" class="cursor-pointer whitespace-nowrap" @click="setStatus('imported')">Sudah Diimpor</UButton>
          </div>
        </div>
      </template>

      <ClientOnly>
        <div v-if="!pending" class="w-full overflow-x-auto no-scrollbar">
          <UTable 
            v-model:column-pinning="columnPinning"
            :data="tableData" 
            :columns="columns"
            class="w-full min-w-[850px]"
          >
            <template #source-cell="{ row }">
              <div class="flex flex-col gap-1.5">
                <UBadge color="neutral" variant="subtle" class="w-fit text-[10px] px-1.5 py-0">{{ row.original.source }}</UBadge>
                <span class="text-[11px] text-gray-500 font-medium whitespace-nowrap leading-none">
                  {{ formatDisplayDate(row.original.published_at) }}
                </span>
              </div>
            </template>
            
            <template #title-cell="{ row }">
              <div class="py-3 pr-4">
                <a :href="row.original.url" target="_blank" class="font-bold text-highlighted hover:text-primary-600 transition-colors leading-tight text-sm">
                  {{ row.original.title }}
                  <UIcon name="i-lucide-external-link" class="w-3.5 h-3.5 ml-1 inline opacity-40 group-hover:opacity-100 transition-opacity" />
                </a>
                <p class="text-xs text-muted mt-1.5 font-normal leading-relaxed">
                  {{ stripHtml(typeof row.original.description === 'object' ? row.original.description.String : row.original.description) }}
                </p>
              </div>
            </template>



            <template #is_imported-cell="{ row }">
              <UBadge :color="row.original.is_imported ? 'success' : 'neutral'" variant="soft">
                {{ row.original.is_imported ? 'Sudah Diimpor' : 'Baru' }}
              </UBadge>
            </template>

            <template #actions-cell="{ row }">
            <div class="flex items-center justify-end px-4 gap-2">
              <template v-if="!row.original.is_imported">
                <UButton 
                  icon="i-lucide-external-link" 
                  size="xs" 
                  color="neutral" 
                  variant="ghost"
                  label="Lihat Isi"
                  :to="row.original.url"
                  target="_blank"
                />
                <UButton 
                  icon="i-lucide-send" 
                  size="xs" 
                  color="primary" 
                  label="Publikasikan"
                  :loading="importingId === row.original.id"
                  @click="onImport(row.original, 'published')"
                />
              </template>
              <template v-else>
                <UButton 
                  icon="i-lucide-globe" 
                  size="xs" 
                  color="success" 
                  variant="soft"
                  label="Lihat Halaman"
                  :to="`/berita/${row.original.imported_slug?.String || row.original.imported_slug}`"
                  target="_blank"
                />
              </template>
            </div>
          </template>
          </UTable>

          <div v-if="!tableData.length" class="p-12 text-center">
             <div class="rounded-full bg-gray-50 p-4 inline-flex mb-4">
               <UIcon name="i-lucide-rss" class="w-8 h-8 text-gray-400" />
             </div>
             <p class="text-muted font-medium">Tidak ada berita luar ditemukan</p>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-24 gap-3">
          <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary-500" />
          <p class="text-sm text-muted animate-pulse">Memuat berita RSS...</p>
        </div>
      </ClientOnly>

      <template #footer>
         <div class="flex items-center justify-between py-2">
           <span class="text-xs text-muted font-medium">Menampilkan {{ tableData.length }} berita luar (Hal: {{ page }})</span>
           
           <!-- PREMIUM PAGINATION FOR EXTERNAL -->
           <div v-if="totalPages > 1" class="flex items-center gap-1">
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
           </div>
         </div>
      </template>
    </UCard>

    <!-- Broadcast Mode Selection Modal -->
    <BroadcastModeModal 
      v-model="isModalOpen"
      :mode="broadcastMode"
      :type="broadcastType"
      @confirm="onModeConfirm"
    />

    <!-- Rejection Reason Modal -->
    <RejectionReasonModal 
      v-model="isRejectionModalOpen" 
      :reason="selectedRejectionReason" 
    />

  </div>
</template>

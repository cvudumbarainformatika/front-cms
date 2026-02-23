<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'dashboard', ssr: false })

const { $apiFetch } = useNuxtApp()
const toast = useToast()
const authCookie = useCookie('auth')
const user = computed(() => authCookie.value?.user)
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin')
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/backend'

// State
const loading = ref(false)
const uploading = ref(false)
const isUploadModalOpen = ref(false)
const documents = ref<any[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, total_pages: 0 })
const searchQuery = ref('')
const viewMode = ref<'grid' | 'table'>('grid')
const searchTimeout = ref<NodeJS.Timeout | null>(null)

function onSearch() {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    pagination.value.page = 1
    fetchDocuments()
  }, 500)
}

// Form
const form = ref({
  name: '',
  type: '',
  valid_until: '',
  file: null as File | null
})
const fileInput = ref<HTMLInputElement | null>(null)

import UploadDocumentModal from '~/components/UploadDocumentModal.vue'

// Options
const documentTypes = [
  { label: 'STR', value: 'STR' },
  { label: 'SIP', value: 'SIP' },
  { label: 'Serkom', value: 'Serkom' },
  { label: 'Identitas (KTP/SIM)', value: 'Identitas' },
  { label: 'Ijazah', value: 'Ijazah' },
  { label: 'Lainnya', value: 'Lainnya' }
]

// Table Columns (dynamic based on role)
const columns = computed(() => {
  const baseCols = [
    { accessorKey: 'name', id: 'name', header: 'Nama Dokumen' },
    { accessorKey: 'type', id: 'type', header: 'Jenis' },
    { accessorKey: 'valid_until', id: 'valid_until', header: 'Berlaku Hingga' }
  ]

  if (isAdmin.value) {
    baseCols.splice(1, 0, { accessorKey: 'user_id', id: 'user_id', header: 'User ID' })
  }

  baseCols.push({ accessorKey: 'actions', id: 'actions', header: '' })
  return baseCols
})

// Fetch Data
async function fetchDocuments() {
  loading.value = true
  try {
    const res: any = await $apiFetch('/documents', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value || undefined
      }
    })

    if (res?.data) {
      documents.value = res.data.items || []
      pagination.value = res.data.pagination || pagination.value
    }
  } catch (error: any) {
    toast.add({
      title: 'Gagal memuat dokumen',
      description: error?.data?.message || 'Terjadi kesalahan sistem',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Upload Handling
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    // Validasi ukuran 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: 'Ukuran file', description: 'Maksimal ukuran file adalah 5MB', color: 'error' })
      if (fileInput.value) fileInput.value.value = ''
      return
    }
    form.value.file = file || null
  }
}

const uploadModal = ref<InstanceType<typeof UploadDocumentModal> | null>(null)

async function handleUpload(formData: FormData) {
  try {
    uploadModal.value?.setUploading(true)

    await $apiFetch('/documents', {
      method: 'POST',
      body: formData
    })

    toast.add({ title: 'Berhasil', description: 'Dokumen berhasil diunggah', color: 'success' })
    isUploadModalOpen.value = false
    uploadModal.value?.reset()

    fetchDocuments()
  } catch (error: any) {
    toast.add({
      title: 'Gagal',
      description: error?.data?.message || 'Gagal mengunggah dokumen',
      color: 'error'
    })
  } finally {
    uploadModal.value?.setUploading(false)
  }
}

async function deleteDocument(id: number) {
  if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return

  try {
    await $apiFetch(`/documents/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Berhasil', description: 'Dokumen dihapus', color: 'success' })
    fetchDocuments()
  } catch (error: any) {
    toast.add({
      title: 'Gagal',
      description: error?.data?.message || 'Gagal menghapus dokumen',
      color: 'error'
    })
  }
}

function formatDate(dateString: string) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getFileUrl(url: string) {
  if (!url) return '#'
  if (url.startsWith('http')) return url
  return `${apiBase}${url.replace('/api/v1', '')}`
}

function isImage(url: string) {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.webp')
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'valid': return 'success'
    case 'rejected': return 'error'
    case 'expired': return 'warning'
    default: return 'neutral'
  }
}

onMounted(() => {
  fetchDocuments()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Dokumen Pribadi</h1>
        <p class="text-muted">Kelola dokumen persyaratan (STR, SIP, Serkom, dll.)</p>
      </div>
      <div>
        <UButton
          icon="i-lucide-upload"
          label="Unggah Dokumen"
          color="primary"
          @click="isUploadModalOpen = true"
        />
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="w-full sm:w-72">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Cari nama dokumen..."
          @input="onSearch"
        />
      </div>
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <span class="text-sm text-gray-500 dark:text-gray-400">Tampilan:</span>
        <div class="bg-gray-100 dark:bg-gray-800 p-1 flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            @click="viewMode = 'grid'"
            :class="['p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']"
            title="Tampilan Grid"
          >
            <UIcon name="i-lucide-layout-grid" class="w-4 h-4" />
          </button>
          <button
            @click="viewMode = 'table'"
            :class="['p-1.5 rounded-md transition-colors', viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']"
            title="Tampilan Tabel"
          >
            <UIcon name="i-lucide-list" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-if="!loading && documents.length === 0" class="col-span-full p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
        <div class="rounded-full bg-gray-50 dark:bg-gray-800/50 p-4 inline-flex mb-4">
          <UIcon name="i-lucide-search-x" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-muted font-medium">Dokumen tidak ditemukan</p>
        <p class="text-xs text-muted mt-1">Coba gunakan kata kunci pencarian yang lain atau unggah dokumen baru.</p>
      </div>

      <div
        v-for="doc in documents"
        :key="doc.id"
        class="bg-white dark:bg-gray-900 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 flex flex-col h-full overflow-hidden group hover:shadow-md transition-shadow duration-300"
      >
        <!-- Thumbnail Section (Edge to Edge) -->
        <div class="relative w-full aspect-4/3 bg-gray-100 dark:bg-gray-800 overflow-hidden border-b border-gray-100 dark:border-gray-800">
           <img
             v-if="isImage(doc.file_url)"
             :src="getFileUrl(doc.file_url)"
             class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
             :alt="doc.name"
           />
           <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/80">
              <div class="p-4 rounded-full bg-white dark:bg-gray-900 shadow-sm mb-3">
                 <UIcon name="i-lucide-file-text" class="w-8 h-8 text-primary-500" />
              </div>
              <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">{{ doc.file_url?.split('.').pop() || 'File' }}</span>
           </div>

           <!-- Overlay Actions -->
           <div class="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <UButton
                icon="i-lucide-external-link"
                color="primary"
                label="Buka Dokumen"
                variant="solid"
                class="shadow-lg hover:scale-105 transition-transform"
                :to="getFileUrl(doc.file_url)"
                target="_blank"
                external
              />
           </div>

           <!-- Status Badge Positioned over image -->
           <div class="absolute top-3 left-3 flex gap-1.5 flex-wrap">
             <UBadge :label="doc.type" size="sm" variant="solid" color="neutral" class="shadow-sm font-medium" />
           </div>
        </div>

        <!-- Content Section -->
        <div class="p-4 flex-1 flex flex-col">
          <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2 text-base leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ doc.name }}</h3>

          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
             <div class="flex items-center gap-2">
               <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-400" />
               <span class="truncate">Dibuat: {{ formatDate(doc.created_at) }}</span>
             </div>
             <div class="flex items-center gap-2" :class="{ 'text-red-600 dark:text-red-400 font-medium': doc.valid_until && new Date(doc.valid_until) < new Date() }">
               <UIcon name="i-lucide-hourglass" class="w-4 h-4 text-gray-400" :class="{ 'text-red-500 dark:text-red-400': doc.valid_until && new Date(doc.valid_until) < new Date() }" />
               <span class="truncate">Batas: {{ doc.valid_until ? formatDate(doc.valid_until) : 'Seumur Hidup' }}</span>
             </div>
             <div v-if="isAdmin" class="flex items-center gap-2">
                <UIcon name="i-lucide-user" class="w-4 h-4 text-gray-400" />
                <span class="truncate">User ID: <span class="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{{ doc.user_id }}</span></span>
             </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-end">
          <UButton
            icon="i-lucide-trash-2"
            size="sm"
            color="error"
            variant="ghost"
            class="hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            @click="deleteDocument(doc.id)"
          />
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <UCard v-else-if="viewMode === 'table'" class="overflow-hidden">
      <div class="overflow-x-auto">
        <UTable
          :columns="columns"
          :data="documents"
          :loading="loading"
          class="min-w-full"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <div class="shrink-0 w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  v-if="isImage(row.original.file_url)"
                  :src="getFileUrl(row.original.file_url)"
                  class="w-full h-full object-cover"
                  alt="Thumbnail"
                />
                <UIcon v-else name="i-lucide-file-text" class="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <span class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</span>
                <div class="text-xs text-gray-500">{{ formatDate(row.original.created_at) }}</div>
              </div>
            </div>
          </template>

          <template #user_id-cell="{ row }" v-if="isAdmin">
            <span class="text-sm">User ID: {{ row.original.user_id }}</span>
          </template>

          <template #valid_until-cell="{ row }">
            <span class="text-sm" :class="{ 'text-red-500': row.original.valid_until && new Date(row.original.valid_until) < new Date() }">
              {{ row.original.valid_until ? formatDate(row.original.valid_until) : 'Seumur Hidup' }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-2">
              <UButton
                icon="i-lucide-external-link"
                size="xs"
                color="primary"
                variant="soft"
                title="Lihat Dokumen"
                :to="getFileUrl(row.original.file_url)"
                target="_blank"
                external
              />
              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                color="error"
                variant="soft"
                title="Hapus"
                @click="deleteDocument(row.original.id)"
              />
            </div>
          </template>
        </UTable>

        <div v-if="!loading && documents.length === 0" class="p-12 text-center border-t border-gray-100 dark:border-gray-800">
          <div class="rounded-full bg-gray-50 p-4 inline-flex mb-4">
            <UIcon name="i-lucide-file-text" class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-muted font-medium">Belum ada dokumen</p>
          <p class="text-xs text-muted mt-1">Silakan unggah dokumen persyaratan Anda</p>
        </div>
      </div>
    </UCard>

    <!-- Pagination -->
    <div v-if="pagination.total > 0" class="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800 mt-4">
      <span class="text-xs text-muted">Total: {{ pagination.total }} dokumen</span>
      <div class="flex items-center gap-2">
        <UButton
          :disabled="pagination.page <= 1"
          icon="i-lucide-chevron-left"
          @click="pagination.page--; fetchDocuments()"
          variant="ghost"
          size="sm"
          color="neutral"
        />
        <span class="text-sm font-medium">
          {{ pagination.page }} / {{ pagination.total_pages }}
        </span>
        <UButton
          :disabled="pagination.page >= pagination.total_pages"
          icon="i-lucide-chevron-right"
          @click="pagination.page++; fetchDocuments()"
          variant="ghost"
          size="sm"
          color="neutral"
        />
      </div>
    </div>

    <!-- Upload Modal Component -->
    <UploadDocumentModal
      v-model="isUploadModalOpen"
      ref="uploadModal"
      @upload="handleUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'dashboard', ssr: false })

const { $apiFetch } = useNuxtApp()
const toast = useToast()
const authCookie = useCookie('auth')
const user = computed(() => authCookie.value?.user)
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin')

// State
const loading = ref(false)
const uploading = ref(false)
const isUploadModalOpen = ref(false)
const documents = ref<any[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, total_pages: 0 })

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
    { accessorKey: 'valid_until', id: 'valid_until', header: 'Berlaku Hingga' },
    { accessorKey: 'status', id: 'status', header: 'Status' }
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
      query: { page: pagination.value.page, limit: pagination.value.limit }
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
    form.value.file = file
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

    <!-- Table Card -->
    <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <div class="overflow-x-auto">
        <UTable
          :columns="columns"
          :data="documents"
          :loading="loading"
          class="min-w-full"
        >
          <template #name-cell="{ row }">
            <span class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</span>
            <div class="text-xs text-gray-500">{{ formatDate(row.original.created_at) }}</div>
          </template>

          <template #user_id-cell="{ row }" v-if="isAdmin">
            <span class="text-sm">User ID: {{ row.original.user_id }}</span>
          </template>

          <template #valid_until-cell="{ row }">
            <span class="text-sm" :class="{ 'text-red-500': row.original.valid_until && new Date(row.original.valid_until) < new Date() }">
              {{ row.original.valid_until ? formatDate(row.original.valid_until) : 'Seumur Hidup' }}
            </span>
          </template>

          <template #status-cell="{ row }">
            <UBadge
              :label="row.original.status"
              :color="getStatusColor(row.original.status)"
              size="xs"
              variant="subtle"
              class="capitalize"
            />
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-2">
              <UButton
                icon="i-lucide-external-link"
                size="xs"
                color="primary"
                variant="soft"
                title="Lihat Dokumen"
                :to="row.original.file_url"
                target="_blank"
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

      <template #footer v-if="pagination.total > pagination.limit">
         <div class="flex items-center justify-between py-2">
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
      </template>
    </UCard>

    <!-- Upload Modal Component -->
    <UploadDocumentModal
      v-model="isUploadModalOpen"
      ref="uploadModal"
      @upload="handleUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AddDocumentTypeModal from '~/components/AddDocumentTypeModal.vue'


// const authCookie = useCookie('auth_user')
let user = null

if (import.meta.client) {
  const rawUser = localStorage.getItem('auth_user')
  user = rawUser ? JSON.parse(rawUser) : null
}
const isAdmin = computed(() => user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'admin_pusat')
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'upload': [formData: FormData]
}>()

// Computed for v-model binding
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const toast = useToast()

const form = ref({
  name: '',
  jenis: 'private',
  type: '',
  valid_until: '',
  file: null as File | null
})

const { $apiFetch } = useNuxtApp() as any
const documentTypes = ref<{ label: string; value: string }[]>([])
const showAddTypeModal = ref(false)

async function fetchDocumentTypes() {
  try {
    const res = await $apiFetch('/typedokumen') as {
      status: string
      data: any[]
    }

    if (res?.data) {
      documentTypes.value = res.data.map((item: any) => ({
        label: item.typedokumen,
        value: item.typedokumen
      }))
    }
  } catch (err) {
    console.error(err)

    documentTypes.value = [
      { label: 'Serkom', value: 'Serkom' },
      { label: 'Identitas (KTP/SIM)', value: 'Identitas' },
      { label: 'Ijazah', value: 'Ijazah' },
      { label: 'Lainnya', value: 'Lainnya' }
    ]
  }
}

onMounted(() => {
  fetchDocumentTypes()
})

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      toast.add({ title: 'Ukuran file', description: 'Maksimal ukuran file adalah 5MB', color: 'error' })
      if (fileInput.value) fileInput.value.value = ''
      return
    }
    form.value.file = file || null
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

function submitForm() {
  if (!form.value.name || !form.value.type || !form.value.file || !form.value.jenis) {
    toast.add({ title: 'Validasi', description: 'Mohon lengkapi semua field yang wajib', color: 'error' })
    return
  }

  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('type', form.value.type)
  if (form.value.valid_until) formData.append('valid_until', form.value.valid_until)
  formData.append('jenis', form.value.jenis)
  formData.append('file', form.value.file)

  emit('upload', formData)
}

async function handleTypeAdded(newType: string) {
  form.value.type = newType
  await fetchDocumentTypes()
}
// Options jenis
const documentJenises = [
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' },
]
// Method called by parent to reset state when upload completes
defineExpose({
  reset() {
    form.value = { name: '', jenis:'private', type: '', valid_until: '', file: null }
    if (fileInput.value) fileInput.value.value = ''
    uploading.value = false
  },
  setUploading(status: boolean) {
    uploading.value = status
  }
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
  >
  <!-- <UModal
    v-model:open="isOpen"
    title="Unggah Dokumen Baru"
    description="Unggah dokumen persyaratan baru Anda ke dalam sistem"
    :ui="{ header: 'flex items-center gap-2' }"
  > -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
           <UIcon name="i-lucide-file-up" class="w-5 h-5 text-primary-600" />
           <h2 class="font-semibold text-lg">Unggah Dokumen Baru</h2>
        </div>
      </div>
    </template>

    <template #body>
      
      <form @submit.prevent="submitForm" class="space-y-6" id="upload-doc-form">
        <!-- Baris 1: Nama & Jenis Dokumen -->
        <UFormField
          label="Pilih Jenis Dokumen"
          required
          class="mb-6"
        >
          <div class="flex gap-2">
            <USelect
              v-model="form.type"
              :items="documentTypes"
              placeholder="Pilih jenis dokumen..."
              required
              value-key="value"
              size="md"
              class="flex-1"
            />
            <UButton
              type="button"
              icon="i-lucide-plus"
              color="neutral"
              variant="outline"
              size="md"
              @click="showAddTypeModal = true"
              title="Tambah tipe dokumen baru"
            />
          </div>
        </UFormField>

        <UFormField
          label="Nama atau Catatan Dokumen"
          required
          class="mb-6"
        >
          <UInput
            v-model="form.name"
            placeholder="Misal: STR Dokter Umum 2025"
            required
            size="md"
            class="w-full"
          />
          <p class="text-xs text-gray-500 mt-1.5">Berikan nama spesifik agar mudah dikenali di kemudian hari</p>
        </UFormField>

        <!-- Baris 2: Masa Berlaku -->
        <UFormField
          label="Masa Berlaku"
          class="mb-6"
        >
          <UInput
            type="date"
            v-model="form.valid_until"
            class="sm:w-1/2"
            size="md"
          />
          <p class="text-xs text-gray-500 mt-1.5">Kosongkan jika dokumen berlaku seumur hidup</p>
        </UFormField>

        <!-- Baris 3: File Upload -->
        <UFormField
          label="File Dokumen (PDF/JPG/PNG/ZIP)"
          required
        >
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50 mt-1">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.zip"
              class="block w-full text-sm text-gray-600 dark:text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-white dark:file:bg-gray-900 file:text-gray-700 dark:file:text-gray-200
                file:shadow-sm file:ring-1 file:ring-gray-200 dark:file:ring-gray-700
                hover:file:bg-gray-50 dark:hover:file:bg-gray-800 cursor-pointer"
              required
            />
          </div>
          <p class="text-xs text-info-600 dark:text-info-400 mt-2 flex items-center gap-1">
            <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5" />
            Format yang didukung: PDF, JPG, PNG, WEBP, ZIP. Maksimal ukuran 5MB.
          </p>
        </UFormField>

        <!-- Baris 4: status dokumen -->
        <UFormField
          v-if="isAdmin"
          label="Pilih Satus Dokumen "
          required
        >
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50 mt-1">
            <!-- <template> -->
              <URadioGroup v-model="form.jenis" :items="documentJenises" orientation="horizontal"/>
            <!-- </template> -->
          </div>
          <!-- <p class="text-xs text-info-600 dark:text-info-400 mt-2 flex items-center gap-1">
            <UIcon name="i-lucide-alert-circle" class="w-3.5 h-3.5" />
            Format yang didukung: PDF, JPG, PNG, WEBP, ZIP. Maksimal ukuran 5MB.
          </p> -->
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Batal" @click="handleClose" />
        <UButton type="submit" form="upload-doc-form" color="primary" label="Unggah" icon="i-lucide-upload" :loading="uploading" />
      </div>
    </template>

    <Teleport to="body">
  <AddDocumentTypeModal
    v-model:open="showAddTypeModal"
    @success="handleTypeAdded"
  />
</Teleport>
  </UModal>
</template>

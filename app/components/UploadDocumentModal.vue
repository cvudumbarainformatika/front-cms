<script setup lang="ts">
import { ref, computed } from 'vue'

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
  type: '',
  valid_until: '',
  file: null as File | null
})

const documentTypes = [
  { label: 'STR', value: 'STR' },
  { label: 'SIP', value: 'SIP' },
  { label: 'Serkom', value: 'Serkom' },
  { label: 'Identitas (KTP/SIM)', value: 'Identitas' },
  { label: 'Ijazah', value: 'Ijazah' },
  { label: 'Lainnya', value: 'Lainnya' }
]

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: 'Ukuran file', description: 'Maksimal ukuran file adalah 5MB', color: 'error' })
      if (fileInput.value) fileInput.value.value = ''
      return
    }
    form.value.file = file
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

function submitForm() {
  if (!form.value.name || !form.value.type || !form.value.file) {
    toast.add({ title: 'Validasi', description: 'Mohon lengkapi semua field yang wajib', color: 'error' })
    return
  }

  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('type', form.value.type)
  if (form.value.valid_until) formData.append('valid_until', form.value.valid_until)
  formData.append('file', form.value.file)

  emit('upload', formData)
}

// Method called by parent to reset state when upload completes
defineExpose({
  reset() {
    form.value = { name: '', type: '', valid_until: '', file: null }
    if (fileInput.value) fileInput.value.value = ''
    uploading.value = false
  },
  setUploading(status: boolean) {
    uploading.value = status
  }
})
</script>

<template>
  <UModal v-model:open="isOpen" description="Unggah dokumen persyaratan baru Anda" title="Unggah Dokumen">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
           <UIcon name="i-lucide-file-up" class="w-5 h-5 text-primary-600" />
           <span class="font-semibold text-lg">Unggah Dokumen Baru</span>
        </div>
      </div>
    </template>

    <template #body>
      <form @submit.prevent="submitForm" class="space-y-4" id="upload-doc-form">
        <UFormGroup label="Nama Dokumen" required>
          <UInput v-model="form.name" placeholder="Misal: STR Tahun 2025" required />
        </UFormGroup>

        <UFormGroup label="Jenis Dokumen" required>
          <USelect
            v-model="form.type"
            :items="documentTypes"
            placeholder="Pilih jenis dokumen"
            required
            value-key="value"
          />
        </UFormGroup>

        <UFormGroup label="Berlaku Hingga">
          <UInput type="date" v-model="form.valid_until" />
          <p class="text-xs text-gray-500 mt-1">Kosongkan jika berlaku seumur hidup</p>
        </UFormGroup>

        <UFormGroup label="File Dokumen" required>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept=".pdf,.jpg,.jpeg,.png"
            class="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
            required
          />
          <p class="text-xs text-gray-500 mt-1">Format: PDF, JPG, PNG. Maksimal 5MB.</p>
        </UFormGroup>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Batal" @click="handleClose" />
        <UButton type="submit" form="upload-doc-form" color="primary" label="Unggah" icon="i-lucide-upload" :loading="uploading" />
      </div>
    </template>
  </UModal>
</template>

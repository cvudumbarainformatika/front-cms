<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': [typeName: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { $apiFetch } = useNuxtApp() as any
const toast = useToast()

const form = ref({
  typedokumen: ''
})

const loading = ref(false)

async function submitForm() {
  if (!form.value.typedokumen.trim()) {
    toast.add({ title: 'Validasi', description: 'Nama tipe dokumen wajib diisi', color: 'error' })
    return
  }

  loading.value = true
  try {
    await $apiFetch('/typedokumen', {
      method: 'POST',
      body: { typedokumen: form.value.typedokumen }
    })
    toast.add({ title: 'Berhasil', description: 'Tipe dokumen berhasil ditambahkan', color: 'success' })
    emit('success', form.value.typedokumen)
    handleClose()
  } catch (err: any) {
    toast.add({
      title: 'Gagal',
      description: err?.data?.message || 'Gagal menambah tipe dokumen',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

function handleClose() {
  emit('update:modelValue', false)
  form.value.typedokumen = ''
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-plus-circle" class="w-5 h-5 text-primary-600" />
          <h2 class="font-semibold text-lg">Tambah Tipe Dokumen</h2>
        </div>
      </div>
    </template>

    <template #body>
      <form @submit.prevent="submitForm" class="space-y-4" id="add-type-form">
        <UFormField label="Nama Tipe Dokumen" required>
          <UInput
            v-model="form.typedokumen"
            placeholder="Misal: Surat Keterangan Sehat"
            required
            size="md"
            class="w-full"
          />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Batal" @click="handleClose" />
        <UButton type="submit" form="add-type-form" color="primary" label="Simpan" :loading="loading" />
      </div>
    </template>
  </UModal>
</template>

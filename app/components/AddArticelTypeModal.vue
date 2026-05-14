<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': [typeName: string]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const { $apiFetch } = useNuxtApp() as any
const toast = useToast()

const form = ref({
  typeartikel: ''
})

const loading = ref(false)

async function submitForm() {
  if (!form.value.typeartikel.trim()) {
    toast.add({
      title: 'Validasi',
      description: 'Nama tipe Artikel wajib diisi',
      color: 'error'
    })
    return
  }

  loading.value = true

  try {
    const response: any = await $apiFetch('/typeartikel', {
      method: 'POST',
      body: {
        typeartikel: form.value.typeartikel
      }
    })

    toast.add({
      title: 'Berhasil',
      description: 'Tipe artikel berhasil ditambahkan',
      color: 'success'
    })

    emit('success', response.data.typeartikel)

    handleClose()

  } catch (err: any) {
    toast.add({
      title: 'Gagal',
      description: err?.data?.message || 'Gagal menambah tipe artikel',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}


function handleClose() {
  emit('update:open', false)
  form.value.typeartikel = ''
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
     :ui="{
    overlay: 'fixed inset-0 bg-black/50 z-[9998]',
    content: 'fixed z-[9999] bg-white dark:bg-neutral-900'
  }"
    title="Tambah Kategori Artikel"
    description="Form Tambah Kategori Artikel baru"
  >
    <template #body>
      <form
        id="add-type-form"
        class="space-y-4"
        @submit.prevent="submitForm"
      >
        <UFormField
          label="Nama Tipe Artikel"
          required
        >
          <UInput
            v-model="form.typeartikel"
            placeholder="Misal: Kesehatan Paru,Kesehatan JAntung"
            class="w-full"
          />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          label="Batal"
          @click="handleClose"
        />

        <UButton
          type="submit"
          form="add-type-form"
          color="primary"
          label="Simpan"
          :loading="loading"
        />
      </div>
    </template>
  </UModal>
</template>

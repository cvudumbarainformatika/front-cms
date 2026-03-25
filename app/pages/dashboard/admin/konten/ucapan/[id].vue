<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

const id = route.params.id

// Fetch greeting data
const { data: greeting } = await useAsyncData(
  `greeting-${id}`,
  () => $apiFetch<{ success: boolean, data: any }>(`/greetings/${id}`)
)

const form = reactive({
  title: '',
  content: '',
  image_url: '',
  is_active: true
})

// Initialize form from data
watchEffect(() => {
  if (greeting.value?.data) {
    const g = greeting.value.data
    form.title = g.title
    form.content = g.content
    form.image_url = g.image_url
    form.is_active = g.is_active
  }
})

const errors = reactive<{ title?: string; content?: string }>({})

const saving = ref(false)
async function save() {
  errors.title = !form.title ? 'Judul harus diisi' : undefined
  errors.content = !form.content ? 'Konten harus diisi' : undefined
  
  if (errors.title || errors.content) return

  saving.value = true
  try {
    await $apiFetch(`/greetings/${id}`, { 
      method: 'PUT', 
      body: form 
    })
    toast.add({ title: 'Ucapan berhasil diperbarui', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Gagal memperbarui', description: error.data?.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

// File upload
const uploadedFile = ref<File | null>(null)
const imagePreview = ref<string>('')

watch(uploadedFile, async (newFile) => {
  if (!newFile) return
  imagePreview.value = URL.createObjectURL(newFile)
  
  const fd = new FormData()
  fd.append('file', newFile)
  
  try {
    const res: any = await $apiFetch('/upload?type=galeri', { method: 'POST', body: fd })
    if (res?.data?.url) {
      form.image_url = res.data.url 
      toast.add({ title: 'Gambar berhasil diunggah', color: 'success' })
    }
  } catch (error: any) {
    toast.add({ title: 'Gagal unggah gambar', description: error.data?.message, color: 'error' })
  }
})

const displayImageUrl = computed(() => {
  if (imagePreview.value) return imagePreview.value
  if (form.image_url) return getImageUrl(form.image_url)
  return ''
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Edit Ucapan</h1>
        <p class="text-muted">Perbarui ucapan hari besar</p>
      </div>
      <div class="flex gap-2">
        <UButton to="/dashboard/admin/konten/ucapan" variant="ghost" label="Kembali" />
        <UButton :loading="saving" icon="i-lucide-save" label="Simpan Perubahan" color="primary" @click="save" />
      </div>
    </div>

    <div v-if="greeting?.data" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <div class="space-y-4">
            <UFormField label="Judul Ucapan" :error="errors.title" required>
              <UInput v-model="form.title" size="lg" />
            </UFormField>

            <UFormField label="Pesan / Konten" :error="errors.content" required>
              <UTextarea v-model="form.content" :rows="8" />
            </UFormField>
          </div>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard title="Gambar & Pengaturan">
          <div class="space-y-6">
            <UFormField label="Gambar Ucapan (Thumbnail)">
              <UFileUpload
                v-slot="{ open, removeFile }"
                v-model="uploadedFile"
                accept="image/*"
              >
                <div class="w-full min-h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-500 transition-colors" @click="open()">
                  <template v-if="displayImageUrl">
                    <img :src="displayImageUrl" class="max-h-32 object-contain rounded" />
                    <div class="flex gap-2">
                      <UButton label="Ganti" variant="outline" size="xs" @click.stop="open()" />
                      <UButton label="Hapus" color="error" variant="outline" size="xs" @click.stop="removeFile(); form.image_url = ''; imagePreview = ''" />
                    </div>
                  </template>
                  <template v-else>
                    <UIcon name="i-lucide-image" class="w-8 h-8 text-gray-400" />
                    <p class="text-xs text-center text-gray-500">Klik untuk unggah gambar</p>
                  </template>
                </div>
              </UFileUpload>
            </UFormField>

            <UFormField label="Status Aktif">
               <USwitch v-model="form.is_active" />
            </UFormField>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

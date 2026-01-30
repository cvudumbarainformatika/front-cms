<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import TiptapEditor from '~/components/editor/TiptapEditor.vue'

const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()


const form = reactive({
  title: '',
  excerpt: '',
  content: '<p>Tulis konten disini...</p>',
  image_url: '',
  category: '',
  tags: [] as string[],
  author: 'Admin', // Default author
  status: 'draft' as 'draft'|'published',
  published_at: ''
})



function slugify (text: string) {
  return (text || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// File upload using v-model
const uploadedFile = ref<File | null>(null)
const imagePreview = ref<string>('') // untuk preview langsung

watch(uploadedFile, async (newFile) => {
  if (!newFile) return
  
  // Set preview langsung dengan blob URL
  imagePreview.value = URL.createObjectURL(newFile)
  
  const fd = new FormData()
  fd.append('file', newFile)
  
  try {
    const res = await $apiFetch('/upload?type=berita', { 
      method: 'POST', 
      body: fd
    }) as any
    
    if (res?.data?.url) {
      form.image_url = res.data.url 
      toast.add({ title: 'Gambar berhasil diupload', color: 'success' })
    }
  } catch (error: any) {
    toast.add({ title: 'Gagal upload', description: error?.data?.message || error.message, color: 'error' })
  }
})

// Computed untuk mendapatkan URL preview yang tepat
const displayImageUrl = computed(() => {
  if (imagePreview.value) return imagePreview.value
  if (form.image_url) return getImageUrl(form.image_url)
  return ''
})



const saving = ref(false)
async function save(status?: 'draft'|'published') {
  if (status) form.status = status
  if (!form.title || !form.content) {
    toast.add({ title: 'Validasi', description: 'Judul & Konten wajib', color: 'warning' })
    return
  }
  saving.value = true
  try {
    const res = await $apiFetch('/berita', { method: 'POST', body: form })
    toast.add({ title: 'Berita berhasil dibuat', color: 'success' })
    router.push(`/dashboard/admin/konten/berita/${(res as any).data.id}`)
  } catch (e: any) {
    toast.add({ title: 'Gagal', description: e?.data?.message || 'Gagal menyimpan', color: 'error' })
  } finally {
    saving.value = false
  }
}

// Preset kategori & validasi ringan
const categoryOptions = [
  { label: 'Umum', value: 'umum' },
  { label: 'Ilmiah', value: 'ilmiah' },
  { label: 'Kegiatan', value: 'kegiatan' },
  { label: 'Pengumuman', value: 'pengumuman' },
  { label: 'Prestasi', value: 'prestasi' }
]

const errors = reactive<{ title?: string; category?: string; tags?: string; content?: string }>({})
watch(() => form.title, v => { errors.title = v ? undefined : 'Judul wajib' })
watch(() => form.category, v => { errors.category = v ? undefined : 'Kategori wajib' })
watch(() => form.tags, v => { errors.tags = (v && v.length) ? undefined : 'Tags wajib diisi' }, { deep: true })
watch(() => form.content, v => { errors.content = v ? undefined : 'Konten wajib' })

const tagInput = ref('')
function addTag () {
  const val = tagInput.value.trim()
  if (!val) return
  if (!form.tags.includes(val)) form.tags = [...form.tags, val]
  tagInput.value = ''
  errors.tags = form.tags.length ? '' : 'Tags wajib diisi'
}
function removeTag (t: string) {
  form.tags = form.tags.filter(x => x !== t)
  errors.tags = form.tags.length ? '' : 'Tags wajib diisi'
}
</script>

<template>
  <div class="space-y-4">
    <UPageHeader title="Berita Baru" description="Tulis berita, simpan sebagai draft atau publish">
      <template #links>
        <div class="flex gap-2">
          <UButton to="/dashboard/admin/konten/berita" icon="i-lucide-arrow-left" variant="outline">Kembali</UButton>
          <UButton :loading="saving" :disabled="!form.title || !form.content" icon="i-lucide-archive" @click="save('draft')">Simpan Draft</UButton>
          <UButton :loading="saving" :disabled="!form.title || !form.content" icon="i-lucide-send" color="primary" @click="save('published')">Publish</UButton>
        </div>
      </template>
    </UPageHeader>

    <UCard>
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Main Content Area (span 9) -->
        <div class="xl:col-span-9 space-y-4">
          <!-- Title Field - WordPress Style: Large and Prominent -->
          <UFormField label="Judul" :error="errors.title" required class="mb-4">
            <UInput 
              v-model="form.title" 
              placeholder="Tambahkan judul berita" 
              class="w-full text-2xl font-semibold placeholder:text-gray-400 placeholder:font-normal"
            />
          </UFormField>

          <!-- Excerpt Field -->
          <UFormField label="Excerpt (Ringkasan)">
            <UTextarea v-model="form.excerpt" :rows="3" placeholder="Ringkasan singkat yang menarik" class="w-full" />
          </UFormField>

          <!-- Content Editor -->
          <UFormField label="Konten Berita" :error="errors.content" class="h-full flex flex-col">
            <ClientOnly>
              <TiptapEditor v-model="form.content" class="min-h-[600px]" />
            </ClientOnly>
          </UFormField>
        </div>

        <!-- Sidebar Kanan: Metadata (span 3) -->
        <div class="xl:col-span-3 space-y-4 bg-elevated p-4 rounded-lg">
          <UFormField label="Cover Image">
            <UFileUpload
              v-slot="{ open, removeFile }"
              v-model="uploadedFile"
              accept="image/*"
            >
              <div class="w-full min-h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary-500 transition-colors" @click="open()">
                <template v-if="displayImageUrl">
                  <img 
                    :src="displayImageUrl" 
                    alt="cover" 
                    class="max-h-40 object-contain rounded"
                  />
                  <div class="flex gap-2">
                    <UButton label="Ganti" color="neutral" variant="outline" size="xs" @click.stop="open()" />
                    <UButton label="Hapus" color="error" variant="outline" size="xs" @click.stop="removeFile(); form.image_url = ''; imagePreview = ''" />
                  </div>
                </template>

                <template v-else>
                  <UIcon name="i-lucide-image" class="w-10 h-10 text-gray-400" />
                  <p class="text-sm text-gray-500">Klik untuk upload gambar</p>
                  <p class="text-xs text-gray-400">PNG, JPG atau WEBP (max. 20MB)</p>
                </template>
              </div>
            </UFileUpload>
          </UFormField>

          <UFormField label="Kategori" :error="errors.category">
            <USelect v-model="form.category" :items="categoryOptions" placeholder="Pilih kategori" class="w-full" />
          </UFormField>

          <UFormField label="Penulis">
            <UInput v-model="form.author" placeholder="Nama penulis" class="w-full" />
          </UFormField>

          <UFormField label="Tags" :error="errors.tags" hint="Tekan Enter untuk menambahkan tag">
            <div class="flex flex-wrap gap-1 mb-2">
              <UBadge v-for="t in form.tags" :key="t" :label="t" variant="subtle" class="cursor-pointer" @click="removeTag(t)" />
            </div>
            <UInput v-model="tagInput" placeholder="Ketik tag lalu Enter" @keyup.enter.prevent="addTag" class="w-full" />
          </UFormField>

          <UFormField label="Status">
            <URadioGroup v-model="form.status" :items="[
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' }
            ]" />
          </UFormField>

          <UFormField label="Tanggal Publish" hint="Kosongkan untuk otomatis saat publish">
            <UInput v-model="form.published_at" type="datetime-local" class="w-full" />
          </UFormField>
        </div>
      </div>
    </UCard>

    <!-- Bottom Action Buttons -->
    <div class="flex justify-end gap-2 pt-4">
      <UButton to="/dashboard/admin/konten/berita" label="Kembali" variant="outline" icon="i-lucide-arrow-left" />
      <UButton :loading="saving" :disabled="!form.title || !form.content" icon="i-lucide-archive" @click="save('draft')">Simpan Draft</UButton>
      <UButton :loading="saving" :disabled="!form.title || !form.content" icon="i-lucide-send" color="primary" @click="save('published')">Publish</UButton>
    </div>
  </div>
</template>

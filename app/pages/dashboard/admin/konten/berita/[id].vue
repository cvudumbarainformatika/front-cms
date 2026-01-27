<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import TiptapEditor from '~/components/editor/TiptapEditor.vue'
import { useDebounceFn } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()


const id = route.params.id as string

// Fetch berita by ID - first get slug from list, then fetch detail
const { data: beritaData, refresh } = await useAsyncData(
  `berita-edit-${id}`,
  async () => {
    try {
      // First, fetch list to find the slug
      const listResponse = await $apiFetch('/berita', {
        query: { limit: 1000 }
      })
      const items = listResponse?.data?.items || []
      const beritaFromList = items.find((b: any) => String(b.id) === String(id))
      
      if (!beritaFromList) {
        return null
      }
      
      // Then fetch detail by slug to get full content
      const detailResponse = await $apiFetch(`/berita/${beritaFromList.slug}`)
      return detailResponse
    } catch (error) {
      return null
    }
  }
)

const current = computed(() => beritaData.value?.data)

const form = reactive({
  title: '', 
  excerpt: '', 
  content: '', 
  image_url: '', 
  category: '', 
  tags: [] as string[], 
  author: '',
  status: 'draft' as 'draft'|'published', 
  published_at: ''
})



watchEffect(() => {
  if (current.value) {
    form.title = current.value.title || ''
    form.excerpt = current.value.excerpt || ''
    form.content = current.value.content || ''
    form.image_url = current.value.image_url || ''
    form.category = current.value.category || ''
    form.tags = current.value.tags || []
    form.author = current.value.author || ''
    form.status = (current.value.status || 'draft')
    // Convert published_at from backend format
    if (current.value.published_at) {
      const date = new Date(current.value.published_at)
      form.published_at = date.toISOString().slice(0, 16)
    }
  }
})


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
    await $apiFetch(`/berita/${id}`, { method: 'PUT', body: form })
    toast.add({ title: 'Berita berhasil diupdate', color: 'success' })
    refresh()
  } catch (e: any) {
    toast.add({ title: 'Gagal', description: e?.data?.message || 'Gagal menyimpan', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function toggleStatus() {
  const next = form.status === 'published' ? 'draft' : 'published'
  try {
    await $apiFetch(`/berita/${id}`, { method: 'PATCH', body: { status: next } })
    toast.add({ title: next==='published'?'Dipublish':'Kembali draft', color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Gagal', description: error.message, color: 'error' })
  }
}

// Autosave (debounce)

const doAutosave = useDebounceFn(async () => {
  if (!form.title || !form.content) return
  try {
    await $apiFetch(`/berita/${id}`, { method: 'PUT', body: form })
  } catch (e) { /* ignore autosave error */ }
}, 1200)

watch(form, () => doAutosave(), { deep: true })


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
  errors.tags = form.tags.length ? undefined : 'Tags wajib diisi'
}
function removeTag (t: string) {
  form.tags = form.tags.filter(x => x !== t)
  errors.tags = form.tags.length ? undefined : 'Tags wajib diisi'
}
</script>

<template>
  <div class="space-y-6">
    <UPageHeader :title="`Edit Berita`" :description="`ID: ${id}`">
      <template #links>
        <div class="flex gap-2">
           <UButton v-if="current?.slug" :to="`/berita/${current.slug}`" target="_blank" variant="outline" icon="i-lucide-external-link">Lihat Halaman</UButton>
          <UButton to="/dashboard/admin/konten/berita" icon="i-lucide-arrow-left" variant="outline">Kembali</UButton>
          <UButton :loading="saving" icon="i-lucide-save" @click="save()">Simpan</UButton>
          <UButton :loading="saving" :icon="form.status==='published'?'i-lucide-archive':'i-lucide-send'" color="primary" @click="toggleStatus">
            {{ form.status==='published' ? 'Unpublish' : 'Publish' }}
          </UButton>
        </div>
      </template>
    </UPageHeader>



    <UCard>
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Kiri: seluruh pengaturan (span 3) -->
        <div class="xl:col-span-3 space-y-4">
          <UFormField label="Judul" :error="errors.title" required>
            <UInput v-model="form.title" placeholder="Judul berita" />
          </UFormField>
          <UFormField label="Excerpt">
            <UTextarea v-model="form.excerpt" :rows="6" placeholder="Ringkasan singkat yang menarik" />
          </UFormField>
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
                    <UButton label="Change" color="neutral" variant="outline" size="xs" @click.stop="open()" />
                    <UButton label="Remove" color="error" variant="outline" size="xs" @click.stop="removeFile(); form.image_url = ''; imagePreview = ''" />
                  </div>
                </template>

                <template v-else>
                  <UIcon name="i-lucide-image" class="w-10 h-10 text-gray-400" />
                  <p class="text-sm text-gray-500">Drop your image here or click to browse</p>
                  <p class="text-xs text-gray-400">PNG, JPG or WEBP (max. 20MB)</p>
                </template>
              </div>
            </UFileUpload>
          </UFormField>


          <UFormField label="Kategori" :error="errors.category">
            <USelect v-model="form.category" :items="categoryOptions" placeholder="Pilih kategori" />
          </UFormField>
          <UFormField label="Penulis">
            <UInput v-model="form.author" placeholder="Nama penulis" />
          </UFormField>
          <UFormField label="Tags" :error="errors.tags" hint="Tekan Enter untuk menambahkan tag">
            <div class="flex flex-wrap gap-1 mb-2">
              <UBadge v-for="t in form.tags" :key="t" :label="t" variant="subtle" @click="removeTag(t)" class="cursor-pointer" />
            </div>
            <UInput v-model="tagInput" placeholder="Ketik tag lalu Enter" @keyup.enter.prevent="addTag" />
          </UFormField>
          <UFormField label="Status">
            <UBadge :label="form.status.toUpperCase()" :color="form.status==='published'?'primary':'neutral'" />
          </UFormField>
          <UFormField label="Tanggal Publish">
            <UInput v-model="form.published_at" type="datetime-local" />
          </UFormField>
        </div>

        <!-- Kanan: WYSIWYG (span 9) -->
        <div class="xl:col-span-9 space-y-4">
          <UFormField label="Konten (WYSIWYG)" :error="errors.content">
            <ClientOnly>
              <TiptapEditor v-model="form.content" />
            </ClientOnly>
          </UFormField>
        </div>
      </div>
    </UCard>
  </div>
</template>

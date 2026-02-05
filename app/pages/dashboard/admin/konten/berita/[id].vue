<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import TiptapEditor from '~/components/editor/TiptapEditor.vue'
import { useDebounceFn } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()
const { hasMinimumRole } = useRole()


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
  author_id: '', // ID user penulis
  status: 'draft' as 'draft'|'published'|'rejected',
  rejection_reason: '', // NEW
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
    form.author_id = current.value.author_id ? String(current.value.author_id) : '' // Convert ke string
    form.status = (current.value.status || 'draft')
    form.rejection_reason = current.value.rejection_reason || '' // NEW
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
async function save(status?: 'draft'|'published'|'rejected') {
  if (status) form.status = status
  if (!form.title || !form.content) {
    toast.add({ title: 'Validasi', description: 'Judul & Konten wajib', color: 'warning' })
    return
  }
  
  // Validasi rejection_reason jika status = rejected
  if (form.status === 'rejected' && !form.rejection_reason.trim()) {
    toast.add({ 
      title: 'Validasi Gagal', 
      description: 'Alasan penolakan harus diisi jika status "Ditolak"', 
      color: 'error' 
    })
    return
  }
  
  saving.value = true
  try {
    await $apiFetch(`/berita/${id}`, { method: 'PUT', body: form })
    toast.add({ title: 'Artikel berhasil diupdate', color: 'success' })
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
  // Jangan autosave jika title/content kosong atau status rejected (butuh validasi strict)
  if (!form.title || !form.content || form.status === 'rejected') return
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

const errors = reactive<{ title?: string; category?: string; content?: string }>({})
watch(() => form.title, v => { if (v) errors.title = undefined })
watch(() => form.category, v => { if (v) errors.category = undefined })
watch(() => form.content, v => { if (v) errors.content = undefined })

</script>

<template>
  <div class="space-y-4">
    <UPageHeader :title="`Edit Artikel`">
      <template #links>
        <div class="flex gap-2">
          <UButton v-if="current?.slug" :to="`/berita/${current.slug}`" target="_blank" variant="outline" icon="i-lucide-external-link">Lihat Halaman</UButton>
          <UButton to="/dashboard/admin/konten/berita" icon="i-lucide-arrow-left" variant="outline">Kembali</UButton>
          <UButton :loading="saving" :disabled="!form.title || !form.content" icon="i-lucide-save" @click="save()">Simpan</UButton>
          <UButton v-if="hasMinimumRole('admin_pusat')" :loading="saving" :disabled="!form.title || !form.content" :icon="form.status==='published'?'i-lucide-archive':'i-lucide-send'" color="primary" @click="toggleStatus">
            {{ form.status==='published' ? 'Unpublish' : 'Publish' }}
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <!-- Alert untuk Rejection Reason (tampil untuk member jika artikel ditolak) -->
    <UAlert 
      v-if="!hasMinimumRole('admin_pusat') && current?.status === 'rejected' && current?.rejection_reason" 
      color="red" 
      variant="subtle"
      title="Artikel Ditolak"
      icon="i-lucide-circle-x"
      class="mb-4 shadow-sm ring-1 ring-red-200 dark:ring-red-900 bg-red-50 dark:bg-red-950/30"
    >
      <template #description>
        <p class="font-semibold mb-2">Alasan Penolakan:</p>
        <p class="whitespace-pre-wrap">{{ current.rejection_reason }}</p>
        <p v-if="current.rejected_at" class="text-xs mt-3 text-red-600/70 dark:text-red-400/70">
          Ditolak pada: {{ new Date(current.rejected_at).toLocaleString('id-ID') }}
        </p>
      </template>
    </UAlert>

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
          <UFormField label="Konten Artikel" :error="errors.content" class="h-full flex flex-col">
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

          <!-- Field author tetap di-retain dari data existing, tidak perlu input manual -->

          <!-- Status Field (Hanya Admin yang bisa ubah) -->
          <UFormField v-if="hasMinimumRole('admin_pusat')" label="Status">
            <USelect 
              v-model="form.status" 
              :items="[
                { label: 'Draft', value: 'draft' },
                { label: 'Dipublikasi', value: 'published' },
                { label: 'Ditolak', value: 'rejected' }
              ]"
              placeholder="Pilih status"
              class="w-full"
            />
          </UFormField>

          <!-- Rejection Reason (hanya tampil untuk admin jika status = rejected) -->
          <UFormField 
            v-if="hasMinimumRole('admin_pusat') && form.status === 'rejected'" 
            label="Alasan Penolakan" 
            required
            hint="Wajib diisi jika status artikel 'Ditolak'"
          >
            <UTextarea 
              v-model="form.rejection_reason" 
              placeholder="Jelaskan mengapa artikel ini ditolak..." 
              :rows="4"
              class="w-full"
            />
            <template #help>
              <p v-if="!form.rejection_reason" class="text-red-500 text-sm">
                Alasan penolakan wajib diisi
              </p>
            </template>
          </UFormField>


        </div>
      </div>
    </UCard>

    <!-- Bottom Action Buttons -->
    <div class="flex justify-end gap-2 pt-4">
      <UButton to="/dashboard/admin/konten/berita" label="Kembali" variant="outline" icon="i-lucide-arrow-left" />
      <UButton :loading="saving" :disabled="!form.title || !form.content" icon="i-lucide-save" @click="save()">Simpan</UButton>
      <UButton v-if="hasMinimumRole('admin_pusat')" :loading="saving" :disabled="!form.title || !form.content" :icon="form.status==='published'?'i-lucide-archive':'i-lucide-send'" color="primary" @click="toggleStatus">
        {{ form.status==='published' ? 'Unpublish' : 'Publish' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import TiptapEditor from '~/components/editor/TiptapEditor.vue'

const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()

const form = reactive({
  title: '', 
  slug: '', 
  description: '<p>Deskripsi agenda...</p>', 
  image: '', 
  type: 'webinar', 
  date: '', 
  endDate: '', 
  isOnline: false, 
  location: '', 
  fee: '', 
  skp: 0, 
  quota: 0, 
  registered: 0, 
  registrationUrl: '', 
  status: 'draft' as 'draft'|'published'
})

const typeOptions = [
  { label: 'Webinar', value: 'webinar' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Seminar', value: 'seminar' },
  { label: 'Kongres', value: 'kongres' },
  { label: 'Pelatihan', value: 'pelatihan' }
]

const errors = reactive<{ title?: string; slug?: string; type?: string; date?: string; location?: string; description?: string }>({})
watch(() => form.title, v => { errors.title = v ? undefined : 'Judul wajib' })
watch(() => form.slug, v => { errors.slug = v ? undefined : 'Slug wajib' })
watch(() => form.type, v => { errors.type = v ? undefined : 'Jenis wajib' })
watch(() => form.date, v => { errors.date = v ? undefined : 'Tanggal wajib' })
watch(() => form.description, v => { errors.description = v ? undefined : 'Deskripsi wajib' })

function genSlug() { 
  form.slug = (form.slug || form.title).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') 
}

const saving = ref(false)
async function save(status?: 'draft'|'published') {
  if (status) form.status = status
  
  // Validation
  if (!form.title || !form.slug || !form.type || !form.date || !form.description) {
    toast.add({ title: 'Validasi', description: 'Isi bidang wajib', color: 'warning' }); 
    return
  }
  
  saving.value = true
  
  // Construct Payload
  const payload = {
    title: form.title,
    slug: form.slug,
    description: form.description,
    type: form.type,
    date: new Date(form.date).toISOString(), // RFC3339
    end_date: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    is_online: form.isOnline,
    location: form.location,
    skp: Number(form.skp),
    quota: Number(form.quota),
    registration_url: form.registrationUrl,
    image_url: form.image,
    fee: form.fee,
    status: form.status
  }

  try {
    const res: any = await $apiFetch('/agenda', { method: 'POST', body: payload })
    toast.add({ title: 'Tersimpan', color: 'success' })
    router.push(`/dashboard/admin/konten/agenda/${res.data.id}`)
  } catch (e: any) {
    toast.add({ title: 'Gagal', description: e?.statusMessage || e?.data?.message || 'Gagal menyimpan', color: 'error' })
  } finally { saving.value = false }
}

const previewHtml = computed(() => (form.description || '').toString())

const { getImageUrl } = useImageUrl()

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
    const res: any = await $apiFetch('/upload?type=galeri', { 
      method: 'POST', 
      body: fd
    })
    
    if (res?.data?.url) {
      form.image = res.data.url 
      toast.add({ title: 'Gambar berhasil diupload', color: 'success' })
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    toast.add({ title: 'Gagal upload', description: error?.data?.message || error.message, color: 'error' })
  }
})

// Computed untuk mendapatkan URL preview yang tepat
const displayImageUrl = computed(() => {
  if (imagePreview.value) return imagePreview.value
  if (form.image) return getImageUrl(form.image)
  return ''
})
</script>

<template>
  <div class="space-y-6">
    <UPageHeader title="Agenda Baru" description="Buat agenda dan publish">
      <template #links>
        <div class="flex gap-2">
          <UButton to="/dashboard/admin/konten/agenda" icon="i-lucide-arrow-left" variant="outline">Kembali</UButton>
          <UButton :loading="saving" icon="i-lucide-archive" @click="save('draft')">Simpan Draft</UButton>
          <UButton :loading="saving" icon="i-lucide-send" color="primary" @click="save('published')">Publish</UButton>
        </div>
      </template>
    </UPageHeader>

    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div class="md:col-span-3 space-y-4">
          <UFormField label="Judul" :error="errors.title" required>
            <UInput v-model="form.title" placeholder="Judul agenda" @blur="genSlug" class="w-full" />
          </UFormField>
          <UFormField label="Slug" :error="errors.slug">
            <div class="flex gap-2">
              <UInput v-model="form.slug" placeholder="otomatis dari judul" />
              <UButton variant="outline" @click="genSlug" icon="i-lucide-refresh-ccw">Generate</UButton>
            </div>
          </UFormField>
          <UFormField label="Jenis" :error="errors.type">
            <USelect v-model="form.type" :items="typeOptions" placeholder="Pilih jenis" />
          </UFormField>
          <UFormField label="Tanggal Mulai" :error="errors.date">
            <UInput v-model="form.date" type="datetime-local" />
          </UFormField>
          <UFormField label="Tanggal Selesai">
            <UInput v-model="form.endDate" type="datetime-local" />
          </UFormField>
          <UFormField label="Online?">
            <USwitch v-model="form.isOnline" />
          </UFormField>
          <UFormField label="Lokasi">
            <UInput v-model="form.location" placeholder="Lokasi acara" />
          </UFormField>
          <UFormField label="Biaya">
            <UInput v-model="form.fee" placeholder="Gratis / Rp ..." />
          </UFormField>
          <UFormField label="SKP">
            <UInput v-model.number="form.skp" type="number" min="0" step="0.5" />
          </UFormField>
          <UFormField label="Kuota">
            <UInput v-model.number="form.quota" type="number" min="0" />
          </UFormField>
          <UFormField label="URL Pendaftaran">
            <UInput v-model="form.registrationUrl" placeholder="https://..." />
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
                     <UButton label="Remove" color="error" variant="outline" size="xs" @click.stop="removeFile(); form.image = ''; imagePreview = ''" />
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
          <UFormField label="Status">
            <URadioGroup v-model="form.status" :items="[
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' }
            ]" />
          </UFormField>
        </div>
        <div class="md:col-span-9 space-y-4">
          <UTabs :items="[{ label: 'Deskripsi', value: 'desc' }, { label: 'Preview', value: 'preview' }]" />
          <UFormField label="Deskripsi (WYSIWYG)" :error="errors.description">
            <ClientOnly>
              <TiptapEditor v-model="form.description" />
            </ClientOnly>
          </UFormField>
          <div class="prose max-w-none border border-default rounded-lg p-4">
            <div v-html="previewHtml" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
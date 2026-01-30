<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import TiptapEditor from '~/components/editor/TiptapEditor.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { $apiFetch } = useNuxtApp()

const id = route.params.id as string

// Fetch agenda by ID - workaround finding in list
const { data: agendaData, refresh } = await useAsyncData(
  `agenda-edit-${id}`,
  async () => {
    try {
      // Fetch list with high limit to find by ID
      // Do not filter by status to get all (draft + published)
      const listResponse = await $apiFetch('/agenda', {
        query: { limit: 1000 } 
      })
      const items = listResponse?.data?.items || []
      const found = items.find((b: any) => String(b.id) === String(id))
      
      if (!found) {
        // If not found in list (e.g. pagination > 1000), ideally we need GetByID endpoint.
        // For now, assume < 1000 items. 
        // Or if we implemented GetBySlug, we could try that if we knew the slug? No.
        // Fallback: If GetBySlug was available via some other means.
        console.error('Agenda not found in list with ID:', id)
        return null
      }
      return found
    } catch (error) {
      console.error('Error fetching agenda:', error)
      return null
    }
  }
)

const current = computed(() => agendaData.value)

const form = reactive({
  title: '', slug: '', description: '', image: '', type: 'webinar', date: '', endDate: '', isOnline: false, location: '', fee: '', skp: 0, quota: 0, registered: 0, registrationUrl: '', status: 'draft' as 'draft'|'published'
})

watchEffect(() => {
  if (current.value) {
    form.title = current.value.title || ''
    form.slug = current.value.slug || ''
    form.description = current.value.description || ''
    form.image = current.value.image_url || ''
    form.type = current.value.type || 'webinar'
    
    // Dates
    form.date = current.value.date ? new Date(current.value.date).toISOString().slice(0, 16) : ''
    form.endDate = current.value.end_date ? new Date(current.value.end_date).toISOString().slice(0, 16) : ''
    
    form.isOnline = !!current.value.is_online
    form.location = current.value.location || ''
    form.fee = current.value.fee || ''
    form.skp = Number(current.value.skp) || 0
    form.quota = Number(current.value.quota) || 0
    form.registrationUrl = current.value.registration_url || ''
    form.status = (current.value.status || 'draft') as 'draft'|'published'
  }
})

const typeOptions = [
  { label: 'Webinar', value: 'webinar' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Seminar', value: 'seminar' },
  { label: 'Kongres', value: 'kongres' },
  { label: 'Pelatihan', value: 'pelatihan' }
]

const errors = reactive<{ title?: string; slug?: string; type?: string; date?: string; description?: string }>({})
watch(() => form.title, v => { errors.title = v ? undefined : 'Judul wajib' })
watch(() => form.slug, v => { errors.slug = v ? undefined : 'Slug wajib' })
watch(() => form.type, v => { errors.type = v ? undefined : 'Jenis wajib' })
watch(() => form.date, v => { errors.date = v ? undefined : 'Tanggal wajib' })
watch(() => form.description, v => { errors.description = v ? undefined : 'Deskripsi wajib' })

const saving = ref(false)
function genSlug() { 
  form.slug = (form.slug || form.title).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') 
}

async function save(status?: 'draft'|'published') {
  if (status) form.status = status
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
    date: new Date(form.date).toISOString(),
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
    await $apiFetch(`/agenda/${id}`, { method: 'PUT', body: payload })
    toast.add({ title: 'Tersimpan', color: 'success' })
    refresh()
  } catch (e: any) { 
    toast.add({ title: 'Gagal', description: e?.statusMessage || e?.data?.message || 'Gagal menyimpan', color: 'error' }) 
  } finally { 
    saving.value = false 
  }
}

async function toggleStatus () {
  const next = form.status === 'published' ? 'draft' : 'published'
  try {
    await $apiFetch(`/agenda/${id}`, { method: 'PATCH', body: { status: next } })
    toast.add({ title: next==='published'?'Dipublish':'Kembali draft', color: 'success' })
    refresh() // Re-fetch list to get updated data
  } catch (e: any) {
    toast.add({ title: 'Gagal update status', description: e.message, color: 'error' })
  }
}



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
  <div class="space-y-4">
    <UPageHeader :title="`Edit Agenda`">
      <template #links>
        <div class="flex gap-2">
          <UButton v-if="form.slug" :to="`/agenda/${form.slug}`" target="_blank" variant="outline" icon="i-lucide-external-link">Lihat Halaman</UButton>
          <UButton to="/dashboard/admin/konten/agenda" icon="i-lucide-arrow-left" variant="outline">Kembali</UButton>
          <UButton :loading="saving" :disabled="!form.title || !form.description" icon="i-lucide-save" @click="save()">Simpan</UButton>
          <UButton :loading="saving" :disabled="!form.title || !form.description" :icon="form.status==='published'?'i-lucide-archive':'i-lucide-send'" color="primary" @click="toggleStatus">
            {{ form.status==='published' ? 'Unpublish' : 'Publish' }}
          </UButton>
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
              placeholder="Tambahkan judul agenda" 
              @blur="genSlug"
              class="w-full text-2xl font-semibold placeholder:text-gray-400 placeholder:font-normal"
            />
          </UFormField>

          <!-- Description Editor -->
          <UFormField label="Deskripsi Agenda" :error="errors.description" class="h-full flex flex-col">
            <ClientOnly>
              <TiptapEditor v-model="form.description" class="min-h-[600px]" />
            </ClientOnly>
          </UFormField>
        </div>

        <!-- Sidebar Kanan: Metadata (span 3) -->
        <div class="xl:col-span-3 space-y-4 bg-elevated p-4 rounded-lg">
          <UFormField label="Slug" :error="errors.slug">
            <div class="flex gap-2">
              <UInput v-model="form.slug" placeholder="otomatis dari judul" class="flex-1" />
              <UButton variant="outline" @click="genSlug" icon="i-lucide-refresh-ccw" size="xs">Gen</UButton>
            </div>
          </UFormField>

          <UFormField label="Jenis" :error="errors.type">
            <USelect v-model="form.type" :items="typeOptions" placeholder="Pilih jenis" class="w-full" />
          </UFormField>

          <UFormField label="Tanggal Mulai" :error="errors.date">
            <UInput v-model="form.date" type="datetime-local" class="w-full" />
          </UFormField>

          <UFormField label="Tanggal Selesai">
            <UInput v-model="form.endDate" type="datetime-local" class="w-full" />
          </UFormField>

          <UFormField label="Online?">
            <USwitch v-model="form.isOnline" />
          </UFormField>

          <UFormField label="Lokasi">
            <UInput v-model="form.location" placeholder="Lokasi acara" class="w-full" />
          </UFormField>

          <UFormField label="Biaya">
            <UInput v-model="form.fee" placeholder="Gratis / Rp ..." class="w-full" />
          </UFormField>

          <UFormField label="SKP">
            <UInput v-model.number="form.skp" type="number" min="0" step="0.5" class="w-full" />
          </UFormField>

          <UFormField label="Kuota">
            <UInput v-model.number="form.quota" type="number" min="0" class="w-full" />
          </UFormField>

          <UFormField label="URL Pendaftaran">
            <UInput v-model="form.registrationUrl" placeholder="https://..." class="w-full" />
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
                    <UButton label="Ganti" color="neutral" variant="outline" size="xs" @click.stop="open()" />
                    <UButton label="Hapus" color="error" variant="outline" size="xs" @click.stop="removeFile(); form.image = ''; imagePreview = ''" />
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

          <UFormField label="Status">
            <UBadge :label="form.status.toUpperCase()" :color="form.status==='published'?'primary':'neutral'" />
          </UFormField>
        </div>
      </div>
    </UCard>

    <!-- Bottom Action Buttons -->
    <div class="flex justify-end gap-2 pt-4">
      <UButton to="/dashboard/admin/konten/agenda" label="Kembali" variant="outline" icon="i-lucide-arrow-left" />
      <UButton :loading="saving" :disabled="!form.title || !form.description" icon="i-lucide-save" @click="save()">Simpan</UButton>
      <UButton :loading="saving" :disabled="!form.title || !form.description" :icon="form.status==='published'?'i-lucide-archive':'i-lucide-send'" color="primary" @click="toggleStatus">
        {{ form.status==='published' ? 'Unpublish' : 'Publish' }}
      </UButton>
    </div>
  </div>
</template>
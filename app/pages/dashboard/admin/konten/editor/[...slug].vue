<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TiptapEditor from '~/components/editor/TiptapEditor.vue'
import { definePageMeta, useRoute, useFetch, useToast, navigateTo, useNuxtApp } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { useImageUrl } from '~/composables/useImageUrl'

definePageMeta({ 
  layout: 'dashboard',
  ssr: false 
})

const route = useRoute()
const toast = useToast()
const { isAdmin, authState, userRole } = useAuth()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

onMounted(() => {
  if (!isAdmin.value) navigateTo('/dashboard')
})

const slug = computed(() => {
  const p = route.params.slug
  const s = Array.isArray(p) ? p.join('/') : (p || '')
  return s.replace(/^\/+/, '')
})

const { data: contentRes, pending } = await useFetch<any>(`/backend/dynamic-content/${slug.value}`, {
  key: `content-${slug.value}`
})

// UI Refs
const editorRef = ref<HTMLElement | null>(null)

const form = ref({
  title: '',
  description: '',
  body: '', // Keep for compatibility but unused in UI
  html: '<h1>Tulis konten di sini</h1>',
  date: new Date().toISOString(),
  image: { src: '' },
  authors: [] as Array<{ name: string; to?: string; avatar?: { src: string } }>,
  badge: { label: '' }
})

if (contentRes.value?.data) {
  const d = contentRes.value.data
  form.value.title = d.title || ''
  form.value.description = d.description || ''
  form.value.body = d.body || ''
  form.value.html = d.html || '<h1>Tulis konten di sini</h1>'
  form.value.date = d.date || new Date().toISOString()
  form.value.image = d.image || { src: '' }
  // Support legacy format where image might be a string in some future refactor, but for now stick to struct
  if (typeof d.image === 'string') form.value.image = { src: d.image }
  
  form.value.authors = d.authors || []
  form.value.badge = d.badge || { label: '' }
}

// --- Image Upload Logic ---
const uploadedFile = ref<File | null>(null)
const imagePreview = ref<string>('')

watch(uploadedFile, async (newFile) => {
  if (!newFile) return
  
  imagePreview.value = URL.createObjectURL(newFile)
  
  const fd = new FormData()
  fd.append('file', newFile)
  
  try {
    // Gunakan endpoint upload type galeri sesuai folder yang ada
    const res: any = await $apiFetch('/upload?type=galeri', { 
      method: 'POST', 
      body: fd
    })
    
    if (res?.data?.url) {
      form.value.image.src = res.data.url 
      toast.add({ title: 'Gambar berhasil diupload', color: 'success' })
    }
  } catch (error: any) {

    toast.add({ title: 'Gagal upload', description: error?.data?.message || 'Terjadi kesalahan saat upload', color: 'error' })
  }
})

const displayImageUrl = computed(() => {
  if (imagePreview.value) return imagePreview.value
  if (form.value.image.src) return getImageUrl(form.value.image.src)
  return ''
})
// --------------------------

const saving = ref(false)
async function onSave() {
  if (!form.value.title) {
    toast.add({ title: 'Validasi', description: 'Judul wajib diisi', color: 'warning' })
    return
  }
  saving.value = true
  try {
    await $apiFetch('/dynamic-content', { 
      method: 'POST',
      body: {
        slug: slug.value,
        ...form.value
      }
    })
    toast.add({ title: 'Tersimpan', description: 'Konten berhasil disimpan', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Gagal', description: e?.data?.message || e?.message || 'Gagal menyimpan konten', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <UPageHeader :title="`Edit Konten`" :description="`Slug: /${slug}`">
      <template #links>
        <div class="flex gap-2">
          <UButton :to="`/${slug}`" target="_blank" label="Lihat Halaman" variant="outline" icon="i-lucide-external-link" />
          <UButton to="/dashboard/admin/konten/menu" label="Kembali" variant="outline" icon="i-lucide-arrow-left" />
          <UButton :loading="saving" icon="i-lucide-save" @click="onSave">Simpan</UButton>
        </div>
      </template>
    </UPageHeader>

    <UCard>
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Sidebar Kiri: Metadata (span 3/4) -->
        <div class="xl:col-span-3 space-y-4">
          <UFormField label="Judul" required>
            <UInput v-model="form.title" placeholder="Judul halaman" />
          </UFormField>

          <UFormField label="Deskripsi (Meta)">
            <UTextarea v-model="form.description" :rows="5" placeholder="Ringkasan singkat untuk SEO" />
          </UFormField>

           <UFormField label="Gambar Utama">
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
                     <UButton label="Hapus" color="error" variant="outline" size="xs" @click.stop="removeFile(); form.image.src = ''; imagePreview = ''" />
                   </div>
                 </template>

                 <template v-else>
                   <UIcon name="i-lucide-image" class="w-10 h-10 text-gray-400" />
                   <p class="text-sm text-gray-500">Klik untuk upload gambar</p>
                   <p class="text-xs text-gray-400">Atau paste URL di bawah</p>
                 </template>
               </div>
             </UFileUpload>
             <!-- Fallback Input URL manual jika needed -->
             <UInput v-model="form.image.src" placeholder="https://..." icon="i-lucide-link" class="mt-2" />
           </UFormField>

          <UFormField label="Badge Label">
            <UInput v-model="form.badge.label" placeholder="Contoh: Baru, Penting" />
          </UFormField>

          <UFormField label="Tanggal">
            <UInput v-model="form.date" type="datetime-local" />
          </UFormField>

          <USeparator class="my-6" />
          
          <div class="text-xs text-muted mt-2">
            <p><strong>Info:</strong> Konten dinamis untuk menu.</p>
          </div>
        </div>

        <!-- Area Utama: Editor (span 8/9) -->
        <div class="xl:col-span-9">
          <UFormField label="Konten Halaman" class="h-full flex flex-col">
            <ClientOnly>
                <TiptapEditor v-model="form.html" class="min-h-[600px]" />
            </ClientOnly>
          </UFormField>
        </div>
      </div>
    </UCard>
  </div>
</template>

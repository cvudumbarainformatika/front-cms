<script setup lang="ts">
/**
 * Admin: Kelola Beranda
 * Mengelola konten Hero, Statistik, Fitur, dan SEO di halaman depan
 */

definePageMeta({
  layout: 'dashboard',
  ssr: false
})

const { isAdmin, authState, userRole } = useAuth()

// Redirect if not admin
onMounted(() => {
  if (!isAdmin.value) {
    navigateTo('/dashboard')
  }
})

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

import type { HomepageData } from '../../../../types/content'

interface BerandaState {
  hero: {
    title: string
    label: string
    description: string
    images: string[]
    event_tag: string
    event_title: string
    event_desc: string
  }
  stats: { label: string; value: string }[]
  seo: {
    title: string
    description: string
  }
}

const state = reactive<BerandaState>({
  hero: {
    title: '',
    label: '',
    description: '',
    images: [],
    event_tag: '',
    event_title: '',
    event_desc: ''
  },
  stats: [],
  seo: {
    title: '',
    description: ''
  }
})

// Fetch data on mounted
onMounted(() => {
  if (!isAdmin.value) {
    navigateTo('/dashboard')
    return
  }
  fetchHome()
})

async function fetchHome() {
  loading.value = true
  try {
    console.log('[Beranda] Fetching homepage data...')
    const res = await $apiFetch<{ success: boolean, data: HomepageData, message: string }>('/homepage')
    console.log('[Beranda] Response:', res)
    
    if (res?.data) {
      const data = res.data
      
      // Update Hero
      // Cast to any to access new fields possibly not in type yet
      const hero = data.hero as any
      state.hero.title = hero?.title || ''
      state.hero.label = hero?.label || ''
      state.hero.description = hero?.description || ''
      state.hero.images = Array.isArray(hero?.images) ? [...hero.images] : []
      state.hero.event_tag = hero?.event_tag || ''
      state.hero.event_title = hero?.event_title || ''
      state.hero.event_desc = hero?.event_desc || ''
      
      // Update Stats
      state.stats = Array.isArray(data.stats) ? data.stats.map(s => ({ ...s })) : []
      
      // Update SEO
      state.seo.title = data.seo?.title || ''
      state.seo.description = data.seo?.description || ''
    }
  } catch (error) {
    console.error('[Beranda] Fetch error:', error)
    toast.add({
      title: 'Gagal Memuat Data',
      description: 'Terjadi kesalahan saat memuat data beranda.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Methods for Hero Images
async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.add({
      title: 'File Terlalu Besar',
      description: 'Maksimal ukuran file adalah 2MB',
      color: 'error'
    })
    return
  }

  const fd = new FormData()
  fd.append('file', file)
  
  uploading.value = true
  try {
    const res: any = await $apiFetch('/upload?type=galeri', {
      method: 'POST',
      body: fd
    })
    
    // Check response format
    const url = res?.data?.url || res?.url
    if (url) {
      state.hero.images.push(url)
      toast.add({ title: 'Upload Berhasil', color: 'success' })
    }
  } catch (error) {
    toast.add({
      title: 'Gagal Upload',
      description: 'Terjadi kesalahan saat mengunggah gambar',
      color: 'error'
    })
  } finally {
    uploading.value = false
    input.value = '' // Reset input
  }
}

function removeHeroImage(index: number) {
  state.hero.images.splice(index, 1)
}

// Methods for Stats
function addStat() {
  state.stats.push({ label: '', value: '' })
}
function removeStat(index: number) {
  state.stats.splice(index, 1)
}

async function onSave() {
  saving.value = true
  try {
    await $apiFetch('/homepage', {
      method: 'POST',
      body: state
    })
    toast.add({
      title: 'Berhasil Disimpan',
      description: 'Konten beranda telah diperbarui.',
      color: 'success'
    })
    await fetchHome()
  } catch (error: any) {
    toast.add({
      title: 'Gagal Menyimpan',
      description: error.data?.message || 'Terjadi kesalahan saat menyimpan data.',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Kelola Beranda</h1>
        <p class="text-muted">Atur konten utama yang tampil di halaman depan website</p>
      </div>
      <UButton
        label="Simpan Perubahan"
        icon="i-lucide-save"
        size="lg"
        :loading="saving"
        @click="onSave"
      />
    </div>

    <ClientOnly>
      <div class="space-y-6">
        <!-- Hero Section (Full Width) -->
        <UCard>
          <template #header>
            <h2 class="font-semibold text-highlighted">Hero Section</h2>
          </template>
          
          <div class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <UFormField label="Label / Badge" help="Teks kecil di atas judul (misal: Leading Respiratory Science)">
                <UInput v-model="state.hero.label" class="w-full" />
              </UFormField>
              <UFormField label="Judul Utama (Title)">
                <UInput v-model="state.hero.title" class="w-full" />
              </UFormField>
            </div>
            
            <UFormField label="Deskripsi Hero">
              <UTextarea v-model="state.hero.description" :rows="3" class="w-full" />
            </UFormField>

            <USeparator label="Gambar Hero Slider" class="py-4" />
            
            <div class="space-y-4">
              <!-- Image List -->
              <div v-if="state.hero.images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(img, idx) in state.hero.images" :key="idx" class="relative group aspect-video rounded-lg overflow-hidden border border-default bg-slate-100">
                  <img :src="getImageUrl(img)" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <UButton icon="i-lucide-trash" color="error" variant="solid" size="xs" @click="removeHeroImage(idx)" />
                  </div>
                </div>
              </div>

              <!-- Upload Button -->
              <div class="flex items-center justify-center w-full">
                <label for="hero-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <UIcon v-if="uploading" name="i-lucide-loader-2" class="w-8 h-8 text-primary-500 animate-spin mb-2" />
                    <UIcon v-else name="i-lucide-image-plus" class="w-8 h-8 text-slate-400 mb-2" />
                    <p class="text-sm text-slate-500">{{ uploading ? 'Mengunggah...' : 'Klik untuk upload gambar slider' }}</p>
                    <p class="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                  <input id="hero-upload" type="file" class="hidden" accept="image/*" @change="handleImageUpload" :disabled="uploading" />
                </label>
              </div>
            </div>

            <USeparator label="Info Card Overlay" class="py-4" />
            <div class="grid md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
               <UFormField label="Tag Floating (Isi Text)" help="Contoh: Clinical Excellence">
                  <UInput v-model="state.hero.event_tag" />
               </UFormField>
               <UFormField label="Judul Event Highlight" help="Contoh: Simposium Nasional 2024">
                  <UInput v-model="state.hero.event_title" />
               </UFormField>
               <UFormField label="Deskripsi Event" help="Contoh: Inovasi Penanganan PPOK">
                  <UInput v-model="state.hero.event_desc" />
               </UFormField>
            </div>
          </div>
        </UCard>

        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Stats Section -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="font-semibold text-highlighted">Statistik Beranda</h2>
                <UButton label="Tambah" icon="i-lucide-plus" size="xs" color="neutral" variant="outline" @click="addStat" />
              </div>
            </template>

            <div class="space-y-4">
              <div v-for="(stat, idx) in state.stats" :key="idx" class="flex gap-2 items-end">
                <UFormField label="Label" size="sm" class="flex-1">
                  <UInput v-model="stat.label" />
                </UFormField>
                <UFormField label="Nilai" size="sm" class="flex-1">
                  <UInput v-model="stat.value" />
                </UFormField>
                <UButton icon="i-lucide-trash" color="error" variant="ghost" size="sm" @click="removeStat(idx)" />
              </div>
            </div>
          </UCard>

          <!-- SEO Section -->
          <UCard>
            <template #header>
              <h2 class="font-semibold text-highlighted">SEO & Metadata</h2>
            </template>
            
            <div class="space-y-4">
              <UFormField label="Meta Title" help="Tampil di tab browser">
                <UInput v-model="state.seo.title" class="w-full" />
              </UFormField>
              <UFormField label="Meta Description">
                <UTextarea v-model="state.seo.description" :rows="4" class="w-full" />
              </UFormField>
            </div>
          </UCard>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

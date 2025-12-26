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

import type { HomepageData } from '../../../../types/content'

const { data: home, refresh } = await useFetch<{ success: boolean, data: HomepageData, message: string }>('/api/homepage')

interface BerandaState {
  hero: {
    title: string
    description: string
    images: string[]
  }
  stats: { label: string; value: string }[]
  features: { title: string; description: string; icon: string }[]
  seo: {
    title: string
    description: string
  }
}

const state = reactive<BerandaState>({
  hero: {
    title: '',
    description: '',
    images: []
  },
  stats: [],
  features: [],
  seo: {
    title: '',
    description: ''
  }
})

// Initialize state
watchEffect(() => {
  if (home.value?.data) {
    const data = home.value.data
    state.hero = { 
      title: data.hero.title || '',
      description: data.hero.description || '',
      images: Array.isArray(data.hero.images) ? [...data.hero.images] : []
    }
    state.stats = Array.isArray(data.stats) ? data.stats.map(s => ({ ...s })) : []
    state.features = Array.isArray(data.features) ? data.features.map(f => ({ ...f })) : []
    state.seo = { 
      title: data.seo.title || '',
      description: data.seo.description || ''
    }
  }
})

// Methods for Hero Images
function addHeroImage() {
  state.hero.images.push('')
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

// Methods for Features
function addFeature() {
  state.features.push({ title: '', description: '', icon: 'i-lucide-star' })
}
function removeFeature(index: number) {
  state.features.splice(index, 1)
}

async function onSave() {
  saving.value = true
  try {
    await $fetch('/api/homepage', {
      method: 'POST',
      body: state,
      headers: {
        'Authorization': `Bearer ${authState.value.token}`,
        'x-user-role': userRole.value
      }
    })
    toast.add({
      title: 'Berhasil Disimpan',
      description: 'Konten beranda telah diperbarui.',
      color: 'success'
    })
    await refresh()
  } catch (error) {
    toast.add({
      title: 'Gagal Menyimpan',
      description: 'Terjadi kesalahan saat menyimpan data.',
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
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Left: Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Hero Section -->
          <UCard>
          <template #header>
            <h2 class="font-semibold text-highlighted">Hero Section</h2>
          </template>
          
          <div class="space-y-4">
            <UFormGroup label="Judul Utama (Title)" help="Muncul di bagian paling atas hero">
              <UInput v-model="state.hero.title" />
            </UFormGroup>
            
            <UFormGroup label="Deskripsi Hero">
              <UTextarea v-model="state.hero.description" :rows="3" />
            </UFormGroup>

            <USeparator label="Gambar Hero Slider" class="py-4" />
            
            <div class="space-y-3">
              <div v-for="(img, idx) in state.hero.images" :key="idx" class="flex gap-2">
                <UInput v-model="state.hero.images[idx]" placeholder="URL Gambar..." class="flex-1" />
                <UButton icon="i-lucide-trash" color="error" variant="ghost" @click="removeHeroImage(idx)" />
              </div>
              <UButton label="Tambah Gambar" icon="i-lucide-plus" variant="outline" size="sm" block @click="addHeroImage" />
            </div>
          </div>
        </UCard>

        <!-- Features Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-highlighted">Keunggulan / Fitur</h2>
              <UButton label="Tambah" icon="i-lucide-plus" size="xs" color="neutral" variant="outline" @click="addFeature" />
            </div>
          </template>

          <div class="grid sm:grid-cols-2 gap-4">
            <div v-for="(feature, idx) in state.features" :key="idx" class="p-4 border border-default rounded-lg relative group">
              <UButton 
                icon="i-lucide-x" 
                color="error" 
                variant="ghost" 
                size="xs" 
                class="absolute -top-2 -right-2 hidden group-hover:flex" 
                @click="removeFeature(idx)" 
              />
              <div class="space-y-3">
                <UFormGroup label="Ikon" size="sm">
                  <UInput v-model="feature.icon" placeholder="i-lucide-..." />
                </UFormGroup>
                <UFormGroup label="Judul" size="sm">
                  <UInput v-model="feature.title" />
                </UFormGroup>
                <UFormGroup label="Deskripsi" size="sm">
                  <UTextarea v-model="feature.description" :rows="2" />
                </UFormGroup>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right: Side Content -->
      <div class="space-y-6">
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
              <UFormGroup label="Label" size="sm" class="flex-1">
                <UInput v-model="stat.label" />
              </UFormGroup>
              <UFormGroup label="Nilai" size="sm" class="flex-1">
                <UInput v-model="stat.value" />
              </UFormGroup>
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
            <UFormGroup label="Meta Title" help="Tampil di tab browser">
              <UInput v-model="state.seo.title" />
            </UFormGroup>
            <UFormGroup label="Meta Description">
              <UTextarea v-model="state.seo.description" :rows="4" />
            </UFormGroup>
          </div>
        </UCard>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

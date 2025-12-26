<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TiptapEditor from '~/components/editor/TiptapEditor.vue'
import { definePageMeta, useRoute, useFetch, useToast, navigateTo } from '#imports'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ 
  layout: 'dashboard',
  ssr: false 
})

const route = useRoute()
const toast = useToast()
const { isAdmin, authState, userRole } = useAuth()

onMounted(() => {
  if (!isAdmin.value) navigateTo('/dashboard')
})

const slug = computed(() => {
  const p = route.params.slug
  const s = Array.isArray(p) ? p.join('/') : (p || '')
  return s.replace(/^\/+/, '')
})

const { data: contentRes, pending } = await useFetch<any>(`/api/dynamic-content/${slug.value}`)

// Editor state
const editorMode = ref<'wysiwyg' | 'markdown'>('wysiwyg')
const editorRef = ref<HTMLElement | null>(null)

const form = ref({
  title: '',
  description: '',
  body: '# Tulis konten di sini\n',
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
  form.value.html = d.html || ''
  form.value.date = d.date || new Date().toISOString()
  form.value.image = d.image || { src: '' }
  form.value.authors = d.authors || []
  form.value.badge = d.badge || { label: '' }
}

const saving = ref(false)
async function onSave() {
  if (!form.value.title || (!form.value.body && !form.value.html)) {
    toast.add({ title: 'Validasi', description: 'Judul dan konten wajib diisi', color: 'warning' })
    return
  }
  saving.value = true
  try {
    await $fetch('/api/dynamic-content', {
      method: 'POST',
      body: {
        slug: slug.value,
        ...form.value
      },
      headers: {
        Authorization: `Bearer ${authState.value.token}`,
        'x-user-role': userRole.value
      }
    })
    toast.add({ title: 'Tersimpan', description: 'Konten berhasil disimpan', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Gagal', description: e?.statusMessage || 'Gagal menyimpan konten', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Editor Konten</h1>
        <p class="text-muted">Slug: /{{ slug }}</p>
      </div>
      <div class="flex gap-2">
        <UButton :to="`/${slug}`" target="_blank" label="Lihat Halaman" variant="outline" icon="i-lucide-external-link" />
        <UButton :loading="saving" label="Simpan" icon="i-lucide-save" @click="onSave" />
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Detail Konten</h2>
          <span v-if="pending" class="text-xs text-muted">Memuat...</span>
        </div>
      </template>

      <ClientOnly>
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div class="xl:col-span-2 space-y-4">
            <UFormGroup label="Judul">
            <UInput v-model="form.title" placeholder="Judul halaman" />
          </UFormGroup>

          <UFormGroup label="Deskripsi">
            <UTextarea v-model="form.description" :rows="3" placeholder="Ringkasan singkat" />
          </UFormGroup>

          <UFormGroup label="Editor">
            <UButtonGroup size="xs" class="mb-2">
              <UButton :variant="editorMode === 'wysiwyg' ? 'solid' : 'outline'" @click="editorMode = 'wysiwyg'" icon="i-lucide-type" label="WYSIWYG" />
              <UButton :variant="editorMode === 'markdown' ? 'solid' : 'outline'" @click="editorMode = 'markdown'" icon="i-lucide-file-code" label="Markdown" />
            </UButtonGroup>
            <div v-if="editorMode === 'wysiwyg'">
              <ClientOnly>
                <TiptapEditor v-model="form.html" />
              </ClientOnly>
            </div>
            <UTextarea v-else v-model="form.body" :rows="16" class="font-mono" placeholder="# Heading
Tulis konten..." />
          </UFormGroup>
          </div>

          <div class="space-y-4">
          <UFormGroup label="Tanggal">
            <UInput v-model="form.date" type="datetime-local" />
          </UFormGroup>

          <UFormGroup label="Gambar (URL)">
            <UInput v-model="form.image.src" placeholder="https://..." />
          </UFormGroup>

          <UFormGroup label="Badge">
            <UInput v-model="form.badge.label" placeholder="Label badge (opsional)" />
          </UFormGroup>

          <UAlert color="neutral" variant="subtle" title="Penulis" description="Tambahkan penulis pada versi berikut. Saat ini opsional." />
          </div>
        </div>
      </ClientOnly>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import TiptapEditor from '~/components/editor/TiptapEditor.vue'
import { useDebounceFn } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const id = route.params.id as string

const { data: res, refresh } = await useFetch(`/api/berita`)
const current = computed(() => (res.value?.data?.items || []).find((x:any)=>x.id===id))

const form = reactive({
  title: '', slug: '', excerpt: '', content: '', image: '', category: '', tags: [] as string[], status: 'draft' as 'draft'|'published', publishedAt: ''
})

const activeTab = ref<'konten'|'preview'>('konten')

watchEffect(() => {
  if (current.value) {
    form.title = current.value.title
    form.slug = current.value.slug
    form.excerpt = current.value.excerpt
    form.content = current.value.content
    form.image = current.value.image
    form.category = current.value.category
    form.tags = current.value.tags || []
    form.status = (current.value.status || 'draft')
    form.publishedAt = current.value.publishedAt || ''
  }
})

function slugify (text: string) {
  return (text || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
function genSlug() { form.slug = slugify(form.slug || form.title) }

const autoSlug = ref('')
watch(() => form.title, (t) => {
  const s = slugify(t)
  if (!form.slug || form.slug === autoSlug.value) form.slug = s
  autoSlug.value = s
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
    await $fetch(`/api/berita/${id}`, { method: 'PUT', body: form })
    toast.add({ title: 'Tersimpan', color: 'success' })
    refresh()
  } catch (e: any) {
    toast.add({ title: 'Gagal', description: e?.statusMessage || 'Gagal menyimpan', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function toggleStatus() {
  const next = form.status === 'published' ? 'draft' : 'published'
  await $fetch(`/api/berita/${id}`, { method: 'PATCH', body: { status: next } })
  toast.add({ title: next==='published'?'Dipublish':'Kembali draft', color: 'success' })
  refresh()
}

// Autosave (debounce)
const doAutosave = useDebounceFn(async () => {
  if (!form.title || !form.content) return
  try {
    await $fetch(`/api/berita/${id}`, { method: 'PUT', body: form })
  } catch (e) { /* ignore autosave error */ }
}, 1200)

watch(form, () => doAutosave(), { deep: true })

function onFileUpload (files: File[]|FileList) {
  const file = Array.isArray(files) ? files[0] : files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  $fetch('/api/upload', { method: 'POST', body: fd })
    .then((res: any) => { if (res?.url) form.image = res.url })
    .catch(() => {})
}

const previewHtml = computed(() => (form.content || '').toString())

// Preset kategori & validasi ringan
const categoryOptions = [
  { label: 'Umum', value: 'umum' },
  { label: 'Ilmiah', value: 'ilmiah' },
  { label: 'Kegiatan', value: 'kegiatan' },
  { label: 'Pengumuman', value: 'pengumuman' },
  { label: 'Prestasi', value: 'prestasi' }
]

const errors = reactive<{ title?: string; slug?: string; category?: string; tags?: string; content?: string }>({})
watch(() => form.slug, v => { errors.slug = v ? '' : 'Slug wajib' })
watch(() => form.title, v => { errors.title = v ? '' : 'Judul wajib' })
watch(() => form.category, v => { errors.category = v ? '' : 'Kategori wajib' })
watch(() => form.tags, v => { errors.tags = (v && v.length) ? '' : 'Tags wajib diisi' }, { deep: true })
watch(() => form.content, v => { errors.content = v ? '' : 'Konten wajib' })

const tagInput = ref('')
function addTag () {
  const val = tagInput.value.trim()
  if (!val) return
  if (!form.tags.includes(val)) form.tags = [...form.tags, val]
  tagInput.value = ''
  errors.tags = form.tags.length ? '' : 'Tags wajib diisi'
}
</script>

<template>
  <div class="space-y-6">
    <UPageHeader :title="`Edit Berita`" :description="`ID: ${id} | /berita/${form.slug}`">
      <template #right>
        <div class="flex gap-2">
          <UButton variant="outline" icon="i-lucide-eye" :disabled="!form.slug" :to="form.slug?`/berita/${form.slug}`:'#'" target="_blank">Preview</UButton>
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
            <UInput v-model="form.title" placeholder="Judul berita" @blur="genSlug" />
          </UFormField>
          <UFormField label="Slug" :error="errors.slug" hint="Akan tergenerate dari judul, bisa disesuaikan">
            <div class="flex gap-2">
              <UInput v-model="form.slug" placeholder="otomatis dari judul" />
              <UButton variant="outline" @click="genSlug" icon="i-lucide-refresh-ccw">Generate</UButton>
            </div>
          </UFormField>
          <UFormField label="Excerpt">
            <UTextarea v-model="form.excerpt" :rows="6" placeholder="Ringkasan singkat yang menarik" />
          </UFormField>
          <UFormField label="Cover Image">
            <UFileUpload
              icon="i-lucide-image"
              label="Drop your image here"
              description="SVG, PNG, JPG or GIF (max. 2MB)"
              class="w-full min-h-48"
              @change="onFileUpload"
            />
            <img v-if="form.image" :src="form.image" alt="cover" class="mt-2 w-full h-28 object-cover rounded" />
          </UFormField>
          <UFormField label="Kategori" :error="errors.category">
            <USelect v-model="form.category" :items="categoryOptions" placeholder="Pilih kategori" />
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
            <UInput v-model="form.publishedAt" type="datetime-local" />
          </UFormField>
        </div>

        <!-- Kanan: WYSIWYG (span 9) -->
        <div class="xl:col-span-9 space-y-4">
          <UTabs v-model="activeTab" :items="[
            { label: 'Konten', value: 'konten' },
            { label: 'Preview', value: 'preview' }
          ]" />

          <div v-if="activeTab==='konten'" class="space-y-4">
            <UFormField label="Konten (WYSIWYG)" :error="errors.content">
              <ClientOnly>
                <TiptapEditor v-model="form.content" />
              </ClientOnly>
            </UFormField>
          </div>
          <div v-else class="prose max-w-none border border-default rounded-lg p-4">
            <div v-html="previewHtml" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

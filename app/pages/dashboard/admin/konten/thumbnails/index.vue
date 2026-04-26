<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

definePageMeta({
  layout: 'dashboard',
  ssr: false
})

const { $apiFetch } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const page = ref(parseInt(route.query.page as string) || 1)
const search = ref(route.query.search as string || '')
const selectedCategory = ref((route.query.category as string)?.toUpperCase() || 'SEMUA KATEGORI')
const categories = ref<string[]>([])

// Fetch categories for filter & suggestion
async function fetchCategories() {
  try {
    const res = await $apiFetch('/thumbnails/categories')
    const rawData = (res as any).data
    categories.value = Array.isArray(rawData) ? rawData : []
  } catch (e) {}
}

// Options for the filter dropdown
const categoryOptions = computed(() => {
  const opts = categories.value.map(c => ({ label: String(c).toUpperCase(), value: c }))
  return [{ label: 'Semua Kategori', value: '' }, ...opts]
})

// Main Data Fetching
const { data, pending, refresh } = useAsyncData(
  'thumbnails-list',
  async () => {
    const categoryQuery = selectedCategory.value === 'SEMUA KATEGORI' ? undefined : selectedCategory.value
    return await $apiFetch('/thumbnails', {
      query: {
        page: page.value,
        limit: 10,
        category: categoryQuery,
        search: search.value || undefined
      }
    })
  },
  { watch: [page, selectedCategory, search] }
)

const items = computed(() => (data.value as any)?.data?.items || [])
const total = computed(() => (data.value as any)?.data?.pagination?.total || 0)
const totalPages = computed(() => (data.value as any)?.data?.pagination?.last_page || 1)

// Sync URL with state
watch(selectedCategory, (val) => {
  page.value = 1
  const queryVal = val === 'SEMUA KATEGORI' ? undefined : val
  router.push({ query: { ...route.query, category: queryVal, page: undefined } })
})

watch(search, (val) => {
  page.value = 1
  router.push({ query: { ...route.query, search: val || undefined, page: undefined } })
})

function onPageChange(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  router.push({ query: { ...route.query, page: p > 1 ? p : undefined } })
}

// Form State
const isOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const form = ref({
  id: null,
  title: '',
  category: '',
  youtube_url: '',
  description: ''
})

// Actions
function openAdd() {
  isEditing.value = false
  form.value = { id: null, title: '', category: '', youtube_url: '', description: '' }
  isOpen.value = true
}

function openEdit(item: any) {
  isEditing.value = true
  form.value = { ...item }
  isOpen.value = true
}

async function save() {
  if (!form.value.title || !form.value.youtube_url || !form.value.category) {
    toast.add({ title: 'Validasi', description: 'Judul, Kategori, dan URL wajib diisi', color: 'warning' })
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await $apiFetch(`/thumbnails/${form.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      toast.add({ title: 'Berhasil', description: 'Thumbnail diperbarui', color: 'success' })
    } else {
      await $apiFetch('/thumbnails', {
        method: 'POST',
        body: form.value
      })
      toast.add({ title: 'Berhasil', description: 'Thumbnail ditambahkan', color: 'success' })
    }
    isOpen.value = false
    refresh()
    fetchCategories()
  } catch (e: any) {
    toast.add({ title: 'Gagal', description: e.data?.message || 'Gagal menyimpan data', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function confirmDelete(id: number) {
  if (!confirm('Apakah Anda yakin ingin menghapus thumbnail ini?')) return
  
  try {
    await $apiFetch(`/thumbnails/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Berhasil', description: 'Thumbnail dihapus', color: 'success' })
    refresh()
    fetchCategories()
  } catch (e) {
    toast.add({ title: 'Gagal', description: 'Gagal menghapus data', color: 'error' })
  }
}

async function deleteCategory(cat: string) {
  if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${cat}"? \nPERINGATAN: SEMUA video dalam kategori ini akan ikut terhapus secara permanen.`)) return
  
  try {
    await $apiFetch(`/thumbnails/category/${cat}`, { method: 'DELETE' })
    toast.add({ title: 'Berhasil', description: `Kategori ${cat} dan semua videonya telah dihapus`, color: 'success' })
    if (form.value.category === cat) form.value.category = ''
    refresh()
    fetchCategories()
  } catch (e) {
    toast.add({ title: 'Gagal', description: 'Gagal menghapus kategori', color: 'error' })
  }
}

// Columns
const columns = [
  { id: 'title', key: 'title', label: 'Judul Video' },
  { id: 'category', key: 'category', label: 'Kategori' },
  { id: 'youtube_url', key: 'youtube_url', label: 'YouTube URL' },
  { id: 'actions', key: 'actions', label: 'Aksi', sortable: false }
]

function getYoutubeID(url: string) {
  if (!url) return ''
  let id = ''
  if (url.includes('v=')) id = url.split('v=')[1].split('&')[0]
  else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0]
  return id
}

// Smart Pagination Logic
const visiblePages = computed(() => {
  const current = page.value
  const last = totalPages.value
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

// Combined categories for realtime feedback
const allCategories = computed(() => {
  const typedCat = form.value.category?.toUpperCase() || ''
  const list = categories.value.map(c => String(c).toUpperCase())
  if (typedCat && !list.includes(typedCat)) {
    list.push(typedCat)
  }
  return [...new Set(list)].sort((a, b) => a.localeCompare(b))
})

// Watcher to force uppercase on input
watch(() => form.value.category, (newVal) => {
  if (newVal && newVal !== newVal.toUpperCase()) {
    form.value.category = newVal.toUpperCase()
  }
})

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="space-y-6">
    <UPageHeader title="Kelola Thumbnails" description="Manajemen daftar video YouTube berdasarkan kategori">
      <template #links>
        <UButton icon="i-lucide-plus" label="Tambah Thumbnail" @click="openAdd" />
      </template>
    </UPageHeader>

    <UCard :ui="{ root: 'overflow-hidden max-w-full', body: 'p-0 sm:p-0 overflow-hidden' }">
      <template #header>
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="font-bold text-highlighted">Daftar Thumbnails</h3>
            <UBadge variant="subtle" size="sm" color="neutral" class="rounded-full">{{ total }} Video</UBadge>
          </div>
          <div class="flex items-center gap-2">
            <UInput
              v-model="search"
              placeholder="Cari video..."
              icon="i-lucide-search"
              class="w-64"
            >
               <template #trailing v-if="search">
                 <UButton
                   color="neutral"
                   variant="link"
                   size="xs"
                   icon="i-lucide-x"
                   :padded="false"
                   @click="search = ''"
                 />
               </template>
            </UInput>

            <USelect
              v-model="selectedCategory"
              :items="['SEMUA KATEGORI', ...categories.map(c => String(c).toUpperCase())]"
              class="w-48"
            />
            <UButton v-if="selectedCategory && selectedCategory !== 'SEMUA KATEGORI'" icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="selectedCategory = 'SEMUA KATEGORI'" />
          </div>
        </div>
      </template>

      <!-- Table Section -->
      <ClientOnly>
        <UTable :data="items" :columns="columns" :loading="pending" class="w-full">
          <!-- Image/Title Slot -->
          <template #title-cell="{ row }">
            <div class="flex items-center gap-4 py-1">
               <div class="w-24 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                 <img v-if="getYoutubeID(row.original.youtube_url)" :src="`https://img.youtube.com/vi/${getYoutubeID(row.original.youtube_url)}/0.jpg`" class="w-full h-full object-cover" />
                 <div v-else class="w-full h-full flex items-center justify-center">
                   <UIcon name="i-lucide-video" class="text-slate-300 w-6 h-6" />
                 </div>
               </div>
               <div>
                 <div class="font-bold text-slate-900 line-clamp-1">{{ row.original.title }}</div>
                 <div class="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter italic">ID: {{ row.original.id }}</div>
               </div>
            </div>
          </template>

          <template #category-cell="{ row }">
            <UBadge color="primary" variant="subtle" class="rounded-full px-3">{{ row.original.category }}</UBadge>
          </template>

          <template #youtube_url-cell="{ row }">
            <a :href="row.original.youtube_url" target="_blank" class="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
              <UIcon name="i-lucide-youtube" class="w-4 h-4 text-red-600" />
              Buka Video
            </a>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-1">
              <UButton icon="i-lucide-edit" size="xs" color="neutral" variant="ghost" class="hover:bg-primary-50 hover:text-primary-600" @click="openEdit(row.original)" />
              <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost" class="hover:bg-red-50" @click="confirmDelete(row.original.id)" />
            </div>
          </template>
        </UTable>

        <div v-if="!items.length && !pending" class="flex flex-col items-center justify-center py-20 gap-3">
          <UIcon name="i-lucide-video-off" class="w-12 h-12 text-slate-200" />
          <p class="text-slate-400 font-medium">Belum ada video di kategori ini</p>
        </div>
      </ClientOnly>

      <!-- Footer Pagination -->
      <template #footer>
         <div class="flex items-center justify-between py-2 px-4">
           <span class="text-xs text-muted font-medium">Menampilkan {{ items.length }} dari {{ total }} data (Hal: {{ page }}/{{ totalPages }})</span>
           
           <div v-if="totalPages > 1" class="flex items-center gap-1">
             <UButton 
               icon="i-lucide-chevrons-left" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               :disabled="page <= 1"
               @click="onPageChange(1)"
             />
             <UButton 
               icon="i-lucide-chevron-left" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               :disabled="page <= 1"
               @click="onPageChange(page - 1)"
             />
             
             <div class="flex items-center gap-1 mx-2">
                <template v-for="(p, i) in visiblePages" :key="i">
                  <span v-if="p === '...'" class="px-2 text-muted">...</span>
                  <UButton v-else :color="page === p ? 'primary' : 'neutral'" :variant="page === p ? 'solid' : 'ghost'" size="xs" class="min-w-[28px] justify-center" @click="onPageChange(p as number)">{{ p }}</UButton>
                </template>
              </div>

             <UButton 
               icon="i-lucide-chevron-right" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               :disabled="page >= totalPages"
               @click="onPageChange(page + 1)"
             />
             <UButton 
               icon="i-lucide-chevrons-right" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               :disabled="page >= totalPages"
               @click="onPageChange(totalPages)"
             />
           </div>
         </div>
      </template>
    </UCard>

    <!-- Form Modal -->
    <UModal v-model:open="isOpen" :title="isEditing ? 'Edit Thumbnail' : 'Tambah Thumbnail Baru'" description="Lengkapi data video di bawah ini">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon :name="isEditing ? 'i-lucide-edit' : 'i-lucide-plus-circle'" class="w-5 h-5 text-primary-600" />
          <span class="font-semibold text-lg">{{ isEditing ? 'Edit Thumbnail' : 'Tambah Thumbnail Baru' }}</span>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <UFormField label="Judul Video" required>
            <UInput v-model="form.title" placeholder="Masukkan judul video..." class="w-full" />
          </UFormField>

          <UFormField label="Kategori" required help="Gunakan kategori yang sama untuk mengelompokkan video">
            <UInput v-model="form.category" placeholder="Ketik kategori baru..." class="w-full" />
            <div v-if="allCategories.length" class="mt-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pilih Kategori yang Sudah Ada:</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cat in allCategories" :key="cat" type="button"
                  :class="['px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-2 group', form.category === cat ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50']"
                  @click="form.category = cat"
                >
                  <UIcon :name="form.category === cat ? 'i-lucide-check-circle-2' : 'i-lucide-circle'" :class="form.category === cat ? 'text-primary-500' : 'text-slate-300'" />
                  <span>{{ cat }}</span>
                  
                  <UIcon 
                    v-if="categories.includes(cat)"
                    name="i-lucide-trash-2" 
                    class="w-3.5 h-3.5 ml-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                    @click.stop="deleteCategory(cat)"
                  />
                </button>
              </div>
            </div>
          </UFormField>

          <UFormField label="YouTube URL" required>
            <UInput v-model="form.youtube_url" icon="i-lucide-youtube" placeholder="https://www.youtube.com/watch?v=..." class="w-full" />
          </UFormField>

          <UFormField label="Deskripsi">
            <UTextarea v-model="form.description" placeholder="Keterangan singkat video (opsional)" class="w-full" />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Batal" @click="isOpen = false" />
          <UButton :loading="saving" icon="i-lucide-save" :label="isEditing ? 'Simpan Perubahan' : 'Simpan Data'" @click="save" />
        </div>
      </template>
    </UModal>
  </div>
</template>

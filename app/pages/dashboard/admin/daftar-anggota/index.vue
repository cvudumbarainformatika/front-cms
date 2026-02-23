<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
// Import TiptapEditor if needed, but this is a list view

const { $apiFetch } = useNuxtApp()
const toast = useToast()
const router = useRouter()

// State
const loading = ref(false)
const members = ref<any[]>([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 0
})

// Search and filters
const search = ref('')
const selectedCabang = ref('')
const selectedProvinsi = ref('')
const selectedStatus = ref('')
const viewMode = ref<'grid' | 'table'>('grid')

// Filter options
const filterOptions = ref({
  cabang: [],
  provinsi: [],
  status: []
})

// Fetch filter options
async function fetchFilterOptions() {
  try {
    const res: any = await $apiFetch('/members/filter-options')
    if (res?.data) {
        filterOptions.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch filter options:', error)
  }
}

// Fetch members
async function fetchMembers() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    if (search.value) params.search = search.value
    if (selectedCabang.value && selectedCabang.value !== 'ALL') params.cabang = selectedCabang.value
    if (selectedProvinsi.value && selectedProvinsi.value !== 'ALL') params.provinsi = selectedProvinsi.value
    if (selectedStatus.value && selectedStatus.value !== 'ALL') params.status = selectedStatus.value

    const res: any = await $apiFetch('/members', { query: params })
    members.value = res.data?.items || []
    pagination.value = res.data?.pagination || pagination.value
  } catch (error: any) {
    toast.add({
      title: 'Gagal memuat data',
      description: error?.data?.message || 'Terjadi kesalahan',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Search handler
function handleSearch() {
  pagination.value.page = 1
  fetchMembers()
}

// Reset filters
function resetFilters() {
  search.value = ''
  selectedCabang.value = ''
  selectedProvinsi.value = ''
  selectedStatus.value = ''
  pagination.value.page = 1
  fetchMembers()
}

// Pagination handler
function changePage(newPage: number) {
  if (newPage < 1 || newPage > pagination.value.total_pages) return
  pagination.value.page = newPage
  fetchMembers()
}

// Table columns
const columns = [
  { accessorKey: 'npa', id: 'npa', header: 'NPA', meta: { class: { th: 'font-bold w-24', td: 'w-24' } } },
  { accessorKey: 'nama', id: 'nama', header: 'Nama', meta: { class: { th: 'font-bold min-w-[200px]', td: 'min-w-[200px]' } } },
  { accessorKey: 'email', id: 'email', header: 'Email', meta: { class: { th: 'font-bold w-48 hidden md:table-cell', td: 'w-48 hidden md:table-cell' } } },
  { accessorKey: 'cabang', id: 'cabang', header: 'Cabang', meta: { class: { th: 'font-bold w-48 hidden sm:table-cell', td: 'w-48 hidden sm:table-cell' } } },
  { accessorKey: 'status', id: 'status', header: 'Status', meta: { class: { th: 'font-bold w-24 hidden lg:table-cell', td: 'w-24 hidden lg:table-cell' } } },
  { accessorKey: 'actions', id: 'actions', header: '', meta: { class: { th: 'font-bold text-right w-16', td: 'text-right w-16' } } }
]

// Initialize
onMounted(() => {
  fetchFilterOptions()
  fetchMembers()
})

const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
        case 'aktif': return 'primary';
        case 'meninggal': return 'error';
        case 'pindah': return 'warning';
        default: return 'neutral';
    }
}

const getItems = (row: any) => [
  [{
    label: 'Detail',
    icon: 'i-lucide-eye',
    click: () => router.push(`/dashboard/admin/daftar-anggota/${row.id}`)
  }]
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Daftar Anggota</h1>
        <p class="text-muted">Data anggota PDPI (sync dari PDPI API)</p>
      </div>
      <div class="flex gap-2">
         <UButton
          icon="i-lucide-refresh-ccw"
          label="Refresh"
          size="lg"
          @click="fetchMembers"
          :loading="loading"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div class="px-4 py-4 sm:px-6 border-b border-gray-100 dark:border-gray-800">
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <UButton
                :variant="selectedStatus === 'ALL' || selectedStatus === '' ? 'solid' : 'soft'"
                :color="selectedStatus === 'ALL' || selectedStatus === '' ? 'primary' : 'neutral'"
                size="sm"
                class="cursor-pointer shrink-0"
                @click="selectedStatus = 'ALL'; handleSearch()"
            >
                Semua
            </UButton>
             <UButton
                v-for="status in filterOptions.status || []" :key="status"
                :variant="selectedStatus === status ? 'solid' : 'soft'"
                :color="selectedStatus === status ? 'primary' : 'neutral'"
                size="sm"
                class="cursor-pointer capitalize shrink-0"
                @click="selectedStatus = status; handleSearch()"
            >
                {{ (status as string)?.toLowerCase() }}
            </UButton>
          </div>

          <div class="flex flex-wrap gap-2 w-full sm:w-auto">
             <USelect
              v-model="selectedCabang"
              :items="[{ label: 'Semua Cabang', value: 'ALL' }, ...(filterOptions.cabang || []).map((c: string) => ({ label: c, value: c }))]"
              placeholder="Cabang"
              size="sm"
              class="w-full sm:w-40"
              @change="handleSearch"
            />
             <UInput
                v-model="search"
                placeholder="Cari..."
                icon="i-lucide-search"
                @change="handleSearch"
                size="sm"
                class="w-full sm:w-64"
             >
                <template #trailing v-if="search">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="xs"
                    icon="i-lucide-x"
                    :padded="false"
                    @click="search = ''; handleSearch()"
                  />
                </template>
             </UInput>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
            <span class="text-xs text-gray-500 font-medium hidden sm:inline-block">Tampilan:</span>
            <div class="bg-gray-100 dark:bg-gray-800 p-1 flex items-center justify-between sm:justify-start w-full sm:w-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                @click="viewMode = 'grid'"
                :class="['flex-1 sm:flex-none flex items-center justify-center p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']"
                title="Tampilan Grid"
              >
                <UIcon name="i-lucide-layout-grid" class="w-4 h-4" />
              </button>
              <button
                @click="viewMode = 'table'"
                :class="['flex-1 sm:flex-none flex items-center justify-center p-1.5 rounded-md transition-colors', viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']"
                title="Tampilan Tabel"
              >
                <UIcon name="i-lucide-list" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="p-4 sm:p-6 w-full bg-white dark:bg-gray-900">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-if="!loading && members.length === 0" class="col-span-full p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <div class="rounded-full bg-gray-50 dark:bg-gray-800/50 p-4 inline-flex mb-4">
              <UIcon name="i-lucide-search-x" class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-muted font-medium">Tidak ada anggota ditemukan</p>
            <p class="text-xs text-muted mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>

          <div
            v-for="member in members"
            :key="member.id"
            class="bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden group hover:shadow-lg hover:ring-primary-500/30 transition-all duration-300 flex flex-col"
          >
            <!-- Member Header: Avatar & Cover -->
            <div class="h-24 bg-linear-to-r from-primary-500/10 to-primary-600/5 dark:from-primary-900/30 dark:to-primary-800/10 relative">
               <div class="absolute -bottom-10 left-4">
                 <UAvatar
                   :src="member.foto_profil"
                   :alt="member.nama"
                   :text="(member.nama || 'NA').substring(0, 2).toUpperCase()"
                   size="3xl"
                   class="ring-4 ring-white dark:ring-gray-900 shadow-sm bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400"
                 />
               </div>
               <div class="absolute top-3 right-3">
                 <UBadge
                   :label="member.status || 'Aktif'"
                   :color="getStatusColor(member.status || 'Aktif')"
                   size="sm"
                   variant="solid"
                   class="shadow-sm font-semibold capitalize"
                 />
               </div>
            </div>

            <!-- Member Info -->
            <div class="px-4 pt-12 pb-4 flex-1 flex flex-col">
               <div class="mb-1">
                 <h3 class="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-1" :title="member.nama">{{ member.nama }}</h3>
                 <p class="text-sm font-medium text-primary-600 dark:text-primary-400 mt-0.5">NPA: {{ member.npa || '-' }}</p>
               </div>
               <div class="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                  {{ member.gelar ? `${member.gelar},` : '' }} {{ member.gelar2 || 'Dokter Spesialis' }}
               </div>

               <div class="mt-auto space-y-2 flex flex-col pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300" :title="member.email">
                    <div class="w-6 py-1 flex justify-center text-gray-400"><UIcon name="i-lucide-mail" class="w-4 h-4" /></div>
                    <span class="truncate">{{ member.email || 'Belum ada email' }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300" :title="member.cabang">
                    <div class="w-6 py-1 flex justify-center text-gray-400"><UIcon name="i-lucide-map-pin" class="w-4 h-4" /></div>
                    <span class="truncate">{{ member.cabang || 'Cabang tidak diketahui' }}</span>
                  </div>
               </div>
            </div>

            <!-- Card Actions -->
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
               <UButton
                 label="Detail Profil"
                 icon="i-lucide-arrow-right"
                 color="neutral"
                 variant="ghost"
                 size="sm"
                 trailing
                 @click="router.push(`/dashboard/admin/daftar-anggota/${member.id}`)"
               />
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else-if="viewMode === 'table'" class="w-full">
        <div class="overflow-x-auto">
          <UTable
            :columns="columns"
            :data="members"
            :loading="loading"
            sticky
            class="min-w-full"
          >
            <template #npa-cell="{ row }">
                <span class="font-mono text-gray-700 dark:text-gray-300" v-if="row.original.npa">{{ row.original.npa }}</span>
                <span class="text-gray-400 italic" v-else>-</span>
            </template>
            <template #nama-cell="{ row }">
                <div class="font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]" v-if="row.original.nama" :title="row.original.nama">{{ row.original.nama }}</div>
                  <span class="text-gray-400 italic" v-else>Nama Kosong</span>
                <div class="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[300px]" v-if="row.original.nama">
                    {{ row.original.gelar ? `${row.original.gelar},` : '' }} {{ row.original.gelar2 || '' }}
                </div>
            </template>
            <template #email-cell="{ row }">
              <span class="text-sm text-gray-600 dark:text-gray-400 truncate block max-w-[150px] sm:max-w-[200px]" :title="row.original.email">{{ row.original.email || '-' }}</span>
            </template>

            <template #cabang-cell="{ row }">
              <span class="text-sm text-gray-600 dark:text-gray-400 truncate block max-w-[150px] sm:max-w-[200px]" :title="row.original.cabang">{{ row.original.cabang || '-' }}</span>
            </template>

            <template #status-cell="{ row }">
              <UBadge
                :label="row.original.status || 'N/A'"
                :color="getStatusColor(row.original.status)"
                size="xs"
                variant="subtle"
                class="capitalize font-semibold"
              />
            </template>

            <template #actions-cell="{ row }">
              <div class="flex justify-end">
                <UDropdownMenu :items="getItems(row.original)">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-more-horizontal"
                    size="xs"
                  />
                </UDropdownMenu>
              </div>
            </template>
          </UTable>

          <div v-if="!loading && members.length === 0" class="p-12 text-center">
            <div class="rounded-full bg-gray-50 p-4 inline-flex mb-4">
              <UIcon name="i-lucide-search-x" class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-muted font-medium">Tidak ada anggota ditemukan</p>
            <p class="text-xs text-muted mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        </div>
      </div>

      <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
         <div class="flex items-center justify-between">
           <span class="text-xs text-muted">Total: {{ pagination.total }} anggota</span>
           <div class="flex items-center gap-2">
              <UButton
                :disabled="pagination.page <= 1"
                icon="i-lucide-chevron-left"
                @click="changePage(pagination.page - 1)"
                variant="ghost"
                size="sm"
                color="neutral"
              />
              <span class="text-sm font-medium">
                {{ pagination.page }} / {{ pagination.total_pages }}
              </span>
              <UButton
                :disabled="pagination.page >= pagination.total_pages"
                icon="i-lucide-chevron-right"
                @click="changePage(pagination.page + 1)"
                variant="ghost"
                size="sm"
                color="neutral"
              />
           </div>
         </div>
      </div>
    </div>
  </div>
</template>

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

    <UCard :ui="{ body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-4 sm:p-6' } }">
      <template #header>
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
                {{ status?.toLowerCase() }}
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
                :ui="{ icon: { trailing: { pointer: '' } } }" 
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
        </div>
      </template>

      <!-- Table -->
      <div class="w-full">
        <div class="overflow-x-auto">
          <UTable
            :columns="columns"
            :data="members"
            :loading="loading"
            sticky
            class="min-w-full"
            :ui="{ th: { base: 'font-bold text-gray-900 dark:text-white' } }"
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
                <UDropdownMenu :items="getItems(row.original)" :ui="{ width: 'w-32' }">
                  <UButton
                    color="gray"
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

      <template #footer>
         <div class="flex items-center justify-between py-2">
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
      </template>
    </UCard>
  </div>
</template>
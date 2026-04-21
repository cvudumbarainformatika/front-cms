<script setup lang="ts">
/**
 * Direktori Anggota Page - Premium Design
 * Full member directory with advanced search, filters, and modern avatars
 */

definePageMeta({
  layout: 'news'
})

const { searchMembers, getBranches, getProvinces, formatMemberName } = useMembers()

// State
const searchQuery = ref('')
const selectedBranch = ref('')
const selectedProvince = ref('')
const currentPage = ref(1)
const perPage = 24

const members = ref<any[]>([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(false)

const branches = ref<string[]>([])
const provinces = ref<string[]>([])

// Load filter options
onMounted(async () => {
  try {
    branches.value = await getBranches()
    provinces.value = await getProvinces()
  } catch (error) {
    console.error('Failed to load filter options:', error)
  }

  // Load initial data
  await loadMembers()
})

// Load members with current filters
const loadMembers = async () => {
  loading.value = true
  try {
    const response = await searchMembers({
      nama: searchQuery.value || undefined,
      cabang: selectedBranch.value || undefined,
      provinsi: selectedProvince.value || undefined,
      page: currentPage.value,
      limit: perPage
    })

    members.value = response.members || []
    total.value = response.pagination.total
    totalPages.value = response.pagination.total_pages
  } catch (error) {
    console.error('Failed to load members:', error)
  } finally {
    loading.value = false
  }
}

// Watch for filter changes
watch([searchQuery, selectedBranch, selectedProvince], () => {
  currentPage.value = 1
  loadMembers()
})

watch(currentPage, () => {
  loadMembers()
  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadMembers()
}, 500)

// Clear all filters
const clearFilters = () => {
  searchQuery.value = ''
  selectedBranch.value = ''
  selectedProvince.value = ''
  currentPage.value = 1
}

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (selectedBranch.value) count++
  if (selectedProvince.value) count++
  return count
})

// Get avatar URL based on gender - using local images
const getAvatarUrl = (member: any) => {
  // Priority 1: Supabase Photo
  if (member.foto && member.foto.trim() !== '') {
    return member.foto
  }

  const gender = member.jenis_kelamin?.toUpperCase()

  if (gender === 'P') {
    // Female doctor avatar
    return '/avatars/doctor-female.png'
  } else {
    // Male doctor avatar
    return '/avatars/doctor-male.png'
  }
}


</script>

<template>
  <div class="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
    <!-- Hero Header -->
    <div class="bg-linear-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
      <UContainer class="py-16">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Direktori Anggota PDPI
          </h1>
          <p class="text-lg md:text-xl text-primary-100">
            Temukan {{ total.toLocaleString() }}+ anggota Perhimpunan Dokter Paru Indonesia
          </p>

          <div class="mt-8">
            <UButton
              to="https://www.direktoripdpi.com/"
              target="_blank"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-lucide-external-link"
            >
              https://www.direktoripdpi.com/
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>

    <UContainer class="py-12">
      <!-- Search & Filters -->
      <div class="mb-8 space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <UIcon
            name="i-lucide-search"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10"
          />
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Cari nama, cabang, provinsi, atau tempat praktek..."
            class="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md"
          />
        </div>

        <!-- Filter Pills -->
        <!-- Filter Pills -->
        <div class="flex flex-col md:flex-row md:items-center gap-3">
          <USelectMenu
            v-model="selectedBranch"
            :items="branches"
            searchable
            searchable-placeholder="Cari cabang..."
            placeholder="Semua Cabang"
            class="w-full md:w-[250px]"
            size="lg"
            variant="outline"
            :ui="{
              base: 'bg-white shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary-500 text-slate-700'
            }"
          >
            <template #leading>
              <UIcon name="i-lucide-building-2" class="w-5 h-5 text-slate-400" />
            </template>
          </USelectMenu>

          <USelectMenu
            v-model="selectedProvince"
            :items="provinces"
            searchable
            searchable-placeholder="Cari provinsi..."
            placeholder="Semua Provinsi"
            class="w-full md:w-[250px]"
            size="lg"
            variant="outline"
            :ui="{
              base: 'bg-white shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary-500 text-slate-700'
            }"
          >
            <template #leading>
              <UIcon name="i-lucide-map" class="w-5 h-5 text-slate-400" />
            </template>
          </USelectMenu>

          <button
            v-if="activeFilterCount > 0"
            @click="clearFilters"
            class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium flex items-center gap-2 border-2 border-slate-200"
          >
            <UIcon name="i-lucide-x" class="w-4 h-4" />
            Clear Filters ({{ activeFilterCount }})
          </button>
        </div>

        <!-- Results Count -->
        <div class="flex items-center justify-between text-sm">
          <p class="text-slate-600">
            Menampilkan
            <span class="font-semibold text-slate-900">{{ members.length }}</span> dari
            <span class="font-semibold text-slate-900">{{ total.toLocaleString() }}</span> anggota
          </p>
          <p v-if="activeFilterCount > 0" class="text-primary-600 font-medium">
            {{ activeFilterCount }} filter aktif
          </p>
        </div>
      </div>

      <!-- Members Area - Wrapped in ClientOnly to prevent SSR/Hydration mismatch -->
      <ClientOnly>
        <template #fallback>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
              v-for="i in 8"
              :key="`skeleton-ssr-${i}`"
              class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse"
            >
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 bg-slate-200 rounded-full shrink-0"></div>
                <div class="flex-1 space-y-3">
                  <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="i in 8"
            :key="`skeleton-client-${i}`"
            class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse"
          >
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-slate-200 rounded-full shrink-0"></div>
              <div class="flex-1 space-y-3">
                <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                <div class="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Members Grid -->
        <div
          v-else-if="members.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12"
        >
          <ScrollReveal
            v-for="(member, idx) in members"
            :key="member.id"
            animation="slide-up"
            :delay="idx % 4 * 100"
          >
            <LandingMemberCard
              :name="formatMemberName(member)"
              :position="`NPA: ${member.npa}`"
              :photo="getAvatarUrl(member)"
              :show-join-date="true"
              :joined-date="member.cabang || member.provinsi"
              icon="i-lucide-award"
            >
              <div class="space-y-2 text-left w-full px-2">
                 <div class="flex flex-col gap-0.5 text-slate-700">
                   <span class="font-extrabold text-primary-600 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                     <UIcon name="i-lucide-hospital" class="w-3 h-3" />
                     Tempat Praktik
                   </span>
                   <p class="text-[11px] font-bold text-slate-600 line-clamp-1 pl-4.5">{{ member.tempat_praktek_1 || 'RS / Praktik Mandiri' }}</p>
                 </div>
                 <div class="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    <div v-if="member.kota_kabupaten" class="flex items-center gap-2 text-slate-500">
                       <UIcon name="i-lucide-map-pin" class="w-3 h-3 text-slate-400" />
                       <span class="text-[10px] font-bold uppercase truncate">{{ member.kota_kabupaten }}</span>
                    </div>
                 </div>
              </div>
            </LandingMemberCard>
          </ScrollReveal>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200"
        >
          <UIcon name="i-lucide-users-x" class="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 class="text-lg font-semibold text-slate-900 mb-2">
            Tidak ada anggota ditemukan
          </h3>
          <p class="text-slate-500 mb-6">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
          <UButton
            @click="clearFilters"
            color="primary"
            variant="soft"
          >
            Reset Semua Filter
          </UButton>
        </div>
      </ClientOnly>

      <!-- Pagination -->
      <div
        v-if="!loading && totalPages > 1"
        class="mt-12 flex items-center justify-center"
      >
        <div class="flex items-center gap-2 bg-white rounded-full shadow-sm border border-slate-200 p-2">
          <!-- Prev Button -->
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
            title="Halaman Sebelumnya"
          >
            <UIcon name="i-lucide-chevron-left" class="w-5 h-5" />
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center gap-1 px-2 border-x border-slate-100">
            <template v-for="page in totalPages" :key="page">
              <!-- Page Button -->
              <button
                v-if="Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages"
                @click="currentPage = page"
                :class="[
                  'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all',
                  currentPage === page
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200 scale-105'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary-600'
                ]"
              >
                {{ page }}
              </button>

              <!-- Ellipsis -->
              <span
                v-else-if="page === currentPage - 3 || page === currentPage + 3"
                class="w-10 h-10 flex items-center justify-center text-slate-300"
              >
                <UIcon name="i-lucide-more-horizontal" class="w-4 h-4" />
              </span>
            </template>
          </div>

          <!-- Next Button -->
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
            title="Halaman Selanjutnya"
          >
            <UIcon name="i-lucide-chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </UContainer>
  </div>
</template>

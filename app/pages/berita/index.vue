<script setup lang="ts">
/**
 * List Berita PDPI
 */

const route = useRoute()
const router = useRouter()

// Get query params
const page = computed(() => parseInt(route.query.page as string) || 1)
const category = computed(() => route.query.category as string || '')
const search = computed(() => route.query.search as string || '')

// Fetch berita
const { data: beritaData } = await useFetch('/api/berita', {
  query: {
    page,
    limit: 9,
    category,
    search
  },
  watch: [page, category, search]
})

// Categories
const categories = [
  { value: '', label: 'Semua' },
  { value: 'umum', label: 'Umum' },
  { value: 'ilmiah', label: 'Ilmiah' },
  { value: 'kegiatan', label: 'Kegiatan' },
  { value: 'pengumuman', label: 'Pengumuman' },
  { value: 'prestasi', label: 'Prestasi' }
]

// Filter functions
const setCategory = (cat: string) => {
  router.push({
    query: {
      ...route.query,
      category: cat || undefined,
      page: undefined // Reset page
    }
  })
}

const setSearch = (query: string) => {
  router.push({
    query: {
      ...route.query,
      search: query || undefined,
      page: undefined
    }
  })
}

// SEO
useSeoMeta({
  title: 'Berita - PDPI',
  description: 'Berita dan update terkini dari Perhimpunan Dokter Paru Indonesia seputar dunia respirologi',
  ogTitle: 'Berita - PDPI'
})
</script>

<template>
  <div>
    <UPageHero
      title="Berita"
      description="Update terbaru dari dunia respirologi Indonesia"
    />

    <UPageSection>
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-8">
       <div class="flex-1">
          <UInput
            :model-value="search"
            placeholder="Cari berita..."
            icon="i-lucide-search"
            size="lg"
            @update:model-value="setSearch"
          />
        </div>
        <UButtonGroup orientation="horizontal" size="lg">
          <UButton
            v-for="cat in categories"
            :key="cat.value"
            :variant="category === cat.value ? 'solid' : 'outline'"
            :color="category === cat.value ? 'primary' : 'neutral'"
            @click="setCategory(cat.value)"
          >
            {{ cat.label }}
          </UButton>
        </UButtonGroup>
      </div>

      <!-- Berita Grid -->
      <div
        v-if="beritaData?.data?.items.length"
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        <UPageCard
          v-for="berita in beritaData.data.items"
          :key="berita.id"
          :title="berita.title"
          :description="berita.excerpt"
          :to="`/berita/${berita.slug}`"
          spotlight
          :ui="{
            body: '!p-0',
            footer: 'px-6 py-4'
          }"
        >
          <template #header>
            <img
              :src="berita.image"
              :alt="berita.title"
              class="w-full h-48 object-cover"
            >
          </template>
          <template #footer>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <UBadge
                  :label="berita.category"
                  variant="subtle"
                  size="sm"
                />
                <span class="text-muted">
                  {{ new Date(berita.publishedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-muted">
                <UIcon name="i-lucide-user" class="w-3.5 h-3.5" />
                <span>{{ berita.author }}</span>
                <span class="mx-1">•</span>
                <UIcon name="i-lucide-eye" class="w-3.5 h-3.5" />
                <span>{{ berita.views }} views</span>
              </div>
            </div>
          </template>
        </UPageCard>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12"
      >
        <UIcon
          name="i-lucide-newspaper"
          class="w-16 h-16 mx-auto text-muted mb-4"
        />
        <p class="text-lg text-muted">
          Tidak ada berita ditemukan
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="beritaData?.data?.pagination && beritaData.data.pagination.totalPages > 1"
        class="flex justify-center"
      >
        <UPagination
          :model-value="page"
          :total="beritaData.data.pagination.total"
          :page-count="beritaData.data.pagination.limit"
          show-first
          show-last
          @update:model-value="(newPage: number) => router.push({ query: { ...route.query, page: newPage } })"
        />
      </div>
    </UPageSection>
  </div>
</template>

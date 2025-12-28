<script setup lang="ts">
definePageMeta({
  layout: 'news'
})
/**
 * List Berita PDPI
 */

const route = useRoute()
const router = useRouter()

// Get query params
const page = computed(() => parseInt(route.query.page as string) || 1)
const category = computed(() => route.query.category as string || '')
const author = computed(() => route.query.author as string || '')
const search = computed(() => route.query.search as string || '')

// Fetch berita
const { data: beritaData, pending } = await useFetch('/api/berita', {
  query: {
    page,
    limit: 9,
    category,
    author,
    search
  },
  watch: [page, category, author, search]
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

// Navigation items ala Docs (Kategori + Arsip)
const navItems = computed(() => {
  const buildToString = (q: Record<string, any>) => {
    const params = new URLSearchParams()
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })
    const qs = params.toString()
    return qs ? `${route.path}?${qs}` : route.path
  }

  const catChildren = categories.map(cat => {
    const q = { ...route.query, category: cat.value || undefined, page: undefined, month: undefined }
    return {
      title: cat.label,
      to: buildToString(q)
    }
  })

  // Generate archives (YYYY-MM) dari data yang tersedia
  const items = beritaData.value?.data?.items || []
  const archivesMap = new Map<string, { title: string, to: string }>()
  for (const it of items) {
    const d = new Date(it.publishedAt)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!archivesMap.has(ym)) {
      const title = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
      const q = { ...route.query, month: ym, page: undefined, category: route.query.category || undefined }
      archivesMap.set(ym, {
        title,
        to: buildToString(q)
      })
    }
  }
  const archiveChildren = Array.from(archivesMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([_, v]) => v)

  return [
    { title: 'Kategori', children: catChildren },
    { title: 'Arsip', children: archiveChildren }
  ]
})

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
// Avatar URL generator berbasis nama (DiceBear Initials)
const avatarUrl = (name: string) => `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`

// Formatter tanggal stabil untuk SSR (hindari mismatch timezone)
const formatDate = (dateStr: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', ...options }).format(new Date(dateStr))
const formatDateShort = (dateStr: string) => formatDate(dateStr, { day: 'numeric', month: 'short', year: 'numeric' })
const formatDayMonth = (dateStr: string) => formatDate(dateStr, { day: 'numeric', month: 'short' })
</script>

<template>
  <UPage>
    <UPageHeader
      title="Berita"
      description="Update terbaru dari dunia respirologi Indonesia"
    />

    <UPageBody>
      <!-- Featured Post -->
      <ClientOnly>
        <div v-if="pending">
          <UCard class="overflow-hidden mb-8">
            <div class="grid lg:grid-cols-2 gap-6 items-stretch">
              <USkeleton class="w-full h-64 lg:h-full" />
              <div class="p-2 space-y-3">
                <USkeleton class="h-4 w-24" />
                <USkeleton class="h-8 w-3/4" />
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-5/6" />
                <div class="flex items-center gap-3">
                  <USkeleton class="h-6 w-6 rounded-full" />
                  <USkeleton class="h-4 w-32" />
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </ClientOnly>

      <UBlogPost
        v-if="!pending && beritaData?.data?.items.length"
        :to="`/berita/${beritaData.data.items[0].slug}`"
        :title="beritaData.data.items[0].title"
        :description="beritaData.data.items[0].excerpt"
        :image="beritaData.data.items[0].image"
        :date="new Date(beritaData.data.items[0].publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })"
        :authors="[{ name: beritaData.data.items[0].author, avatar: { src: avatarUrl(beritaData.data.items[0].author) } }]"
        :badge="{ label: beritaData.data.items[0].category }"
        orientation="horizontal"
        variant="naked"
        :ui="{ description: 'line-clamp-3' }"
        class="mb-8"
      />
      <!-- Berita Grid -->
      <div v-if="beritaData?.data?.items.length">
        <UBlogPosts class="grid md:grid-cols-2 xl:grid-cols-2 gap-8">
          <UBlogPost
            v-for="berita in beritaData.data.items.slice(1)"
            :key="berita.id"
            :to="`/berita/${berita.slug}`"
            :title="berita.title"
            :description="berita.excerpt"
            :image="berita.image"
            :date="new Date(berita.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })"
            :authors="[{ name: berita.author, avatar: { src: avatarUrl(berita.author) } }]"
            :badge="{ label: berita.category }"
            variant="naked"
            orientation="vertical"
            :ui="{ image: 'h-56 object-cover', description: 'line-clamp-2' }"
          />
        </UBlogPosts>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
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
        class="flex justify-center mt-8"
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
    </UPageBody>

    <template #left>
      <UPageAside>
        <template #top>
          <UInput
            :model-value="search"
            placeholder="Cari konten berita..."
            icon="i-lucide-search"
            size="lg"
            @update:model-value="setSearch"
          />
        </template>

        <div class="sticky top-20 space-y-6">
          <UContentNavigation
            :navigation="[navItems[0]]"
            highlight
            :ui="{
              link: 'text-sm',
              linkActive: 'text-primary-600 font-semibold before:content-[\'•\'] before:mr-2 before:text-primary-500 before:text-xs'
            }"
          />
          <UContentNavigation
            :navigation="[navItems[1]]"
            highlight
            :ui="{
              link: 'text-sm',
              linkActive: 'text-primary-500 font-medium before:content-[\'•\'] before:mr-2 before:text-primary-400 before:text-[10px]'
            }"
          />
        </div>
      </UPageAside>
    </template>

    <template #right>
      <UPageAside>
        <div class="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
          <h3 class="text-sm font-medium text-muted">Berita Terbaru</h3>
          <ClientOnly>
            <div class="space-y-3">
              <div
                v-for="berita in (beritaData?.data?.items || []).slice(0, 5)"
                :key="`latest-${berita.id}`"
                class="flex items-start gap-3"
              >
                <img :src="berita.image" :alt="berita.title" class="w-14 h-14 rounded object-cover" />
                <div class="min-w-0">
                  <NuxtLink :to="`/berita/${berita.slug}`" class="line-clamp-2 font-medium hover:underline">
                    {{ berita.title }}
                  </NuxtLink>
                  <p class="text-xs text-muted">{{ formatDayMonth(berita.publishedAt) }}</p>
                </div>
              </div>
            </div>
          </ClientOnly>
        </div>
      </UPageAside>
    </template>
  </UPage>
</template>

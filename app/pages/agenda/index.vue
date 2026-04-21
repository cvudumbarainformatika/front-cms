<script setup lang="ts">
/**
 * List Agenda Kegiatan PDPI
 */

definePageMeta({
  layout: 'news'
})

const route = useRoute()
const router = useRouter()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

// Client-side hydration safety
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

// Get query params
const page = computed(() => parseInt(route.query.page as string) || 1)
const type = computed(() => route.query.type as string || '')
const upcoming = computed(() => route.query.upcoming === 'true')
const order = computed(() => route.query.order as string || '')

// Fetch agenda — gunakan useLazyAsyncData untuk menghindari Suspense error saat reload
const { data: agendaData, pending } = useLazyAsyncData(
  'agenda-public-list',
  () => $apiFetch('/agenda', {
    query: {
      page: page.value,
      limit: 12,
      type: type.value || undefined,
      upcoming: upcoming.value.toString(),
      order: order.value || undefined,
      status: 'published'
    }
  }),
  {
    watch: [page, type, upcoming, order],
    server: false
  }
)

// Types
const types = [
  { value: '', label: 'Semua', icon: 'i-lucide-calendar' },
  { value: 'webinar', label: 'Webinar', icon: 'i-lucide-video' },
  { value: 'workshop', label: 'Workshop', icon: 'i-lucide-wrench' },
  { value: 'seminar', label: 'Seminar', icon: 'i-lucide-presentation' },
  { value: 'kongres', label: 'Kongres', icon: 'i-lucide-users' },
  { value: 'pelatihan', label: 'Pelatihan', icon: 'i-lucide-graduation-cap' }
]

const setType = (t: string) => {
  router.push({
    query: { ...route.query, type: t || undefined, page: undefined }
  })
}

const toggleUpcoming = () => {
  router.push({
    query: { ...route.query, upcoming: upcoming.value ? 'false' : 'true', page: undefined }
  })
}

const toggleOrder = () => {
  const newOrder = order.value === 'ASC' ? 'DESC' : 'ASC'
  router.push({
    query: { ...route.query, order: newOrder, page: undefined }
  })
}

// Date helpers — safe parsing
const getDay = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('id-ID', { day: 'numeric', timeZone: 'UTC' })
}
const getMonth = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('id-ID', { month: 'short', timeZone: 'UTC' })
}
const getYear = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return isNaN(d.getTime()) ? '' : d.getUTCFullYear()
}
const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// Helper to strip HTML
const stripHtml = (html: string) => (html || '').replace(/<[^>]*>/g, '')

// SEO
useSeoMeta({
  title: 'Agenda Kegiatan - PDPI',
  description: 'Agenda webinar, workshop, seminar, dan kongres PDPI. Tingkatkan kompetensi dan dapatkan SKP.',
  ogTitle: 'Agenda Kegiatan - PDPI'
})
</script>

<template>
  <UPage>
    <UPageHeader
      title="Agenda Kegiatan"
      description="Webinar, workshop, seminar, dan kongres untuk pengembangan kompetensi"
    />

    <UPageBody>
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <UButton
          :variant="upcoming ? 'solid' : 'outline'"
          :color="upcoming ? 'primary' : 'neutral'"
          icon="i-lucide-clock"
          size="lg"
          @click="toggleUpcoming"
        >
          {{ upcoming ? 'Acara Mendatang' : 'Semua Acara' }}
        </UButton>
        <UButton
          variant="outline"
          color="neutral"
          :icon="order === 'ASC' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-narrow-wide'"
          size="lg"
          @click="toggleOrder"
        >
          {{ order === 'ASC' ? 'Terlama' : 'Terbaru' }}
        </UButton>
        <div class="flex-1" />
        <div role="group" class="flex flex-wrap gap-2">
          <UButton
            v-for="t in types"
            :key="t.value"
            :variant="type === t.value ? 'solid' : 'outline'"
            :color="type === t.value ? 'primary' : 'neutral'"
            :icon="t.icon"
            size="md"
            @click="setType(t.value)"
          >
            {{ t.label }}
          </UButton>
        </div>
      </div>

      <!-- Agenda Grid -->
      <template v-if="isMounted">
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="`skeleton-${i}`">
            <USkeleton class="h-48 w-full rounded-lg mb-4" />
            <USkeleton class="h-4 w-3/4 rounded mb-2" />
            <USkeleton class="h-3 w-full rounded mb-1" />
          </div>
        </div>
        <div v-else-if="agendaData?.data?.items?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UBlogPost
            v-for="agenda in agendaData.data.items"
            :key="agenda.id"
            :to="`/agenda/${agenda.slug}`"
            :title="agenda.title"
            :description="stripHtml(agenda.description)"
            :date="formatDate(agenda.date)"
            :authors="[{ name: agenda.is_online ? 'Online' : 'Luring', avatar: { src: 'https://api.dicebear.com/8.x/initials/svg?seed=AG&backgroundType=gradientLinear' } }]"
            :badge="{ label: `${agenda.skp} SKP` }"
            variant="outline"
            orientation="vertical"
            :ui="{
              description: 'line-clamp-2',
              header: 'mb-6'
            }"
          >
            <template #header>
              <!-- Wrapper tunggal untuk kestabilan hidrasi -->
              <div class="relative w-full h-48 overflow-hidden rounded-lg shadow-sm group bg-neutral-100 dark:bg-neutral-800">
                <!-- Tidak ada gambar: tampilkan Date Card -->
                <div
                  v-if="!agenda.image_url"
                  class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-700"
                >
                  <div class="text-center transform transition-transform duration-300 group-hover:scale-110">
                    <span class="block text-6xl font-black text-primary-600 dark:text-primary-400 leading-none tabular-nums tracking-tighter">
                      {{ getDay(agenda.date) }}
                    </span>
                    <span class="block mt-1 text-sm font-bold uppercase tracking-[0.2em] text-primary-700/70 dark:text-primary-400/70">
                      {{ getMonth(agenda.date) }}
                    </span>
                    <span class="block mt-0.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                      {{ getYear(agenda.date) }}
                    </span>
                  </div>
                </div>
                <!-- Ada gambar: tampilkan gambar -->
                <NuxtImg
                  v-else
                  :src="getImageUrl(agenda.image_url, 'banner')"
                  :alt="agenda.title"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  format="webp"
                />
              </div>
            </template>
          </UBlogPost>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
          <UIcon name="i-lucide-calendar-x" class="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
          <p class="text-lg font-medium text-neutral-500">Tidak ada agenda ditemukan</p>
          <UButton variant="link" color="primary" class="mt-2" @click="setType('')">Reset Filter</UButton>
        </div>

        <!-- Pagination -->
        <div
          v-if="agendaData?.data?.pagination && agendaData.data.pagination.total_pages > 1"
          class="flex justify-center mt-8"
        >
          <UPagination
            :model-value="page"
            :total="agendaData.data.pagination.total"
            :page-count="agendaData.data.pagination.limit"
            show-first
            show-last
            @update:model-value="(newPage: number) => router.push({ query: { ...route.query, page: newPage } })"
          />
        </div>
      </template>

      <!-- SSR Skeleton matching -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="`skeleton-${i}`">
          <USkeleton class="h-48 w-full rounded-lg mb-4" />
          <USkeleton class="h-4 w-3/4 rounded mb-2" />
          <USkeleton class="h-3 w-full rounded mb-1" />
        </div>
      </div>
    </UPageBody>

    <template #right>
      <UPageAside>
        <div class="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
          <h3 class="text-sm font-medium text-muted">Agenda Terbaru</h3>
          <template v-if="isMounted">
            <div class="space-y-3">
              <div
                v-for="ag in (agendaData?.data?.items || []).slice(0, 6)"
                :key="`ag-${ag.id}`"
                class="flex items-start gap-3"
              >
                <!-- Thumbnail sidebar: Date Card atau gambar -->
                <div class="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                  <div
                    v-if="!ag.image_url"
                    class="absolute inset-0 flex flex-col items-center justify-center text-center"
                  >
                    <span class="text-xl font-black text-primary-600 dark:text-primary-400 leading-none tabular-nums">{{ getDay(ag.date) }}</span>
                    <span class="text-[9px] uppercase font-bold text-neutral-500 tracking-wide mt-0.5">{{ getMonth(ag.date) }}</span>
                  </div>
                  <NuxtImg
                    v-else
                    :src="getImageUrl(ag.image_url, 'thumbnail')"
                    :alt="ag.title"
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    format="webp"
                  />
                </div>
                <div class="min-w-0">
                  <NuxtLink :to="`/agenda/${ag.slug}`" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                    {{ ag.title }}
                  </NuxtLink>
                  <p class="text-xs text-muted mt-0.5">{{ getDay(ag.date) }} {{ getMonth(ag.date) }} {{ getYear(ag.date) }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </UPageAside>
    </template>
  </UPage>
</template>

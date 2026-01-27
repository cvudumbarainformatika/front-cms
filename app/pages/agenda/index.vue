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

// Get query params
const page = computed(() => parseInt(route.query.page as string) || 1)
const type = computed(() => route.query.type as string || '')
const upcoming = computed(() => route.query.upcoming === 'true') // Default false to show all events

// Fetch agenda
const { data: agendaData, pending } = await useAsyncData(
  'agenda-public-list',
  () => $apiFetch('/agenda', {
    query: {
      page: page.value,
      limit: 12,
      type: type.value || undefined,
      upcoming: upcoming.value.toString(),
      status: 'published'
    }
  }),
  {
    watch: [page, type, upcoming],
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
    query: {
      ...route.query,
      type: t || undefined,
      page: undefined
    }
  })
}

const toggleUpcoming = () => {
  router.push({
    query: {
      ...route.query,
      upcoming: upcoming.value ? 'false' : 'true',
      page: undefined
    }
  })
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
      <ClientOnly>
        <div v-if="pending" class="grid grid-cols-1 gap-8">
           <div v-for="i in 3" :key="i" class="flex gap-4">
             <USkeleton class="h-48 w-full rounded" />
           </div>
        </div>
        <div v-else-if="agendaData?.data?.items.length" >
          <UBlogPosts class="contents">
            <UBlogPost
              v-for="agenda in agendaData.data.items"
              :key="agenda.id"
              :to="`/agenda/${agenda.slug}`"
              :title="agenda.title"
              :description="stripHtml(agenda.description)"
              :image="getImageUrl(agenda.image_url, 'banner')"
              :date="new Date(agenda.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })"
              :authors="[{ name: agenda.is_online ? 'Online' : 'Luring', avatar: { src: getImageUrl(agenda.image_url, 'avatar') || 'https://api.dicebear.com/8.x/initials/svg?seed=AG&backgroundType=gradientLinear' } }]"
              :badge="{ label: `${agenda.skp} SKP` }"
              variant="outline"
              orientation="vertical"
              :ui="{ 
                description: 'line-clamp-2',
                header: 'mb-6'
              }"
            >
              <template #header>
                <img 
                  :src="getImageUrl(agenda.image_url, 'banner')" 
                  :alt="agenda.title"
                  class="w-full h-48 object-cover rounded-lg block shadow-sm border border-gray-100"
                />
              </template>
            </UBlogPost>
          </UBlogPosts>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12"
        >
          <UIcon
            name="i-lucide-calendar-x"
            class="w-16 h-16 mx-auto text-muted mb-4"
          />
          <p class="text-lg text-muted">
            Tidak ada agenda ditemukan
          </p>
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
      </ClientOnly>
    </UPageBody>

    <template #right>
      <UPageAside>
        <div class="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
          <h3 class="text-sm font-medium text-muted">Agenda Terbaru</h3>
          <ClientOnly>
            <div class="space-y-3">
              <div
                v-for="ag in (agendaData?.data?.items || []).slice(0, 6)"
                :key="`ag-${ag.id}`"
                class="flex items-start gap-3"
              >
                <img :src="getImageUrl(ag.image_url, 'thumbnail')" :alt="ag.title" class="w-14 h-14 rounded object-cover" />
                <div class="min-w-0">
                  <NuxtLink :to="`/agenda/${ag.slug}`" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                    {{ ag.title }}
                  </NuxtLink>
                  <p class="text-xs text-muted">{{ new Date(ag.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
                </div>
              </div>
            </div>
          </ClientOnly>
        </div>
      </UPageAside>
    </template>
  </UPage>
</template>

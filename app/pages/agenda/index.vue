<script setup lang="ts">
/**
 * List Agenda Kegiatan PDPI
 */

definePageMeta({
  layout: 'news'
})

const route = useRoute()
const router = useRouter()

// Get query params
const page = computed(() => parseInt(route.query.page as string) || 1)
const type = computed(() => route.query.type as string || '')
const upcoming = computed(() => route.query.upcoming !== 'false')

// Fetch agenda
const { data: agendaData } = await useFetch('/api/agenda', {
  query: {
    page,
    limit: 12,
    type,
    upcoming: upcoming.value.toString()
  },
  watch: [page, type, upcoming]
})

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
      <div v-if="agendaData?.data?.items.length" >
        <UBlogPosts class="contents">
          <UBlogPost
            v-for="agenda in agendaData.data.items"
            :key="agenda.id"
            :to="`/agenda/${agenda.slug}`"
            :title="agenda.title"
            :description="agenda.description"
            :image="agenda.image"
            :date="new Date(agenda.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })"
            :authors="[{ name: agenda.isOnline ? 'Online' : 'Luring', avatar: { src: agenda.image || 'https://api.dicebear.com/8.x/initials/svg?seed=AG&backgroundType=gradientLinear' } }]"
            :badge="{ label: `${agenda.skp} SKP` }"
            variant="naked"
            orientation="vertical"
            :ui="{ image: 'h-48 object-cover', description: 'line-clamp-2' }"
          />
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
        v-if="agendaData?.data?.pagination && agendaData.data.pagination.totalPages > 1"
        class="flex justify-center"
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
    </UPageBody>

    <template #right>
      <UPageAside>
        <div class="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
          <h3 class="text-sm font-medium text-muted">Agenda Terbaru</h3>
          <div class="space-y-3">
            <div
              v-for="ag in (agendaData?.data?.items || []).slice(0, 6)"
              :key="`ag-${ag.id}`"
              class="flex items-start gap-3"
            >
              <img :src="ag.image" :alt="ag.title" class="w-14 h-14 rounded object-cover" />
              <div class="min-w-0">
                <NuxtLink :to="ag.registrationUrl || '#'" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                  {{ ag.title }}
                </NuxtLink>
                <p class="text-xs text-muted">{{ new Date(ag.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
              </div>
            </div>
          </div>
        </div>
      </UPageAside>
    </template>
  </UPage>
</template>

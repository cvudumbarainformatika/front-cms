<script setup lang="ts">
/**
 * List Agenda Kegiatan PDPI
 */

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
  <div>
    <UPageHero
      title="Agenda Kegiatan"
      description="Webinar, workshop, seminar, dan kongres untuk pengembangan kompetensi"
    />

    <UPageSection>
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
        <UButtonGroup orientation="horizontal" size="md">
          <UButton
            v-for="t in types"
            :key="t.value"
            :variant="type === t.value ? 'solid' : 'outline'"
            :color="type === t.value ? 'primary' : 'neutral'"
            :icon="t.icon"
            @click="setType(t.value)"
          >
            {{ t.label }}
          </UButton>
        </UButtonGroup>
      </div>

      <!-- Agenda Grid -->
      <div
        v-if="agendaData?.data?.items.length"
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        <UPageCard
          v-for="agenda in agendaData.data.items"
          :key="agenda.id"
          :title="agenda.title"
          :description="agenda.description"
          spotlight
        >
          <template v-if="agenda.image" #header>
            <img
              :src="agenda.image"
              :alt="agenda.title"
              class="w-full h-40 object-cover"
            >
          </template>
          <template #footer>
            <div class="space-y-3">
              <div class="flex  items-center gap-2 text-sm">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 text-primary" />
                <span class="font-medium">
                  {{ new Date(agenda.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted">
                <UIcon
                  :name="agenda.isOnline ? 'i-lucide-video' : 'i-lucide-map-pin'"
                  class="w-4 h-4"
                />
                <span>{{ agenda.location }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted">
                <UIcon name="i-lucide-wallet" class="w-4 h-4" />
                <span>{{ agenda.fee }}</span>
              </div>
              <div class="flex items-center justify-between pt-3 border-t border-default">
                <UBadge :label="`${agenda.skp} SKP`" color="primary" />
                <div class="flex items-center gap-1 text-xs text-muted">
                  <UIcon name="i-lucide-users" class="w-3.5 h-3.5" />
                  <span>{{ agenda.registered }}/{{ agenda.quota }}</span>
                </div>
              </div>
              <UButton
                v-if="agenda.registrationUrl"
                :to="agenda.registrationUrl"
                external
                block
                size="sm"
                trailing-icon="i-lucide-external-link"
              >
                Daftar Sekarang
              </UButton>
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
    </UPageSection>
  </div>
</template>

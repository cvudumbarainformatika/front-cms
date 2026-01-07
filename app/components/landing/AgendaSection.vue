<script setup lang="ts">
/**
 * Agenda Kegiatan Section
 * Dark section dengan event cards (horizontal grid layout)
 */

const { $apiFetch } = useNuxtApp()
const router = useRouter()

// Fetch upcoming agenda (limit 3)
const { data: agendaData, pending } = useAsyncData(
  'home-agenda-list',
  () => $apiFetch('/agenda', {
    query: {
      limit: 3,
      upcoming: 'false',
      status: 'published'
    }
  }),
  {
    server: false
  }
)

const events = computed(() => {
  if (!agendaData.value?.data?.items) return []
  return agendaData.value.data.items.map((item: any) => {
    const d = new Date(item.date)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    
    // Determine color based on index or type for variety
    const colors = ['blue', 'purple', 'green']
    const typeColor = colors[Number(item.id) % 3] 

    return {
      id: item.id,
      slug: item.slug,
      month: monthNames[d.getMonth()],
      day: String(d.getDate()).padStart(2, '0'),
      type: item.type,
      typeColor,
      title: item.title,
      description: (item.description || '').replace(/<[^>]*>/g, ''),
      time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      location: item.location,
      registrationUrl: item.registration_url
    }
  })
})

const navigateToAgenda = () => router.push('/agenda')
</script>

<template>
  <UPageSection id="agenda" class="py-24 bg-primary-950 text-white rounded-t-[3rem] -mt-12 relative z-10">
    <div class="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
      <div>
        <h2 class="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Agenda <span class="text-primary-400">Kegiatan</span></h2>
        <p class="text-primary-100/70 text-lg max-w-xl">Ikuti seminar, webinar, dan workshop untuk meningkatkan kompetensi dan wawasan terkini.</p>
      </div>
      <div class="flex gap-2">
        <UButton to="/agenda" color="primary" variant="outline" class="rounded-full px-5 py-2.5 border-primary-800 text-primary-100 hover:bg-primary-900" trailing-icon="i-lucide-arrow-right">Lihat Semua</UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="i in 3" :key="i" class="h-96 bg-primary-900/40 rounded-3xl animate-pulse"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!events.length" class="text-center py-12 text-primary-200/50">
      <UIcon name="i-lucide-calendar-x" class="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p>Belum ada agenda</p>
    </div>

    <!-- Event Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <ScrollReveal 
        v-for="(event, index) in events"
        :key="event.id"
        animation="slide-up"
        :delay="index * 100"
      >
        <article class="bg-primary-900/40 border border-primary-800 rounded-3xl p-2 hover:border-primary-500/50 hover:bg-primary-900/60 transition-all h-full flex flex-col">
          <!-- Thumbnail/Date Badge -->
          <div class="rounded-2xl overflow-hidden h-48 bg-primary-800 border border-primary-700 relative flex flex-col items-center justify-center shrink-0">
            <span class="text-base font-semibold text-primary-200 uppercase tracking-wider">{{ event.month }}</span>
            <span class="text-6xl font-bold text-white mt-2">{{ event.day }}</span>
            
            <!-- Type Badge -->
            <div class="absolute top-4 left-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wide',
                  event.typeColor === 'blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : '',
                  event.typeColor === 'purple' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : '',
                  event.typeColor === 'green' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''
                ]"
              >
                {{ event.type }}
              </span>
            </div>
          </div>

          <!-- Event Content -->
          <div class="p-6 flex flex-col flex-1">
            <h3 class="text-xl font-semibold mb-3 text-white line-clamp-2 min-h-14">{{ event.title }}</h3>
            <p class="text-primary-200/60 mb-3 text-sm line-clamp-2 min-h-10">{{ event.description }}</p>
            
            <!-- Meta Info -->
            <div class="flex items-center gap-2 text-xs text-primary-200/50 mb-6 mt-auto">
              <UIcon v-if="event.time" name="i-lucide-clock" class="shrink-0 w-3.5 h-3.5" />
              <span v-if="event.time">{{ event.time }}</span>
              <UIcon v-if="event.location" name="i-lucide-map-pin" class="shrink-0 w-3.5 h-3.5 ml-2" />
              <span v-if="event.location" class="truncate max-w-[120px]">{{ event.location }}</span>
            </div>

            <!-- CTA Button -->
            <UButton
              :to="`/agenda/${event.slug}`"
              color="gray"
              block
              class="rounded-full !bg-white !text-primary-900 font-semibold hover:!bg-primary-50 mt-auto"
            >
              Detail acara
            </UButton>
          </div>
        </article>
      </ScrollReveal>
    </div>
  </UPageSection>
</template>

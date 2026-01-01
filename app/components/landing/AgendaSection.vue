<script setup lang="ts">
/**
 * Agenda Kegiatan Section
 * Dark section dengan event cards (horizontal grid layout)
 */

// Sample events data - bisa diganti dengan data dari API
const events = ref([
  {
    month: 'Nov',
    day: '15',
    type: 'Webinar',
    typeColor: 'blue',
    title: 'Update Management of Acute Respiratory Failure',
    description: 'Pembicara: Dr. dr. Spesialis Paru Konsultan (K)',
    time: '09:00 - 12:00 WIB',
    location: null
  },
  {
    month: 'Des',
    day: '02',
    type: 'Workshop Offline',
    typeColor: 'purple',
    title: 'Hands-on Spirometry & Bronchoscopy Basic',
    description: 'SKP IDI Terakreditasi',
    time: null,
    location: 'Grand Hyatt, Jakarta'
  },
  {
    month: 'Des',
    day: '18',
    type: 'Seminar',
    typeColor: 'green',
    title: 'Teknologi Terkini dalam Diagnosis Kanker Paru',
    description: 'Pembicara Internasional',
    time: '13:00 - 17:00 WIB',
    location: null
  }
])
</script>

<template>
  <UPageSection id="agenda" class="py-24 bg-primary-950 text-white rounded-t-[3rem] -mt-12 relative z-10">
    <ScrollReveal animation="fade">
      <div class="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
        <div>
          <h2 class="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Agenda <span class="text-primary-400">Kegiatan</span></h2>
          <p class="text-primary-100/70 text-lg max-w-xl">Ikuti seminar, webinar, dan workshop untuk meningkatkan kompetensi dan wawasan terkini.</p>
        </div>
        <div class="flex gap-2">
          <UButton color="primary" class="rounded-full px-5 py-2.5">Bulan Ini</UButton>
          <UButton color="primary" variant="outline" class="rounded-full px-5 py-2.5 border-primary-800 text-primary-100 hover:bg-primary-900">Mendatang</UButton>
        </div>
      </div>
    </ScrollReveal>

    <!-- Event Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <ScrollReveal 
        v-for="(event, index) in events"
        :key="index"
        animation="slide-up"
        :delay="index * 100"
      >
        <article class="bg-primary-900/40 border border-primary-800 rounded-3xl p-2 hover:border-primary-500/50 hover:bg-primary-900/60 transition-all h-full">
          <!-- Thumbnail/Date Badge -->
          <div class="rounded-2xl overflow-hidden h-48 bg-primary-800 border border-primary-700 relative flex flex-col items-center justify-center">
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
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-3 text-white line-clamp-2 h-14">{{ event.title }}</h3>
            <p class="text-primary-200/60 mb-3 text-sm h-10 line-clamp-2">{{ event.description }}</p>
            
            <!-- Meta Info -->
            <div class="flex items-center gap-2 text-xs text-primary-200/50 mb-4 h-5">
              <UIcon v-if="event.time" name="i-lucide-clock" class="w-3.5 h-3.5 flex-shrink-0" />
              <span v-if="event.time">{{ event.time }}</span>
              <UIcon v-if="event.location" name="i-lucide-map-pin" class="w-3.5 h-3.5 flex-shrink-0" />
              <span v-if="event.location">{{ event.location }}</span>
            </div>

            <!-- CTA Button -->
            <UButton
              color="white"
              block
              class="rounded-full text-primary-900 font-semibold hover:bg-primary-50"
            >
              Daftar
            </UButton>
          </div>
        </article>
      </ScrollReveal>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
/**
 * Hero Section Component
 * Main hero dengan gradient text, CTA buttons, stats, dan hero image carousel
 */

import type { HomepageData } from '~/types/content'

// Fetch homepage data untuk carousel images
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

const { data: home } = await useAsyncData('home-hero', 
  () => $apiFetch<{ success: boolean, data: HomepageData, message: string }>('/homepage'),
  { server: false, lazy: true }
)

const homeData = computed(() => home.value?.data)
</script>

<template>
  <div class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-50">
    <UContainer>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        <!-- Left Content -->
        <div class="space-y-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold uppercase tracking-wider">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            {{ (homeData?.hero as any)?.label || 'Leading Respiratory Science' }}
          </div>
          <div class="text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.1] text-slate-900">
            <span class="text-transparent bg-clip-text bg-gradient-to-r to-neutral-900 from-primary">{{ homeData?.hero.title || 'Kesehatan Respirasi' }}</span>.
          </div>
          <div class="text-lg md:text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
            {{ homeData?.hero.description || 'Wadah profesional kesehatan paru dan respirasi untuk kemajuan sains, pelayanan medis, dan edukasi masyarakat yang berkelanjutan.' }}
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4">
            <UButton
              to="#agenda"
              size="xl"
              color="primary"
              class="rounded-full shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all px-8 py-3.5"
              trailing-icon="i-lucide-calendar"
            >
              Lihat Agenda
            </UButton>
            <!-- <UButton
              to="#profil"
              size="xl"
              color="gray"
              variant="solid"
              class="rounded-full !bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-primary-200 hover:text-primary-600 px-8 py-3.5 ring-0"
              trailing-icon="i-lucide-arrow-down-right"
            >
              Tentang Kami
            </UButton> -->
          </div>

          <!-- Stats Row -->
          <div v-if="homeData?.stats?.length" class="flex flex-wrap items-center gap-8 pt-4 border-t border-slate-100">
            <div v-for="(stat, idx) in homeData.stats" :key="idx">
              <p class="text-3xl font-semibold tracking-tight text-slate-900">{{ stat.value }}</p>
              <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
          <div v-else class="flex items-center gap-8 pt-4 border-t border-slate-100">
             <!-- Fallback Stats if none -->
             <div>
               <p class="text-3xl font-semibold tracking-tight text-slate-900">2.500+</p>
               <p class="text-sm font-medium text-slate-500">Anggota Dokter</p>
             </div>
             <div>
               <p class="text-3xl font-semibold tracking-tight text-slate-900">50+</p>
               <p class="text-sm font-medium text-slate-500">Cabang Daerah</p>
             </div>
          </div>
        </div>

        <!-- Right Image with Carousel -->
        <div class="relative">
          <div class="relative rounded-[2.5rem] overflow-hidden shadow-2xl group shadow-primary-900/10">
            <!-- Carousel -->
            <ClientOnly>
              <template #fallback>
                 <div class="h-[600px] w-full bg-slate-200 animate-pulse rounded-lg"></div>
              </template>
              <UCarousel
                v-slot="{ item }"
                :items="homeData?.hero.images || []"
                :ui="{
                  item: 'h-[600px] basis-full',
                  container: 'h-[600px]'
                }"
                indicators
                autoplay
                :interval="4000"
                loop
                class="w-full max-w-xl mx-auto"
              >
                <img
                  :src="getImageUrl(item)"
                  :alt="`Hero Image`"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-lg"
                  draggable="false"
                >
              </UCarousel>
            </ClientOnly>
            
            <div class="absolute inset-0 bg-gradient-to-t via-transparent to-transparent from-primary-950/80 pointer-events-none"></div>

            <!-- Floating Tags -->
            <div class="absolute top-8 left-8 flex flex-col gap-3 z-10">
              <span class="inline-flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg bg-white/90 text-primary-800">
                <UIcon name="i-lucide-stethoscope" class="w-3.5 h-3.5" /> 
                {{ (homeData?.hero as any)?.event_tag || 'Clinical Excellence' }}
              </span>
            </div>

            <!-- Bottom Card -->
            <div class="absolute bottom-8 left-8 right-8 backdrop-blur-xl p-6 rounded-2xl shadow-xl flex items-center justify-between bg-white/95 z-10">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider mb-1 text-primary-600">
                  {{ (homeData?.hero as any)?.event_title || 'Simposium Nasional 2024' }}
                </p>
                <p class="font-medium text-slate-900">
                  {{ (homeData?.hero as any)?.event_desc || 'Inovasi Penanganan PPOK & Asma' }}
                </p>
              </div>

            </div>
          </div>
        </div>


      </div>
    </UContainer>
  </div>
</template>

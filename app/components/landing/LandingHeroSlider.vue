<script setup lang="ts">
/**
 * LandingHeroSlider Component
 * Full-width slider with content overlay for Theme 2 - Simplified
 */
import type { HomepageData } from '~/types/content'

const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

const { data: home } = await useAsyncData('home-hero-slider',
  () => $apiFetch<{ success: boolean, data: HomepageData, message: string }>('/homepage'),
  { server: false, lazy: true }
)

const homeData = computed(() => home.value?.data)
const items = computed(() => homeData.value?.hero.images || [])
</script>

<template>
  <div class="relative w-full overflow-hidden bg-slate-50">
    <UCarousel
      v-if="items.length > 0"
      :key="items.length"
      v-slot="{ item }"
      :items="items"
      :ui="{
        root: 'w-full relative p-0 m-0 overflow-hidden',
        viewport: 'w-full p-0 m-0 overflow-hidden',
        container: 'flex w-full h-[600px] md:h-[700px] lg:h-[800px] p-0 m-0',
        item: 'basis-full min-w-full w-full h-full p-0 m-0 overflow-hidden snap-start shrink-0'
      }"
      :gap="0"
      indicators
      autoplay
      :interval="5000"
      loop
      class="w-full"
    >
      <div class="relative w-full h-full">
        <NuxtImg
          :src="getImageUrl(item)"
          alt="Hero Banner"
          class="w-full h-full object-cover transition-transform duration-1000"
          draggable="false"
          loading="eager"
          format="webp"
        />
        <!-- Gradient Overlays for better text readability -->
        <div class="absolute inset-0 bg-linear-to-r from-white via-white/40 to-transparent pointer-events-none"></div>
        <div class="absolute inset-0 bg-linear-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none"></div>
      </div>
    </UCarousel>

    <!-- Fallback if no images -->
    <div v-else class="w-full h-[600px] flex items-center justify-center bg-slate-200">
       <UIcon name="i-lucide-image" class="w-12 h-12 text-slate-400 animate-pulse" />
    </div>

    <!-- Static Content Overlay (Fixed over the carousel) -->
    <div class="absolute inset-0 flex items-center pt-24 pb-12 pointer-events-none z-10">
      <UContainer class="w-full">
        <!-- background mesh for mobile visibility -->
        <div class="absolute inset-0 bg-white/40 lg:hidden pointer-events-none"></div>
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl lg:hidden pointer-events-none"></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <!-- Left Content Overlay -->
          <ScrollReveal animation="slide-up">
            <div class="space-y-6 md:space-y-8 max-w-xl pointer-events-auto">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50/80 border border-primary-100/50 text-primary-600 text-[10px] md:text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                {{ homeData?.hero?.label || 'DOKTER PARU INDONESIA' }}
              </div>

              <div class="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-slate-900 drop-shadow-sm">
                <span class="text-transparent bg-clip-text bg-linear-to-br from-primary-700 via-primary-500 to-primary-900">
                  {{ homeData?.hero?.title || 'Leading Respiratory Science.' }}
                </span>
              </div>

              <div class="text-base md:text-xl text-slate-600 font-medium leading-relaxed drop-shadow-sm max-w-lg">
                {{ homeData?.hero?.description || 'Wadah profesional kesehatan paru dan respirasi untuk kemajuan sains, pelayanan medis, dan edukasi masyarakat.' }}
              </div>

              <div class="flex flex-col sm:flex-row gap-4 pt-4">
                <UButton
                  to="#agenda"
                  size="xl"
                  color="primary"
                  variant="solid"
                  class="rounded-2xl shadow-2xl shadow-primary-500/40 hover:shadow-primary-500/60 hover:-translate-y-1 transition-all px-8 md:px-10 py-4 font-black tracking-wide"
                  trailing-icon="i-lucide-calendar"
                >
                  LIHAT AGENDA
                </UButton>
              </div>

              <!-- Stats Overlay (Bottom) -->
              <div v-if="homeData?.stats?.length" class="flex flex-wrap items-center gap-6 md:gap-12 mt-8 md:mt-12 bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-4xl md:rounded-3xl border border-white shadow-2xl shadow-slate-200/50">
                <div v-for="(stat, idx) in homeData.stats" :key="idx" class="relative group text-center flex-1 min-w-[100px]">
                  <p class="text-3xl md:text-4xl font-black tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">{{ stat.value }}</p>
                  <p class="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mt-1">{{ stat.label }}</p>
                </div>
              </div>
              <div v-else class="flex items-center gap-8 md:gap-12 mt-8 md:mt-12 bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-4xl md:rounded-3xl border border-white shadow-2xl shadow-slate-200/50">
                <div class="text-center flex-1">
                  <p class="text-3xl md:text-4xl font-black tracking-tight text-slate-900">1891</p>
                  <p class="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Anggota</p>
                </div>
                <div class="w-px h-8 bg-slate-200"></div>
                <div class="text-center flex-1">
                  <p class="text-3xl md:text-4xl font-black tracking-tight text-slate-900">42</p>
                  <p class="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Cabang</p>
                </div>
              </div>
            </div>
          </ScrollReveal>


          <!-- Right: Empty column (Card hidden as requested) -->
          <div class="hidden lg:block"></div>
        </div>
      </UContainer>
    </div>
  </div>
</template>

<style scoped>
.text-primary-600 { color: #10B981; }
.bg-primary-600 { background-color: #10B981; }
.shadow-primary-500\/30 { box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.3); }
</style>

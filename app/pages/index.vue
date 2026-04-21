<script setup lang="ts">
/**
 * Homepage - Redesigned with Modular Components
 * Mendukung Theme 1 (Lama) dan Theme 2 (Baru)
 */
import type { HomepageData } from '~/types/content'

definePageMeta({
  layout: 'landing'
})

const { $apiFetch } = useNuxtApp()
const { data: home } = useAsyncData('home-index',
  () => $apiFetch<{ success: boolean, data: HomepageData, message: string }>('/homepage'),
  { server: false, lazy: true }
)

const theme = computed(() => home.value?.data?.theme || 'theme-2')

useHead({
  title: computed(() => home.value?.data?.seo?.title || 'Perhimpunan Dokter Paru Indonesia - Official Portal'),
  style: [
    {
      textContent: `
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `
    }
  ],
  link: [
    { href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap', rel: 'stylesheet' }
  ]
})

useSeoMeta({
  title: computed(() => home.value?.data?.seo?.title),
  ogTitle: computed(() => home.value?.data?.seo?.title),
  description: computed(() => home.value?.data?.seo?.description),
  ogDescription: computed(() => home.value?.data?.seo?.description),
})
</script>

<template>
  <div>
    <!-- Theme 2 (New) -->
    <template v-if="theme === 'theme-2'">
      <LandingHeroSlider />
      <LandingAboutUs />
      <LandingAgendaSection />
      <LandingPublikasiSection />
      <LandingDirekoriSection />
    </template>

    <!-- Theme 1 (Old) -->
    <template v-else>
      <LandingHeroSection />
      <LandingAgendaSection />
      <LandingPublikasiSection />
      <LandingDirekoriSection />
    </template>
  </div>
</template>

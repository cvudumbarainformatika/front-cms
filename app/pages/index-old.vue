<script setup lang="ts">
import { OrganizationLogo } from '#components'

/**
 * Homepage PDPI
 * Landing page dengan spotlight effect dan konten dinamis
 */

import type { HomepageData } from '../types/content'

// Fetch homepage data
const { data: home } = await useFetch<{ success: boolean, data: HomepageData, message: string }>('/api/homepage')
const homeData = computed(() => home.value?.data)

// Fetch latest data
const { data: latestBerita } = await useFetch<any>('/api/berita', {
  query: { limit: 3 }
})

const { data: upcomingAgenda } = await useFetch<any>('/api/agenda', {
  query: { upcoming: 'true', limit: 3 }
})

const { data: profil } = await useFetch<any>('/api/profil')

// SEO
useSeoMeta({
  titleTemplate: '',
  title: () => homeData.value?.seo.title || 'PDPI - Perhimpunan Dokter Paru Indonesia',
  ogTitle: () => homeData.value?.seo.title || 'PDPI - Perhimpunan Dokter Paru Indonesia',
  description: () => homeData.value?.seo.description || 'Organisasi profesi dokter spesialis paru terkemuka di Indonesia.',
  ogDescription: () => homeData.value?.seo.description || 'Organisasi profesi dokter spesialis paru terkemuka di Indonesia.',
  ogImage: '/og-pdpi.png'
})
</script>

<template>
  <div>
    <!-- Custom Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Background (Optional: bisa dikondisikan dark/light) -->
      <div class="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900" />
      
      <!-- <UContainer class="relative z-10">
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div class="space-y-6">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              Perhimpunan Dokter Paru Indonesia
            </h1>
            <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
              Organisasi profesi dokter spesialis paru terkemuka di Indonesia yang berkomitmen meningkatkan kualitas pelayanan kesehatan respiratori melalui pendidikan, penelitian, dan inovasi.
            </p>
            <div class="flex flex-wrap gap-4 pt-4">
              <UButton
                to="/daftar"
                size="xl"
                color="primary"
                icon="i-lucide-user-plus"
              >
                Daftar Anggota
              </UButton>
              <UButton
                to="/agenda"
                size="xl"
                variant="outline"
                color="primary"
                icon="i-lucide-calendar"
              >
                Lihat Agenda
              </UButton>
            </div>
          </div>
          <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10 mt-8 lg:mt-0">
            <UCarousel
              v-slot="{ item }"
              :items="heroImages"
              :ui="{
                item: 'basis-full',
                container: 'rounded-2xl',
                indicators: {
                  wrapper: 'absolute bottom-4 left-1/2 -translate-x-1/2 z-10'
                }
              }"
              indicators
              autoplay
              :interval="4000"
              loop
              class="w-full h-full"
            >
              <img
                :src="item"
                class="w-full h-full object-cover"
                draggable="false"
              >
            </UCarousel>
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </UContainer> -->
    </div>

   

    <UPageSection
      :title="homeData?.hero.title || 'Perhimpunan Dokter Paru Indonesia'"
      :description="homeData?.hero.description || 'Organisasi profesi dokter spesialis paru terkemuka di Indonesia...'"
      orientation="horizontal"
      variant="naked"
      :links="[
        {
          label: 'Daftar Anggota',
          href: '/daftar',
          icon: 'i-lucide-user-plus',
          color: 'primary',
          variant: 'solid'
        },
        {
          label: 'Lihat Agenda',
          href: '/agenda',
          icon: 'i-lucide-calendar',
          color: 'neutral',
          variant: 'subtle'
        }
      ]"
    >
      <template #headline>
        <OrganizationLogo size="2xl" :show-text="false" />
      </template>

      <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10 mt-8 lg:mt-0">
        <UCarousel
          v-slot="{ item }"
          :items="homeData?.hero.images || []"
          :ui="{
            item: 'basis-full',
            container: 'rounded-2xl'
          }"
          indicators
          autoplay
          :interval="4000"
          loop
          class="w-full h-full"
        >
          <img
            :src="(item as string)"
            class="w-full h-full object-cover"
            draggable="false"
          >
        </UCarousel>
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </div>
      <LazyStarsBg />
      <LazyStarsBg />
    </UPageSection>

    <!-- Stats Section (Spotlight) -->
    <UPageSection class="border-b border-gray-200 dark:border-gray-800"
    :ui="{
      wrapper: '!py-8',
      container: '!gap-8'
    }">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <UPageCard
          v-for="stat in homeData?.stats"
          :key="stat.label"
          spotlight
          variant="subtle"
          :ui="{ 
            body: '!p-0',
            wrapper: 'h-full'
          }"
        >
          <div class="text-center flex flex-col items-center justify-center h-full">
            <div class="text-4xl lg:text-5xl font-bold text-primary mb-2">
              {{ stat.value }}
            </div>
            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </UPageCard>
      </div>

      <LazyStarsBg />
    </UPageSection>

    <!-- Visi Misi Section (Spotlight) -->
    <UPageSection
      v-if="profil?.data?.visiMisi"
      title="Visi & Misi"
      description="Komitmen kami untuk kemajuan kesehatan respiratori Indonesia"
    >
      <div class="grid lg:grid-cols-2 gap-8">
        <UPageCard
          title="Visi"
          :description="profil.data.visiMisi.visi"
          icon="i-lucide-eye"
          variant="subtle"
          spotlight
        />
        <UPageCard
          title="Misi"
          icon="i-lucide-target"
          variant="subtle"
          spotlight
        >
          <ul class="space-y-2 text-muted">
            <li
              v-for="(item, index) in profil.data.visiMisi.misi.slice(0, 4)"
              :key="index"
              class="flex gap-2"
            >
              <UIcon name="i-lucide-check" class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{{ item }}</span>
            </li>
          </ul>
          <UButton
            to="/profil/visi-misi"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
            class="mt-4"
          >
            Lihat Selengkapnya
          </UButton>
        </UPageCard>
      </div>
      <LazyStarsBg />
    </UPageSection>

    <!-- Features Section (Already Spotlight) -->
    <UPageSection
      title="Mengapa Bergabung dengan PDPI?"
      description="Manfaat dan fasilitas yang Anda dapatkan sebagai anggota PDPI"
    >
      <UPageGrid>
        <UPageCard
          v-for="feature in homeData?.features"
          :key="feature.title"
          :title="feature.title"
          :description="feature.description"
          :icon="feature.icon"
          spotlight
        />
      </UPageGrid>
      <LazyStarsBg />
    </UPageSection>

    <!-- Latest Berita (Spotlight) -->
    <UPageSection
      v-if="latestBerita?.data?.items"
      title="Artikel Terkini"
      description="Update terbaru dari dunia respirologi Indonesia"
      :links="[{
        label: 'Lihat Semua Artikel',
        to: '/berita',
        trailingIcon: 'i-lucide-arrow-right',
        color: 'neutral',
        variant: 'link'
      }]"
    >
      <div class="grid md:grid-cols-3 gap-6">
        <UPageCard
          v-for="berita in latestBerita.data.items"
          :key="berita.id"
          :title="berita.title"
          :description="berita.excerpt"
          :to="`/berita/${berita.slug}`"
          spotlight
          :ui="{
            body: '!p-0',
            footer: 'px-6 py-4'
          }"
        >
          <template #header>
            <div class="relative overflow-hidden group">
              <img
                :src="berita.image"
                :alt="berita.title"
                class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              >
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </template>
          <template #footer>
            <div class="flex items-center justify-between text-sm">
              <UBadge
                :label="berita.category"
                variant="subtle"
                size="sm"
              />
              <span class="text-muted">
                {{ new Date(berita.publishedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year:  'numeric'
                }) }}
              </span>
            </div>
          </template>
        </UPageCard>
      </div>
      <LazyStarsBg />
    </UPageSection>

    <!-- Upcoming Agenda (Already Spotlight) -->
    <UPageSection
      v-if="upcomingAgenda?.data?.items"
      title="Agenda Mendatang"
      description="Kegiatan dan acara ilmiah PDPI"
      :links="[{
        label: 'Lihat Semua Agenda',
        to: '/agenda',
        trailingIcon: 'i-lucide-arrow-right',
        color: 'neutral',
        variant: 'link'
      }]"
    >
      <div class="grid md:grid-cols-3 gap-6">
        <UPageCard
          v-for="agenda in upcomingAgenda.data.items"
          :key="agenda.id"
          :title="agenda.title"
          :description="agenda.description"
          spotlight
        >
          <template #footer>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                <span>{{ new Date(agenda.date).toLocaleDateString('id-ID') }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <UIcon
                  :name="agenda.isOnline ? 'i-lucide-video' : 'i-lucide-map-pin'"
                  class="w-4 h-4"
                />
                <span>{{ agenda.location }}</span>
              </div>
              <div class="flex items-center justify-between mt-4">
                <UBadge :label="`${agenda.skp} SKP`" color="primary" />
                <UButton
                  :to="`/agenda#${agenda.slug}`"
                  size="xs"
                  trailing-icon="i-lucide-arrow-right"
                >
                  Detail
                </UButton>
              </div>
            </div>
          </template>
        </UPageCard>
      </div>
      <LazyStarsBg />
    </UPageSection>

    <!-- CTA Section -->
    <USeparator />

    <UPageCTA
      title="Bergabunglah dengan PDPI"
      description="Tingkatkan kompetensi dan jaringan profesional Anda bersama ribuan dokter spesialis paru di seluruh Indonesia."
      :links="[{
        label: 'Daftar Sekarang',
        to: '/daftar',
        size: 'xl',
        trailingIcon: 'i-lucide-arrow-right'
      }, {
        label: 'Pelajari Lebih Lanjut',
        to: '/profil',
        size: 'xl',
        color: 'neutral',
        variant: 'outline'
      }]"
      variant="naked"
      class="overflow-hidden"
    >
      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>

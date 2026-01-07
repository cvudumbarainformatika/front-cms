<script setup lang="ts">
/**
 * Berita & Publikasi Section
 * Grid dengan 1 highlighted article + 2 small articles
 */

const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

// Fetch latest news (limit 3)
const { data: beritaData, pending } = useAsyncData(
  'home-berita-list',
  () => $apiFetch('/berita', {
    query: {
      limit: 3,
      status: 'published'
    }
  }),
  {
    server: false
  }
)

const newsItems = computed(() => {
  if (!beritaData.value?.data?.items) return []
  return beritaData.value.data.items.map((item: any) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: (item.excerpt || item.content || '').replace(/<[^>]*>/g, ''),
    date: new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    vol: new Date(item.published_at).toLocaleDateString('id-ID', { month: '2-digit', year: '2-digit' }), // Dummy vol/no based on date
    category: item.category || 'Berita',
    image: getImageUrl(item.image_url, 'news'),
    thumbnail: getImageUrl(item.image_url, 'news')
  }))
})

const highlight = computed(() => newsItems.value[0])
const subNews = computed(() => newsItems.value.slice(1, 3))
</script>

<template>
  <UPageSection id="publikasi" class="py-24">
    <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
      <div>
        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider bg-primary-50 text-primary-600 border border-primary-100">Updates</span>
        <h2 class="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
          Berita & <span class="text-primary-500">Publikasi Ilmiah</span>
        </h2>
      </div>
      <NuxtLink to="/berita" class="group flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700 transition-colors">
        Lihat Semua
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>

    <!-- Dynamic Content -->
    <ClientOnly>
      <template #fallback>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="lg:col-span-2 h-96 bg-gray-100 rounded-3xl animate-pulse"></div>
          <div v-for="i in 2" :key="i" class="h-96 bg-gray-100 rounded-3xl animate-pulse"></div>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-2 h-96 bg-gray-100 rounded-3xl animate-pulse"></div>
        <div v-for="i in 2" :key="i" class="h-96 bg-gray-100 rounded-3xl animate-pulse"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="!newsItems.length" class="text-center py-12 text-muted">
         <p>Belum ada berita terbaru</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Highlighted Article -->
        <ScrollReveal v-if="highlight" animation="slide-up" class="lg:col-span-2">
          <NuxtLink :to="`/berita/${highlight.slug}`" class="group cursor-pointer h-full block">
            <div class="relative rounded-3xl overflow-hidden mb-4 aspect-video shadow-sm">
              <img :src="highlight.image" :alt="highlight.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm text-primary-700">{{ highlight.category }}</div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-3 text-sm text-slate-400 font-medium">
                <span class="flex items-center gap-1"><UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" /> {{ highlight.date }}</span>
              </div>
              <h3 class="text-2xl font-semibold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2">{{ highlight.title }}</h3>
              <p class="text-slate-500 line-clamp-2">{{ highlight.excerpt }}</p>
            </div>
          </NuxtLink>
        </ScrollReveal>

        <!-- Small Articles -->
        <ScrollReveal 
          v-for="(news, idx) in subNews" 
          :key="news.id" 
          animation="slide-up" 
          :delay="(Number(idx) + 1) * 200"
        >
          <NuxtLink :to="`/berita/${news.slug}`" class="group cursor-pointer h-full block">
            <div class="relative rounded-3xl overflow-hidden mb-4 aspect-4/3 shadow-sm">
              <img :src="news.thumbnail" :alt="news.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute top-4 left-4 bg-primary-100/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm text-primary-700">{{ news.category }}</div>
            </div>
            <div class="space-y-2">
              <span class="text-xs font-medium text-slate-400">{{ news.date }}</span>
              <h3 class="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-3">{{ news.title }}</h3>
            </div>
          </NuxtLink>
        </ScrollReveal>
      </div>
    </ClientOnly>
  </UPageSection>
</template>

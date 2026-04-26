<script setup lang="ts">
/**
 * Galeri Video PDPI - Meniru layout Agenda
 */
definePageMeta({
  layout: 'news'
})

const { $apiFetch } = useNuxtApp()
const route = useRoute()
const router = useRouter()

// State
const groupedData = ref<Record<string, any>>({})
const loading = ref(true)
const selectedCategory = ref(route.query.category as string || '')

// Video Modal State
const isVideoOpen = ref(false)
const activeVideo = ref<any>(null)

// Client-side hydration safety
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await $apiFetch('/thumbnails/grouped')
    groupedData.value = (res as any).data || {}
  } catch (e) {
    console.error('Failed to fetch public thumbnails:', e)
  } finally {
    loading.value = false
  }
}

const categories = computed(() => {
  return Object.keys(groupedData.value).sort()
})

const filteredData = computed(() => {
  if (!selectedCategory.value) return groupedData.value
  const result: Record<string, any> = {}
  if (groupedData.value[selectedCategory.value]) {
    result[selectedCategory.value] = groupedData.value[selectedCategory.value]
  }
  return result
})

// Flatten for "Recent Videos" or "All"
const allVideos = computed(() => {
  return Object.values(groupedData.value).flat().sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})

function openVideo(video: any) {
  activeVideo.value = video
  isVideoOpen.value = true
}

function getYoutubeID(url: string) {
  if (!url) return ''
  let id = ''
  if (url.includes('v=')) id = url.split('v=')[1].split('&')[0]
  else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0]
  return id
}

function setCategory(cat: string) {
  selectedCategory.value = cat
  router.push({ query: { ...route.query, category: cat || undefined } })
}

useSeoMeta({
  title: 'Galeri Video - PDPI',
  description: 'Kumpulan video edukasi dan informasi kesehatan paru terpercaya'
})
</script>

<template>
  <UPage>
    <UPageHeader
      title="Galeri Video"
      description="Kumpulan video edukasi dan informasi kesehatan paru terpercaya dari PDPI"
    />

    <UPageBody>
      <!-- Filter Kategori (Meniru Filter Agenda) -->
      <div class="flex flex-wrap gap-2 mb-8">
        <UButton
          :variant="selectedCategory === '' ? 'solid' : 'outline'"
          :color="selectedCategory === '' ? 'primary' : 'neutral'"
          icon="i-lucide-layout-grid"
          size="md"
          @click="setCategory('')"
        >
          Semua Kategori
        </UButton>
        
        <UButton
          v-for="cat in categories" :key="cat"
          :variant="selectedCategory === cat ? 'solid' : 'outline'"
          :color="selectedCategory === cat ? 'primary' : 'neutral'"
          size="md"
          @click="setCategory(cat)"
        >
          {{ cat }}
        </UButton>
      </div>

      <!-- Video Grid -->
      <template v-if="isMounted">
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="`skeleton-${i}`">
            <USkeleton class="h-48 w-full rounded-lg mb-4" />
            <USkeleton class="h-4 w-3/4 rounded mb-2" />
            <USkeleton class="h-3 w-full rounded mb-1" />
          </div>
        </div>

        <div v-else-if="allVideos.length">
          <!-- Filtered Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <UBlogPost
              v-for="video in (selectedCategory ? filteredData[selectedCategory] : allVideos)"
              :key="video.id"
              :title="video.title"
              :description="video.description"
              :badge="{ label: video.category }"
              variant="outline"
              orientation="vertical"
              class="cursor-pointer group"
              :ui="{
                description: 'line-clamp-2',
                header: 'mb-4'
              }"
              @click="openVideo(video)"
            >
              <template #header>
                <div class="relative w-full h-48 overflow-hidden rounded-lg shadow-sm bg-neutral-100 dark:bg-neutral-800 group">
                  <img
                    v-if="getYoutubeID(video.youtube_url)"
                    :src="`https://img.youtube.com/vi/${getYoutubeID(video.youtube_url)}/maxresdefault.jpg`"
                    :alt="video.title"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    @error="(e: any) => e.target.src = `https://img.youtube.com/vi/${getYoutubeID(video.youtube_url)}/0.jpg`"
                  />
                  
                  <!-- Play Overlay -->
                  <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
                      <UIcon name="i-lucide-play" class="w-6 h-6 ml-0.5" />
                    </div>
                  </div>
                </div>
              </template>
              <template #authors>
                <div class="flex items-center gap-1.5 text-xs text-muted">
                  <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                  {{ new Date(video.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                </div>
              </template>
            </UBlogPost>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
          <UIcon name="i-lucide-video-off" class="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
          <p class="text-lg font-medium text-neutral-500">Tidak ada video ditemukan</p>
          <UButton variant="link" color="primary" class="mt-2" @click="setCategory('')">Lihat Semua Video</UButton>
        </div>
      </template>

      <!-- SSR Skeleton -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="`skeleton-${i}`">
          <USkeleton class="h-48 w-full rounded-lg mb-4" />
          <USkeleton class="h-4 w-3/4 rounded mb-2" />
          <USkeleton class="h-3 w-full rounded mb-1" />
        </div>
      </div>
    </UPageBody>

    <template #right>
      <UPageAside>
        <div class="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
          <h3 class="text-sm font-medium text-muted uppercase tracking-wider">Video Terbaru</h3>
          <template v-if="isMounted">
            <div class="space-y-3">
              <div
                v-for="v in allVideos.slice(0, 6)"
                :key="`side-${v.id}`"
                class="flex items-start gap-3 cursor-pointer group"
                @click="openVideo(v)"
              >
                <div class="relative w-16 h-10 rounded overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                   <img
                    v-if="getYoutubeID(v.youtube_url)"
                    :src="`https://img.youtube.com/vi/${getYoutubeID(v.youtube_url)}/0.jpg`"
                    class="absolute inset-0 w-full h-full object-cover"
                  />
                  <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <div class="min-w-0">
                  <p class="text-[11px] leading-tight line-clamp-2 font-medium group-hover:text-primary-600 transition-colors">
                    {{ v.title }}
                  </p>
                  <p class="text-[10px] text-muted mt-1 uppercase font-bold tracking-tighter">{{ v.category }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </UPageAside>
    </template>

    <!-- Video Modal Player -->
    <ClientOnly>
      <UModal v-model:open="isVideoOpen" :ui="{ width: 'w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[1200px]', height: 'max-h-[90vh]' }">
        <template #content>
          <div v-if="activeVideo" class="flex flex-col bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800">
            <!-- Video Player Area -->
            <div class="relative bg-black aspect-video w-full">
              <iframe
                :src="`https://www.youtube.com/embed/${getYoutubeID(activeVideo.youtube_url)}?autoplay=1&rel=0`"
                class="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
              
              <!-- Integrated Close Button -->
              <UButton 
                @click="isVideoOpen = false"
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                class="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center transition-all z-50 border border-white/10"
              />
            </div>
            
            <!-- Simplified Info Area -->
            <div class="p-8 md:p-10 bg-white dark:bg-slate-950">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <!-- Title & Meta -->
                <div class="space-y-3 flex-1">
                  <div class="flex items-center gap-3">
                    <UBadge color="primary" variant="subtle" size="md" class="rounded-full px-4 font-bold uppercase text-[10px]">{{ activeVideo.category }}</UBadge>
                  </div>
                  <h2 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">{{ activeVideo.title }}</h2>
                </div>
                
                <!-- Action Button -->
                <div class="flex">
                  <UButton
                    :to="activeVideo.youtube_url"
                    target="_blank"
                    variant="solid"
                    color="neutral"
                    icon="i-lucide-youtube"
                    size="lg"
                    class="rounded-xl px-6 py-3 font-bold uppercase tracking-wider text-[11px] shadow-lg shadow-gray-200 dark:shadow-none hover:translate-y-[-2px] transition-all"
                  >
                    Buka di YouTube
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UModal>
    </ClientOnly>
  </UPage>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

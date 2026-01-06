<script setup lang="ts">
definePageMeta({
  layout: 'news'
})

const route = useRoute()
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()
const slug = route.params.slug as string

// Fetch berita detail from backend
const { data: berita, pending, error } = await useAsyncData(
  `berita-${slug}`,
  () => $apiFetch(`/berita/${slug}`),
  { server: false }
)

const item = computed(() => berita.value?.data)

// URL saat ini untuk share
const url = useRequestURL()
const currentUrl = computed(() => url.href)
const shareUrl = computed(() => encodeURIComponent(currentUrl.value || ''))
const shareToX = computed(() => item.value ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.value.title)}&url=${shareUrl.value}` : '')
const shareToFacebook = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${shareUrl.value}`)

function copyLink() {
  if (process.client) navigator.clipboard.writeText(currentUrl.value || '')
}

// SEO
useSeoMeta({
  title: () => item.value ? `${item.value.title} - PDPI` : 'Detail Berita - PDPI',
  description: () => item.value?.excerpt,
  ogTitle: () => item.value?.title,
  ogDescription: () => item.value?.excerpt,
  ogImage: () => item.value ? getImageUrl(item.value.image_url) : undefined,
  articlePublishedTime: () => item.value?.published_at,
  articleAuthor: () => item.value ? [item.value.author] : []
})

// Sanitasi konten HTML
function sanitizeHtmlSSR(html: string) {
  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  html = html.replace(/(<iframe[^>]*sandbox=\"[^\"]*)(allow-same-origin)([^\"]*\"[^>]*>)/gi, (m, p1, _m2, p3) => {
    if (/allow-scripts/i.test(m)) {
      return `${p1}${p3}`.replace(/\s{2,}/g, ' ')
    }
    return m
  })
  return html
}

function sanitizeHtml(html: string) {
  if (process.client) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      doc.querySelectorAll('script').forEach(el => el.remove())
      doc.querySelectorAll('iframe').forEach((ifr) => {
        const sandbox = ifr.getAttribute('sandbox') || ''
        if (/allow-scripts/i.test(sandbox) && /allow-same-origin/i.test(sandbox)) {
          const cleaned = sandbox.replace(/\ballow-same-origin\b/ig, '').replace(/\s{2,}/g, ' ').trim()
          if (cleaned) ifr.setAttribute('sandbox', cleaned)
          else ifr.removeAttribute('sandbox')
        }
      })
      return doc.body.innerHTML
    } catch (e) {
      return sanitizeHtmlSSR(html)
    }
  }
  return sanitizeHtmlSSR(html)
}

const sanitizedContent = computed(() => item.value ? sanitizeHtml((item.value.content || '').replace(/\n\n/g, '</p><p>')) : '')

// Related posts fetch
// Gunakan watchEffect atau similar karena item mungkin null di awal
const { data: relatedByCategory, pending: pendingCat } = await useAsyncData(
  `related-cat-${slug}`, // key unik static karena item.category belum ada
  () => item.value ? $apiFetch('/berita', {
    query: { category: item.value.category, limit: 6, status: 'published' }
  }) : Promise.resolve(null),
  { watch: [item], server: false }
)
const { data: relatedByAuthor, pending: pendingAuthor } = await useAsyncData(
  `related-author-${slug}`,
  () => item.value ? $apiFetch('/berita', {
    query: { author: item.value.author, limit: 6, status: 'published' }
  }) : Promise.resolve(null),
  { watch: [item], server: false }
)
const related = computed(() => {
  if (!item.value) return []
  const cat = relatedByCategory.value?.data?.items || []
  const auth = relatedByAuthor.value?.data?.items || []
  const merged = [...cat, ...auth]
  const unique = merged.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i)
  return unique.filter(x => x.slug !== item.value.slug).slice(0, 6)
})
const relatedPending = computed(() => pendingCat.value || pendingAuthor.value)

// Popular posts
const { data: popularData, pending: pendingPopular } = await useAsyncData(
  'popular-berita',
  () => $apiFetch('/berita', {
    query: { sort: 'views', order: 'desc', limit: 6, status: 'published' }
  }),
  { server: false }
)
const popular = computed(() => (popularData.value?.data?.items || []).filter(p => item.value ? p.slug !== item.value.slug : true).slice(0, 6))

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(d)
  } catch (e) {
    return '-'
  }
}

const formatDateShort = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC'
    }).format(d)
  } catch (e) {
    return '-'
  }
}
</script>

<template>
  <UPage>
    <ClientOnly>
      <template #fallback>
        <UPageHeader class="mb-8">
          <template #headline>
            <USkeleton class="h-8 w-3/4 mb-2" />
            <USkeleton class="h-4 w-1/2" />
          </template>
        </UPageHeader>
      </template>
      <UPageHeader
        :title="item?.title"
        :description="item?.excerpt"
      >
        <template #headline v-if="pending">
          <USkeleton class="h-8 w-3/4 mb-2" />
          <USkeleton class="h-4 w-1/2" />
        </template>
      </UPageHeader>
    </ClientOnly>

    <template #left>
      <UPageAside>
        <ClientOnly>
          <div class="sticky top-20 space-y-4">
            <h3 class="text-sm font-medium text-muted">Related Posts</h3>
            <div v-if="relatedPending || pending" class="space-y-3">
              <div v-for="i in 6" :key="i" class="flex items-start gap-3">
                <USkeleton class="w-14 h-14 rounded" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-4/5" />
                  <USkeleton class="h-3 w-1/3" />
                </div>
              </div>
            </div>
            <div v-else-if="related.length" class="space-y-3">
              <div
                v-for="rb in related"
                :key="rb.id"
                class="flex items-start gap-3"
              >
                <img :src="getImageUrl(rb.image_url, 'news')" :alt="rb.title" class="w-14 h-14 rounded object-cover" />
                <div class="min-w-0">
                  <NuxtLink :to="`/berita/${rb.slug}`" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                    {{ rb.title }}
                  </NuxtLink>
                  <p class="text-xs text-muted">{{ formatDateShort(rb.published_at) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-xs text-slate-500 italic">
              Tidak ada berita terkait
            </div>
          </div>
        </ClientOnly>
      </UPageAside>
    </template>

    <template #right>
      <UPageAside>
        <ClientOnly>
          <div class="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
            <h3 class="text-sm font-medium text-muted">Bagikan</h3>
            <div class="flex gap-2">
              <UButton icon="i-lucide-share-2" color="neutral" variant="ghost" :to="shareToX" external aria-label="Bagikan ke X" :disabled="!item" />
              <UButton icon="i-simple-icons-facebook" color="neutral" variant="ghost" :to="shareToFacebook" external aria-label="Bagikan ke Facebook" :disabled="!item" />
              <UButton icon="i-lucide-link" color="neutral" variant="ghost" @click="copyLink" aria-label="Salin tautan" :disabled="!item" />
            </div>

            <USeparator class="my-4" />

            <h3 class="text-sm font-medium text-muted">Berita Terpopuler</h3>
            <div v-if="pendingPopular" class="space-y-3">
              <div v-for="i in 6" :key="i" class="flex items-start gap-3">
                <USkeleton class="w-14 h-14 rounded" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-4/5" />
                  <USkeleton class="h-3 w-1/3" />
                </div>
              </div>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="p in popular"
                :key="p.id"
                class="flex items-start gap-3"
              >
                <img :src="getImageUrl(p.image_url, 'news')" :alt="p.title" class="w-14 h-14 rounded object-cover" />
                <div class="min-w-0">
                  <NuxtLink :to="`/berita/${p.slug}`" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                    {{ p.title }}
                  </NuxtLink>
                  <p class="text-xs text-muted">{{ formatDateShort(p.published_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </UPageAside>
    </template>

    <UPageBody>
      <ClientOnly>
        <template #fallback>
          <div class="space-y-6">
            <USkeleton class="w-full h-[320px] lg:h-[420px] rounded-xl" />
            <div class="flex gap-4">
               <USkeleton class="h-4 w-24" />
               <USkeleton class="h-4 w-32" />
            </div>
            <div class="space-y-4 mt-8">
               <USkeleton class="h-4 w-full" />
               <USkeleton class="h-4 w-full" />
               <USkeleton class="h-4 w-5/6" />
               <USkeleton class="h-4 w-full" />
            </div>
          </div>
        </template>

        <div v-if="pending" class="space-y-6">
          <USkeleton class="w-full h-[320px] lg:h-[420px] rounded-xl" />
          <div class="flex gap-4">
             <USkeleton class="h-4 w-24" />
             <USkeleton class="h-4 w-32" />
          </div>
          <div class="space-y-4 mt-8">
             <USkeleton class="h-4 w-full" />
             <USkeleton class="h-4 w-full" />
             <USkeleton class="h-4 w-5/6" />
             <USkeleton class="h-4 w-full" />
          </div>
        </div>
        
        <div v-else-if="item">
          <div class="overflow-hidden rounded-xl border border-default mb-8">
            <img :src="getImageUrl(item.image_url, 'banner')" :alt="item.title" class="w-full h-[320px] lg:h-[420px] object-cover" />
          </div>

          <div class="text-sm text-muted mb-6 flex items-center gap-4">
            <span>{{ item.author }}</span>
            <span>•</span>
            <span>{{ formatDate(item.published_at) }}</span>
            <span>•</span>
            <span>{{ item.views }} views</span>
          </div>

          <!-- Konten utama rich HTML -->
          <div class="prose prose-lg max-w-none">
            <div v-html="sanitizedContent"></div>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-12 pt-8 border-t border-default">
            <UBadge
              v-for="tag in item.tags"
              :key="tag"
              :label="`#${tag}`"
              variant="outline"
            />
          </div>

          <!-- Back Button -->
          <div class="mt-8">
            <UButton
              to="/berita"
              icon="i-lucide-arrow-left"
              variant="outline"
              size="lg"
            >
              Kembali ke Berita
            </UButton>
          </div>
        </div>
        
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <UIcon name="i-lucide-file-question" class="w-16 h-16 text-slate-300 mb-4" />
          <h2 class="text-2xl font-bold text-slate-800">Berita Tidak Ditemukan</h2>
          <p class="text-slate-500 mt-2 mb-6">Maaf, berita yang Anda cari mungkin telah dihapus atau URL salah.</p>
          <UButton to="/berita" size="lg">Kembali ke Daftar Berita</UButton>
        </div>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

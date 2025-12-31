<script setup lang="ts">
definePageMeta({
  layout: 'news'
})
/**
 * Detail Berita
 */

const route = useRoute()
const slug = route.params.slug as string

// Fetch berita detail
const { data: berita } = await useFetch(`/api/berita/${slug}`)

if (!berita.value?.data) {
  throw createError({
    statusCode: 404,
    message: 'Berita tidak ditemukan'
  })
}

const item = berita.value.data

// URL saat ini untuk share (hindari SSR ReferenceError)
const currentUrl = computed(() => (process.client ? window.location.href : ''))
const shareUrl = computed(() => encodeURIComponent(currentUrl.value || ''))
const shareToX = computed(() => `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${shareUrl.value}`)
const shareToFacebook = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${shareUrl.value}`)

function copyLink() {
  if (process.client) navigator.clipboard.writeText(currentUrl.value || '')
}

// SEO
useSeoMeta({
  title: `${item.title} - PDPI`,
  description: item.excerpt,
  ogTitle: item.title,
  ogDescription: item.excerpt,
  ogImage: item.image,
  articlePublishedTime: item.publishedAt,
  articleAuthor: [item.author]
})

// Sanitasi konten HTML tanpa dependensi eksternal (client-only friendly)
function sanitizeHtmlSSR(html: string) {
  // Hapus tag <script>
  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  // Netralisir kombinasi iframe sandbox berbahaya
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
      // Remove scripts
      doc.querySelectorAll('script').forEach(el => el.remove())
      // Fix iframe sandbox combinations
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

const sanitizedContent = computed(() => sanitizeHtml((item?.content || '').replace(/\n\n/g, '</p><p>')))
// Related posts fetch (kategori dan penulis)
const { data: relatedByCategory, pending: pendingCat } = await useFetch('/api/berita', {
  query: { category: item.category, limit: 6 }
})
const { data: relatedByAuthor, pending: pendingAuthor } = await useFetch('/api/berita', {
  query: { author: item.author, limit: 6 }
})
const related = computed(() => {
  const cat = relatedByCategory.value?.data?.items || []
  const auth = relatedByAuthor.value?.data?.items || []
  const merged = [...cat, ...auth]
  const unique = merged.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i)
  return unique.filter(x => x.slug !== item.slug).slice(0, 6)
})
const relatedPending = computed(() => pendingCat.value || pendingAuthor.value)

// Popular posts (berita terpopuler)
const { data: popularData, pending: pendingPopular } = await useFetch('/api/berita', {
  query: { sort: 'popular', limit: 6 }
})
const popular = computed(() => (popularData.value?.data?.items || []).filter(p => p.slug !== item.slug).slice(0, 6))
</script>

<template>
  <UPage>
    <UPageHeader
      :title="item.title"
      :description="item.excerpt"
    />

    <template #left>
      <UPageAside>
        <div class="sticky top-20 space-y-4">
          <h3 class="text-sm font-medium text-muted">Related Posts</h3>
          <div v-if="relatedPending" class="space-y-3">
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
              v-for="rb in related"
              :key="rb.id"
              class="flex items-start gap-3"
            >
              <img :src="rb.image" :alt="rb.title" class="w-14 h-14 rounded object-cover" />
              <div class="min-w-0">
                <NuxtLink :to="`/berita/${rb.slug}`" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                  {{ rb.title }}
                </NuxtLink>
                <p class="text-xs text-muted">{{ new Date(rb.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
              </div>
            </div>
          </div>
        </div>
      </UPageAside>
    </template>

    <template #right>
      <UPageAside>
        <div class="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
          <h3 class="text-sm font-medium text-muted">Bagikan</h3>
          <div class="flex gap-2">
            <UButton icon="i-lucide-share-2" color="neutral" variant="ghost" :to="shareToX" external aria-label="Bagikan ke X" />
            <UButton icon="i-simple-icons-facebook" color="neutral" variant="ghost" :to="shareToFacebook" external aria-label="Bagikan ke Facebook" />
            <UButton icon="i-lucide-link" color="neutral" variant="ghost" @click="copyLink" aria-label="Salin tautan" />
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
              <img :src="p.image" :alt="p.title" class="w-14 h-14 rounded object-cover" />
              <div class="min-w-0">
                <NuxtLink :to="`/berita/${p.slug}`" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                  {{ p.title }}
                </NuxtLink>
                <p class="text-xs text-muted">{{ new Date(p.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
              </div>
            </div>
          </div>
        </div>
      </UPageAside>
    </template>

    <UPageBody>
      <div class="overflow-hidden rounded-xl border border-default mb-8">
        <img :src="item.image" :alt="item.title" class="w-full h-[320px] lg:h-[420px] object-cover" />
      </div>

      <div class="text-sm text-muted mb-6 flex items-center gap-4">
        <span>{{ item.author }}</span>
        <span>•</span>
        <span>{{ new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
        <span>•</span>
        <span>{{ item.views }} views</span>
      </div>

      <!-- Konten utama rich HTML (disanitasi DOMPurify, client-only) -->
      <div class="prose prose-lg max-w-none">
        <ClientOnly>
          <div v-html="sanitizedContent"></div>
        </ClientOnly>
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
    </UPageBody>
  </UPage>
</template>

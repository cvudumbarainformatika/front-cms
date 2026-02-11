<script setup lang="ts">
definePageMeta({
  layout: 'news'
})

const route = useRoute()
const slug = route.params.slug as string
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

// Fetch agenda detail
const { data: res, pending, error } = await useAsyncData(
  `agenda-detail-${slug}`,
  () => $apiFetch(`/agenda/${slug}`)
)

if (error.value || !res.value?.data) {
  throw createError({ statusCode: 404, statusMessage: 'Agenda tidak ditemukan', fatal: true })
}

const item = computed(() => res.value?.data)

// SEO
useSeoMeta({
  title: () => `${item.value?.title || 'Agenda'} - Agenda PDPI`,
  description: () => item.value?.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
  ogTitle: () => item.value?.title || 'Agenda PDPI',
  ogDescription: () => item.value?.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
  ogImage: () => item.value ? getImageUrl(item.value.image_url, 'banner') : '',
  articlePublishedTime: () => item.value?.date
})

// Helper date format
const fmt = (d: string, opt: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', ...opt }).format(new Date(d))
const fmtLong = (d: string) => fmt(d, { day: 'numeric', month: 'long', year: 'numeric' })
const fmtShort = (d: string) => fmt(d, { day: 'numeric', month: 'short' })

// Sanitizer (SSR-safe + client enhancement)
function sanitizeHtmlSSR(html: string) {
  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  html = html.replace(/(<iframe[^>]*sandbox=\"[^\"]*)(allow-same-origin)([^\"]*\"[^>]*>)/gi, (m, p1, _m2, p3) => {
    if (/allow-scripts/i.test(m)) return `${p1}${p3}`.replace(/\s{2,}/g, ' ')
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
const sanitizedDesc = computed(() => sanitizeHtml((item.value?.description || '').replace(/\n\n/g, '</p><p>')))

// Share
const currentUrl = computed(() => (process.client ? window.location.href : ''))
const shareToX = computed(() => `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.value?.title || '')}&url=${encodeURIComponent(currentUrl.value)}`)
const shareToFacebook = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl.value)}`)
function copyLink () { if (process.client) navigator.clipboard.writeText(currentUrl.value || '') }

// Related & Latest
const { data: relatedData } = await useAsyncData(
  `agenda-related-${slug}`,
  () => $apiFetch('/agenda', {
    query: { type: item.value?.type, limit: 6 }
  }),
  {
    watch: [() => item.value?.type],
    server: false
  }
)
const related = computed(() => (relatedData.value?.data?.items || []).filter((a: any) => a.slug !== slug).slice(0, 6))

const { data: latestData } = await useAsyncData(
  'agenda-latest-sidebar',
  () => $apiFetch('/agenda', {
    query: { limit: 6 }
  }),
  {
    server: false
  }
)
const latest = computed(() => (latestData.value?.data?.items || []).filter((a: any) => a.slug !== slug).slice(0, 6))
</script>

<template>
  <UPage v-if="item">
    <UPageHeader :title="item.title" :description="item.description.replace(/<[^>]*>/g, '').slice(0, 100) + '...'" />

    <template #left>
      <UPageAside>
        <div class="sticky top-20 space-y-4">
          <h3 class="text-sm font-medium text-muted">Agenda Terkait</h3>
          <ClientOnly>
            <div class="space-y-3">
              <div v-for="ag in related" :key="ag.id" class="flex items-start gap-3">
                <NuxtImg
                  :src="getImageUrl(ag.image_url, 'thumbnail')"
                  :alt="ag.title"
                  class="w-14 h-14 rounded object-cover"
                  loading="lazy"
                  format="webp"
                />
                <div class="min-w-0">
                  <NuxtLink :to="`/agenda/${ag.slug}`" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                    {{ ag.title }}
                  </NuxtLink>
                  <p class="text-xs text-muted">{{ fmtShort(ag.date) }}</p>
                </div>
              </div>
            </div>
          </ClientOnly>
        </div>
      </UPageAside>
    </template>

    <UPageBody>
      <div class="overflow-hidden rounded-xl border border-default mb-8">
        <NuxtImg
          :src="getImageUrl(item.image_url, 'banner')"
          :alt="item.title"
          class="w-full h-[320px] lg:h-[420px] object-cover"
          loading="lazy"
          format="webp"
        />
      </div>

      <!-- Meta -->
      <div class="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar" />
          <span>
            {{ fmtLong(item.date) }}
            <template v-if="item.end_date"> - {{ fmtLong(item.end_date) }}</template>
          </span>
        </div>
        <div class="flex items-center gap-2">
          <UIcon :name="item.is_online ? 'i-lucide-video' : 'i-lucide-map-pin'" />
          <span>{{ item.location }}</span>
        </div>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-badge-check" />
          <UBadge :label="`${item.skp} SKP`" variant="subtle" />
        </div>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" />
          <span>Kuota: {{ item.quota }}</span>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 mb-6">
        <UBadge :label="item.type" variant="outline" />
        <UBadge v-if="item.is_online" label="Online" variant="outline" />
      </div>

      <div class="prose prose-lg max-w-none">
        <ClientOnly>
          <div v-html="sanitizedDesc"></div>
        </ClientOnly>
      </div>

      <div class="mt-8">
        <UButton v-if="item.registration_url" :to="item.registration_url" external size="lg" trailing-icon="i-lucide-external-link">
          Daftar Sekarang
        </UButton>
      </div>
    </UPageBody>

    <template #right>
      <UPageAside>
        <div class="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-auto pr-1">
          <h3 class="text-sm font-medium text-muted">Bagikan</h3>
          <div class="flex gap-2">
            <UButton icon="i-simple-icons-x" color="neutral" variant="ghost" :to="shareToX" external aria-label="Bagikan ke X" />
            <UButton icon="i-simple-icons-facebook" color="neutral" variant="ghost" :to="shareToFacebook" external aria-label="Bagikan ke Facebook" />
            <UButton icon="i-lucide-link" color="neutral" variant="ghost" @click="copyLink" aria-label="Salin tautan" />
          </div>

          <USeparator class="my-4" />

          <h3 class="text-sm font-medium text-muted">Agenda Terbaru</h3>
          <ClientOnly>
            <div class="space-y-3">
              <div v-for="ag in latest" :key="ag.id" class="flex items-start gap-3">
                <NuxtImg
                  :src="getImageUrl(ag.image_url, 'thumbnail')"
                  :alt="ag.title"
                  class="w-14 h-14 rounded object-cover"
                  loading="lazy"
                  format="webp"
                />
                <div class="min-w-0">
                  <NuxtLink :to="`/agenda/${ag.slug}`" class="text-xs leading-snug line-clamp-3 font-medium hover:underline">
                    {{ ag.title }}
                  </NuxtLink>
                  <p class="text-xs text-muted">{{ fmtShort(ag.date) }}</p>
                </div>
              </div>
            </div>
          </ClientOnly>
        </div>
      </UPageAside>
    </template>
  </UPage>
</template>

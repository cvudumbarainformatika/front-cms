<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useFetch } from '#imports'
import { useImageUrl } from '~/composables/useImageUrl'

definePageMeta({
  layout: 'news'
})

/**
 * Catch-all route for dynamic content
 * Displays content from Nuxt Content based on slugs created in menus
 */

const route = useRoute()
const { getImageUrl } = useImageUrl()

const slug = computed(() => {
  const path = route.params.slug
  return Array.isArray(path) ? path.join('/') : path
})

// Fetch dynamic content
const { data: dynContentRes, error } = await useFetch<any>(`/backend/dynamic-content/${slug.value}`, {
  key: `content-view-${slug.value}`
})

const dyn = computed(() => dynContentRes.value?.data || null)

const title = computed(() => dyn.value?.title || (slug.value as string))
const description = computed(() => dyn.value?.description || `Halaman ${slug.value}`)

useSeoMeta({
  title: title.value,
  ogTitle: title.value,
  description: description.value,
  ogDescription: description.value
})

</script>

<template>
  <UContainer class="py-12">
    <UPage v-if="slug">
      <template v-if="dyn && dyn.title">
        <UPageHeader
          :title="dyn.title"
          :description="dyn.description || ''"
        >
          <template v-if="dyn.badge?.label || dyn.date" #headline>
            <UBadge v-if="dyn.badge?.label" :label="dyn.badge.label" variant="subtle" />
            <span v-if="dyn.badge?.label && dyn.date" class="text-muted">&middot;</span>
            <ClientOnly>
              <time v-if="dyn.date" class="text-muted">{{ new Date(dyn.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</time>
            </ClientOnly>
          </template>

          <div v-if="dyn.authors && dyn.authors.length > 0" class="flex flex-wrap items-center gap-3 mt-4">
            <UButton
              v-for="(author, index) in dyn.authors"
              :key="index"
              :to="author.to || undefined"
              color="neutral"
              variant="subtle"
              target="_blank"
              size="sm"
            >
              <UAvatar
                v-if="author.avatar"
                v-bind="author.avatar"
                alt="Author avatar"
                size="2xs"
              />
              {{ author.name }}
            </UButton>
          </div>
        </UPageHeader>

        <UPage>
          <UPageBody>
            <div v-if="dyn.image?.src" class="overflow-hidden rounded-xl border border-default mb-8">
              <img :src="getImageUrl(dyn.image.src)" :alt="dyn.title" class="w-full h-[320px] lg:h-[420px] object-cover" />
            </div>

            <div class="dynamic-content prose prose-primary dark:prose-invert max-w-none">
              <template v-if="dyn.html">
                <div v-html="dyn.html"></div>
              </template>
              <template v-else-if="dyn.body">
                <div class="whitespace-pre-wrap">{{ dyn.body }}</div>
              </template>
              <template v-else>
                <p class="text-muted">Konten kosongan.</p>
              </template>
            </div>
          </UPageBody>
        </UPage>
      </template>
      <template v-else>
        <UPageHeader :title="slug.toUpperCase()" />
        <UPageBody>
          <div class="prose prose-primary dark:prose-invert max-w-none">
            <p class="text-muted italic">
              Halaman ini sedang dalam pengembangan atau konten belum tersedia untuk path: <code>/{{ slug }}</code>
            </p>
            <div class="mt-12 p-8 border border-dashed border-default rounded-xl text-center">
              <UIcon name="i-lucide-file-text" class="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 class="font-semibold text-highlighted">Konten Dinamisaaaan</h3>
              <p class="text-sm text-muted mt-2">
                Admin dapat mengelola isi halaman ini melalui menu Manajemen Konten.
              </p>
            </div>
          </div>
        </UPageBody>
      </template>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
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
</script>

<template>
  <div v-if="item">
    <!-- Hero -->
    <div class="relative h-[400px] overflow-hidden">
      <img
        :src="item.image"
        :alt="item.title"
        class="w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div class="absolute bottom-0 left-0 right-0 p-8">
        <div class="max-w-4xl mx-auto">
          <UBadge
            :label="item.category"
            size="lg"
            class="mb-4"
          />
          <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
            {{ item.title }}
          </h1>
          <div class="flex items-center gap-4 text-white/80">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user" />
              <span>{{ item.author }}</span>
            </div>
            <span>•</span>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" />
              <span>{{ new Date(item.publishedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) }}</span>
            </div>
            <span>•</span>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" />
              <span>{{ item.views }} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <UPageSection>
      <div class="max-w-3xl mx-auto">
        <!-- Excerpt -->
        <p class="text-xl text-muted italic mb-8 border-l-4 border-primary pl-4">
          {{ item.excerpt }}
        </p>

        <!-- Main Content -->
        <div class="prose prose-lg max-w-none">
          <div v-html="item.content.replace(/\n\n/g, '</p><p>')"></div>
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
    </UPageSection>
  </div>
</template>

<style scoped>
.prose :deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useFetch } from '#imports'

/**
 * Catch-all route for dynamic content
 * Displays content from Nuxt Content based on slugs created in menus
 */

const route = useRoute()
const slug = computed(() => {
  const path = route.params.slug
  return Array.isArray(path) ? path.join('/') : path
})

// Check if this slug is a dynamic menu
const { data: menuResponse } = await useFetch<any>('/api/menus')
const dynamicMenu = computed(() => {
  if (!menuResponse.value?.data) return null
  
  // Flatten menus to check slugs
  const flattenMenus = (items: any[]): any[] => {
    return items.reduce((acc, item) => {
      acc.push(item)
      if (item.children) acc.push(...flattenMenus(item.children))
      return acc
    }, [] as any[])
  }

  const allMenus = flattenMenus(menuResponse.value.data)
  return allMenus.find(m => m.isDynamic && (m.to === `/${slug.value}` || m.slug === slug.value))
})

const isDynamicPage = computed(() => !!dynamicMenu.value)
</script>

<template>
  <UContainer class="py-12">
    <UPage v-if="slug">
      <UPageHeader :title="slug.toUpperCase()" />
      
      <UPageBody>
        <div class="prose prose-primary dark:prose-invert max-w-none">
          <p class="text-muted italic">
            Halaman ini sedang dalam pengembangan atau konten belum tersedia untuk path: <code>/{{ slug }}</code>
          </p>
          
          <div class="mt-12 p-8 border border-dashed border-default rounded-xl text-center">
            <UIcon name="i-lucide-file-text" class="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 class="font-semibold text-highlighted">Konten Dinamis</h3>
            <p class="text-sm text-muted mt-2">
              Admin dapat mengelola isi halaman ini melalui menu Manajemen Konten.
            </p>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

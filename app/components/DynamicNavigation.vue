<script setup lang="ts">
/**
 * DynamicNavigation Component
 * Render menu dinamis dari API dengan support nested items
 * Menggunakan Nuxt UI UNavigationMenu
 */

import type { MenuItem } from '~/types/menu'

interface Props {
  items: MenuItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'link' | 'pill'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  variant: 'link'
})

const route = useRoute()

/**
 * Transform menu items ke format Nuxt UI NavigationMenu
 */
const navigationItems = computed(() => {
  return props.items.map(item => ({
    label: item.label,
    to: item.to,
    icon: item.icon,
    active: item.to ? route.path === item.to || route.path.startsWith(item.to + '/') : false,
    children: item.children?.map(child => ({
      label: child.label,
      to: child.to,
      icon: child.icon,
      active: child.to ? route.path === child.to : false
    }))
  }))
})
</script>

<template>
  <UNavigationMenu
    :items="navigationItems"
    :orientation="orientation"
    :variant="variant"
    :class="props.class"
  />
</template>

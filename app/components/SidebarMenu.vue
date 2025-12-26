<script setup lang="ts">
/**
 * SidebarMenu Component
 * Menu sidebar untuk dashboard dengan collapsible groups
 * Menggunakan Nuxt UI components
 */

import type { MenuItem } from '~/types/menu'

interface Props {
  items: MenuItem[]
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const route = useRoute()

/**
 * Check if menu item or any of its children is active
 */
const isActive = (item: MenuItem): boolean => {
  if (item.to && route.path === item.to) return true
  if (item.children) {
    return item.children.some(child => child.to && route.path === child.to)
  }
  return false
}

/**
 * Transform items for sidebar navigation
 */
const sidebarItems = computed(() => {
  return props.items
    .filter(item => item.isActive)
    .map(item => ({
      ...item,
      active: isActive(item),
      open: isActive(item) // Auto-expand if child is active
    }))
})

/**
 * Check if item is a divider/separator
 */
const isDivider = (item: MenuItem): boolean => {
  return !item.to && !item.children
}
</script>

<template>
  <nav class="flex flex-col gap-1">
    <template v-for="item in sidebarItems" :key="item.id">
      <!-- Divider/Section Label -->
      <div
        v-if="isDivider(item)"
        class="px-3 py-2 mt-4 first:mt-0"
      >
        <span
          v-if="!collapsed"
          class="text-xs font-semibold uppercase text-muted tracking-wider"
        >
          {{ item.label }}
        </span>
        <USeparator v-else />
      </div>

      <!-- Menu Item with Children (Collapsible) -->
      <UCollapsible
        v-else-if="item.children && item.children.length > 0"
        :default-open="item.open"
        class="group"
      >
        <UButton
          :icon="item.icon"
          :label="collapsed ? undefined : item.label"
          color="neutral"
          variant="ghost"
          block
          :class="[
            'justify-start',
            item.active ? 'bg-elevated' : ''
          ]"
          :ui="{
            trailingIcon: 'transition-transform duration-200 group-data-[state=open]:rotate-180'
          }"
          :trailing-icon="collapsed ? undefined : 'i-lucide-chevron-down'"
        />

        <template #content>
          <div class="pl-4 mt-1 flex flex-col gap-1">
            <UButton
              v-for="child in item.children"
              :key="child.id"
              :to="child.to"
              :icon="child.icon"
              :label="collapsed ? undefined : child.label"
              color="neutral"
              variant="ghost"
              block
              class="justify-start"
              :class="{ 'bg-elevated text-primary': child.to && route.path === child.to }"
            />
          </div>
        </template>
      </UCollapsible>

      <!-- Simple Menu Item -->
      <UButton
        v-else
        :to="item.to"
        :icon="item.icon"
        :label="collapsed ? undefined : item.label"
        color="neutral"
        variant="ghost"
        block
        class="justify-start"
        :class="{ 'bg-elevated text-primary': item.active }"
      />
    </template>
  </nav>
</template>

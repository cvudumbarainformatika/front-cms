<script setup lang="ts">
/**
 * DashboardSidebar Component
 * Sidebar untuk dashboard dengan menu dinamis dan role-based filtering
 */

import type { MenuItem } from '~/types/menu'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const { data: sidebarMenus, status } = await useMenu('sidebar')
const { userRole } = useAuth()


/**
 * Filter menu berdasarkan role user
 */
const filteredMenus = computed<MenuItem[]>(() => {
  if (!sidebarMenus.value) return []

  const role = userRole.value

  const filterByRole = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => item.isActive && item.roles.includes(role))
      .map(item => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined
      }))
  }

  return filterByRole(sidebarMenus.value)
})

// console.log(filteredMenus);

</script>

<template>
  <aside
    :class="[
      'h-full border-r border-default bg-default transition-all duration-300',
      props.collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Logo -->
    <div class="h-16 border-b border-default flex items-center justify-center px-4">
      <NuxtLink to="/dashboard">
        <OrganizationLogo
          :size="collapsed ? 'sm' : 'md'"
          :show-text="!collapsed"
          :variant="collapsed ? 'icon' : 'full'"
        />
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <div class="p-3 overflow-y-auto h-[calc(100vh-4rem)]">
      <template v-if="status === 'success'">
        <!-- <ClientOnly> -->
        <SidebarMenu
          :items="filteredMenus"
          :collapsed="collapsed"
        />
        <!-- </ClientOnly> -->
      </template>

      <template v-else>
        <div class="flex flex-col gap-2">
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-3/4" />
        </div>
      </template>
    </div>
  </aside>
</template>

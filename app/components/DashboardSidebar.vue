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
      .filter(item => (item.is_active || (item as any).isActive) && item.roles.includes(role))
      .map(item => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined
      }))
  }

  return filterByRole(sidebarMenus.value)
})

const { isAdmin } = useAuth()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
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
        <SidebarMenu
          v-if="isMounted"
          :items="filteredMenus"
          :collapsed="collapsed"
        />

        <!-- Manual Admin Add-on: Broadcast Monitoring -->
        <div v-if="isMounted && isAdmin" class="mt-4 pt-4 border-t border-slate-200 dark:border-gray-800">
          <p v-if="!collapsed" class="px-3 mb-2 text-xs font-semibold uppercase text-muted tracking-wider">Monitoring</p>
          <UButton
            to="/dashboard/admin/broadcast-logs"
            icon="i-heroicons-chart-bar"
            label="Laporan Email"
            color="neutral"
            variant="ghost"
            block
            :class="[collapsed ? 'justify-center' : 'justify-start']"
            :ui="{ leadingIcon: 'text-primary' }"
          />
        </div>
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

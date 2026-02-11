<script setup lang="ts">
/**
 * Dashboard Layout
 * Layout untuk dashboard pengurus dengan sidebar dan header
 * Role-based access dengan collapsible sidebar
 */

// Desktop sidebar collapsed state
const sidebarCollapsed = ref(false)

// Mobile sidebar open state
const mobileSidebarOpen = ref(false)

const toggleSidebar = () => {
  // Check if mobile or desktop
  if (window.innerWidth < 1024) {
    // Mobile: toggle overlay sidebar
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    // Desktop: toggle collapse
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

// Close mobile sidebar when clicking outside
const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

// Persist desktop sidebar state
const savedState = useCookie('sidebar-collapsed')
onMounted(() => {
  if (savedState.value !== undefined) {
    sidebarCollapsed.value = savedState.value === 'true'
  }
})

watch(sidebarCollapsed, (value) => {
  savedState.value = value.toString()
})
</script>

<template>
  <div class="min-h-screen flex bg-slate-100 dark:bg-gray-950">
    <!-- Mobile Sidebar Overlay Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileSidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
        @click="closeMobileSidebar"
      />
    </Transition>

    <!-- Mobile Sidebar (Overlay) -->
    <Transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="mobileSidebarOpen"
        class="fixed left-0 top-0 h-screen z-40 lg:hidden"
      >
        <DashboardSidebar :collapsed="false" />
      </div>
    </Transition>

    <!-- Desktop Sidebar -->
    <DashboardSidebar
      :collapsed="sidebarCollapsed"
      class="fixed left-0 top-0 h-screen z-40 hidden lg:block"
    />

    <!-- Main Content Area -->
    <div
      :class="[
        'flex-1 flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      ]"
    >
      <!-- Header -->
      <DashboardHeader
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- Page Content -->
      <main class="flex-1 p-6 lg:p-10">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-default py-4 px-6 text-center text-sm text-muted">
        © {{ new Date().getFullYear() }} PDPI - Perhimpunan Dokter Paru Indonesia
      </footer>
    </div>
  </div>
</template>

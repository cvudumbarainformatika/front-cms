<script setup lang="ts">
/**
 * Dashboard Layout
 * Layout untuk dashboard pengurus dengan sidebar dan header
 * Role-based access dengan collapsible sidebar
 */

// Sidebar collapsed state
const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
  
// Persist sidebar state
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
  <div class="min-h-screen flex bg-muted">
    <!-- Sidebar -->
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
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-default py-4 px-6 text-center text-sm text-muted">
        © {{ new Date().getFullYear() }} PDPI - Perhimpunan Dokter Paru Indonesia
      </footer>
    </div>
  </div>
</template>

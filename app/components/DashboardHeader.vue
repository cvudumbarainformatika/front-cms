<script setup lang="ts">
/**
 * DashboardHeader Component
 * Header untuk dashboard dengan user info dan quick actions
 */

const { user, logout } = useAuth()
const { hasMinimumRole } = useRole()

interface Props {
  sidebarCollapsed?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggleSidebar: []
}>()
</script>

<template>
  <header class="h-16 border-b border-default bg-default flex items-center justify-between px-4 lg:px-6">
    <!-- Left: Toggle & Breadcrumb -->
    <div class="flex items-center gap-4">
      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        @click="emit('toggleSidebar')"
      />

      <UBreadcrumb
        :items="[
          { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-home' }
        ]"
        class="hidden md:flex"
      />
    </div>

    <!-- Right: Actions & User -->
    <div class="flex items-center gap-2">
      <!-- Notifications -->
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        class="relative"
      >
        <span class="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center">
          3
        </span>
      </UButton>

      <!-- Quick Actions (Admin Only) -->
      <UDropdownMenu
        v-if="hasMinimumRole('admin_cabang')"
        :items="[
          [{
            label: 'Tambah Berita',
            icon: 'i-lucide-file-plus',
            to: '/dashboard/admin/konten/berita/tambah'
          }, {
            label: 'Tambah Agenda',
            icon: 'i-lucide-calendar-plus',
            to: '/dashboard/admin/konten/agenda/tambah'
          }]
        ]"
      >
        <UButton
          icon="i-lucide-plus"
          color="primary"
          variant="soft"
        />
      </UDropdownMenu>

      <UColorModeButton />

      <!-- User Menu -->
      <UDropdownMenu
        :items="[
          [{
            label: user?.name || 'User',
            slot: 'header',
            disabled: true
          }],
          [{
            label: 'Profil Saya',
            icon: 'i-lucide-user',
            to: '/dashboard/profil'
          }, {
            label: 'Pengaturan',
            icon: 'i-lucide-settings',
            to: '/dashboard/pengaturan'
          }],
          [{
            label: 'Kembali ke Beranda',
            icon: 'i-lucide-home',
            to: '/'
          }],
          [{
            label: 'Keluar',
            icon: 'i-lucide-log-out',
            click: logout
          }]
        ]"
      >
        <UButton
          color="neutral"
          variant="ghost"
          class="gap-2"
        >
          <UAvatar
            :src="user?.avatar"
            :alt="user?.name"
            size="xs"
          />
          <span class="hidden lg:block text-sm font-medium">
            {{ user?.name }}
          </span>
          <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

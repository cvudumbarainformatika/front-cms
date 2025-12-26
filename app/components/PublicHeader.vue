<script setup lang="ts">
/**
 * PublicHeader Component
 * Header dinamis untuk halaman publik dengan menu dari API
 * Menggunakan Nuxt UI UHeader
 */

const { data: headerMenus, status } = await useMenu('header')
const { isAuthenticated, user } = useAuth()

const route = useRoute()

/**
 * Transform menu items untuk UNavigationMenu
 */
const navigationItems = computed(() => {
  if (!headerMenus.value) return []

  return headerMenus.value.map(item => ({
    label: item.label,
    to: item.to,
    icon: item.icon,
    active: item.to ? route.path === item.to || route.path.startsWith(item.to + '/') : false,
    children: item.children?.map(child => ({
      label: child.label,
      to: child.to,
      icon: child.icon
    }))
  }))
})
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="flex items-center">
        <OrganizationLogo size="md" />
      </NuxtLink>
    </template>

    <!-- Desktop Navigation -->
    <UNavigationMenu
      v-if="status === 'success'"
      :items="navigationItems"
      variant="link"
    />
    <USkeleton v-else class="h-8 w-64" />

    <template #right>
      <UColorModeButton />

      <!-- Guest Buttons -->
      <template v-if="!isAuthenticated">
        <UTooltip text="Masuk">
          <UButton
            icon="i-lucide-log-in"
            color="neutral"
            variant="ghost"
            to="/login"
            aria-label="Masuk"
          />
        </UTooltip>

        <UTooltip text="Daftar Anggota">
          <UButton
            icon="i-lucide-user-plus"
            color="neutral"
            variant="ghost"
            to="/daftar"
            aria-label="Daftar"
          />
        </UTooltip>
      </template>

      <!-- Authenticated User Menu -->
      <template v-else>
        <UDropdownMenu
          :items="[
            [{
              label: user?.name || 'User',
              slot: 'header',
              disabled: true
            }],
            [{
              label: 'Dashboard',
              icon: 'i-lucide-layout-dashboard',
              to: '/dashboard'
            }, {
              label: 'Profil Saya',
              icon: 'i-lucide-user',
              to: '/dashboard/profil'
            }],
            [{
              label: 'Keluar',
              icon: 'i-lucide-log-out',
              click: () => useAuth().logout()
            }]
          ]"
        >
          <UButton
            color="neutral"
            variant="ghost"
            class="p-1"
          >
            <UAvatar
              :src="user?.avatar"
              :alt="user?.name"
              size="sm"
            />
          </UButton>
        </UDropdownMenu>
      </template>
    </template>

    <!-- Mobile Navigation -->
    <template #body>
      <UNavigationMenu
        v-if="status === 'success'"
        :items="navigationItems"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <template v-if="!isAuthenticated">
        <UButton
          label="Masuk"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton
          label="Daftar"
          color="primary"
          to="/daftar"
          block
        />
      </template>
      <template v-else>
        <UButton
          label="Dashboard"
          color="primary"
          to="/dashboard"
          block
          class="mb-3"
        />
        <UButton
          label="Keluar"
          color="neutral"
          variant="subtle"
          block
          @click="useAuth().logout()"
        />
      </template>
    </template>
  </UHeader>
</template>

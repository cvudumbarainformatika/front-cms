<script setup lang="ts">
/**
 * Landing Header Component
 * Floating pill navbar dengan dynamic menu dan auth logic
 */

const { data: headerMenus } = await useMenu('header')
const { isAuthenticated, user, logout } = useAuth()
const { getImageUrl } = useImageUrl()

// Mobile menu state
const isMenuOpen = ref(false)

// Transform menu items for UNavigationMenu
const navigationItems = computed(() => {
  if (!headerMenus.value) return []

  return headerMenus.value.map(item => ({
    label: item.label,
    to: item.to,
    children: item.children?.map(child => ({
      label: child.label,
      to: child.to,
      icon: child.icon
    }))
  }))
})

</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 w-full p-4 md:p-6">
    <nav class="mx-auto max-w-7xl rounded-full backdrop-blur-xl border shadow-lg px-6 py-3 flex items-center justify-between transition-all duration-300 bg-white/80 border-white/20 shadow-slate-200/50">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <!-- <div class="bg-primary-500 p-1.5 rounded-lg group-hover:bg-primary-600 transition-colors text-white">
          <UIcon name="i-lucide-activity" class="w-6 h-6 stroke-[1.5]" />
        </div>
        <span class="text-xl font-semibold tracking-tight text-slate-900">Respira<span class="text-primary-600">Org</span></span> -->
        <OrganizationLogo size="md" />
      </NuxtLink>

      <!-- Menu (Desktop) - UNavigationMenu -->
      <div class="hidden md:flex items-center justify-center flex-1 mx-4">
        <UNavigationMenu 
          :items="navigationItems" 
          variant="link"
          :ui="{
            wrapper: 'gap-1',
            link: {
              base: 'px-3 py-2 text-sm font-medium transition-colors hover:text-primary-600',
              active: 'text-primary-600 font-bold',
              inactive: 'text-slate-600'
            }
          }"
        />
      </div>

      <!-- CTA & User Menu (Preserved Auth Logic) -->
      <div class="hidden md:flex items-center gap-3">
        <!-- Guest -->
        <template v-if="!isAuthenticated">
          <UTooltip text="Masuk">
            <UButton
              icon="i-lucide-log-in"
              color="neutral"
              variant="ghost"
              to="/login"
              aria-label="Masuk"
              class="text-slate-600 hover:text-primary-600 hover:bg-primary-50"
            />
          </UTooltip>

          <UTooltip text="Daftar Anggota">
            <UButton
              to="/daftar"
              class="rounded-full transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
              color="primary"
              icon="i-lucide-user-plus"
            >
              Daftar
            </UButton>
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
                onSelect: async () => await logout()
              }]
            ]"
          >
            <UButton
              color="white"
              variant="ghost"
              class="p-1 rounded-full ring-1 ring-slate-200"
            >
              <UAvatar
                :src="getImageUrl(user?.avatar)"
                :alt="user?.name"
                size="sm"
              />
            </UButton>
          </UDropdownMenu>
        </template>
      </div>

      <!-- Mobile Menu (UDrawer) - Hidden on desktop -->
      <UDrawer v-model:open="isMenuOpen" side="right" class="md:hidden">
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          square
          aria-label="Open Menu"
        />

        <template #content>
          <div class="flex flex-col h-full">
            <!-- Header -->
            <div class="p-4 border-b border-slate-200">
              <NuxtLink to="/" class="flex items-center gap-2" @click="isMenuOpen = false">
                <div class="bg-primary-500 p-1.5 rounded-lg text-white">
                  <UIcon name="i-lucide-activity" class="w-5 h-5 stroke-[1.5]" />
                </div>
                <span class="text-lg font-semibold tracking-tight text-slate-900">Respira<span class="text-primary-600">Org</span></span>
              </NuxtLink>
            </div>

            <!-- Mobile Navigation Menu (Vertical) -->
            <div class="flex-1 overflow-y-auto p-4">
              <UNavigationMenu 
                :items="navigationItems"
                orientation="vertical"
                variant="link"
                :ui="{
                  wrapper: 'flex flex-col gap-1',
                  link: {
                    base: 'w-full px-3 py-2.5 text-base font-medium transition-colors hover:text-primary-600 hover:bg-primary-50 rounded-lg',
                    active: 'text-primary-600 bg-primary-50 font-bold',
                    inactive: 'text-slate-700'
                  }
                }"
                @click="isMenuOpen = false"
              />

              <UDivider class="my-4" />

              <!-- Mobile Auth Buttons -->
              <div class="space-y-2">
                <template v-if="!isAuthenticated">
                  <UButton
                    to="/login"
                    block
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-log-in"
                    @click="isMenuOpen = false"
                  >
                    Masuk
                  </UButton>
                  <UButton
                    to="/daftar"
                    block
                    color="primary"
                    icon="i-lucide-user-plus"
                    @click="isMenuOpen = false"
                  >
                    Daftar Anggota
                  </UButton>
                </template>

                <template v-else>
                  <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-3">
                    <UAvatar
                      :src="getImageUrl(user?.avatar)"
                      :alt="user?.name"
                      size="md"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-slate-900 truncate">{{ user?.name }}</p>
                      <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
                    </div>
                  </div>

                  <UButton
                    to="/dashboard"
                    block
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-layout-dashboard"
                    @click="isMenuOpen = false"
                  >
                    Dashboard
                  </UButton>
                  <UButton
                    to="/dashboard/profil"
                    block
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-user"
                    @click="isMenuOpen = false"
                  >
                    Profil Saya
                  </UButton>
                  <UButton
                    block
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-log-out"
                    @click="async () => { await logout(); isMenuOpen = false }"
                  >
                    Keluar
                  </UButton>
                </template>
              </div>
            </div>
          </div>
        </template>
      </UDrawer>
    </nav>
  </header>
</template>

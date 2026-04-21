<script setup lang="ts">
/**
 * Landing Header Component
 * Floating pill navbar dengan dynamic menu dan auth logic
 */

const { data: headerMenus, status } = useMenu('header')
const pending = computed(() => status.value === 'pending')
const { isAuthenticated, user, logout } = useAuth()
const { getImageUrl } = useImageUrl()
const route = useRoute()

// Mobile menu state
const isMenuOpen = ref(false)

// Filter menus by user role
const filteredMenus = computed(() => {
  if (!headerMenus.value || pending.value) return []

  const userRole = user.value?.role || 'public'
  return filterMenusByRole(headerMenus.value, userRole)
})

// Transform menu items for UNavigationMenu
const navigationItems = computed(() => {
  return filteredMenus.value.map(item => ({
    label: item.label,
    to: item.children?.length ? undefined : item.to,
    active: item.to ? route.path === item.to || route.path.startsWith(item.to + '/') : false,
    children: item.children?.length ? item.children.map(child => ({
      label: child.label,
      to: child.to
    })) : undefined
  }))
})

</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 w-full p-4 md:p-6 translate-z-0">
    <nav class="mx-auto max-w-7xl rounded-full border-2 shadow-2xl px-6 py-3 flex items-center justify-between transition-all duration-300 bg-white border-primary-600 shadow-primary-900/10">
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
            list: 'gap-1',
            link: 'px-3 py-2 text-sm font-medium transition-colors hover:text-primary-600'
          }"
        />
      </div>

      <!-- CTA & User Menu (Preserved Auth Logic) -->
      <div class="hidden md:flex items-center gap-3">
        <ClientOnly>
          <!-- Guest -->
          <template v-if="!isAuthenticated">
            <UButton
              to="/login"
              label="Masuk"
              icon="i-lucide-log-in"
              color="neutral"
              variant="ghost"
              class="bg-white text-slate-900 rounded-full px-6 py-2 shadow-lg shadow-slate-200/50 hover:shadow-primary-500/20 hover:text-primary-600 transition-all duration-300 font-medium ring-1 ring-slate-100"
            />


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
                color="neutral"
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
        </ClientOnly>
      </div>

      <!-- Mobile Menu (UDrawer) - Hidden on desktop -->
      <UDrawer v-model:open="isMenuOpen" side="right" class="md:hidden">
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          square
          aria-label="Open Menu"
          class="hover:bg-primary-50 hover:text-primary-600 transition-colors"
        />

        <template #content>
          <div class="flex flex-col h-full bg-white/90 backdrop-blur-2xl relative overflow-hidden">
            <!-- Background mesh for extra wow -->
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Header -->
            <div class="p-6 border-b border-slate-100/50 flex items-center justify-between relative z-10">
              <NuxtLink to="/" class="flex items-center gap-3 group" @click="isMenuOpen = false">
                <OrganizationLogo size="md" />
              </NuxtLink>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                @click="isMenuOpen = false"
                class="rounded-full hover:bg-slate-100"
              />
            </div>

            <!-- Mobile Navigation Menu (Vertical) -->
            <div class="flex-1 overflow-y-auto p-6 relative z-10">
              <div class="space-y-2">
                <NuxtLink
                  v-for="item in navigationItems"
                  :key="item.label"
                  :to="item.to"
                  class="flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-300 group relative overflow-hidden active:scale-95"
                  :class="{ 'text-primary-600 bg-primary-50 border border-primary-100/50': item.active }"
                  @click="isMenuOpen = false"
                >
                  <span class="font-bold text-base tracking-tight">{{ item.label }}</span>
                  <UIcon name="i-lucide-chevron-right" class="ml-auto w-5 h-5 opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </NuxtLink>
              </div>

              <USeparator class="my-8 opacity-50" />

              <!-- Mobile Auth Buttons -->
              <div class="space-y-4">
                <ClientOnly>
                  <template v-if="!isAuthenticated">
                    <UButton
                      to="/login"
                      block
                      size="xl"
                      color="primary"
                      icon="i-lucide-log-in"
                      class="rounded-2xl py-4 font-bold shadow-xl shadow-primary-500/20"
                      @click="isMenuOpen = false"
                    >
                      MASUK SEKARANG
                    </UButton>
                  </template>

                  <template v-else>
                    <div class="p-5 bg-linear-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm mb-4 relative overflow-hidden group">
                      <div class="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div class="flex items-center gap-4 relative z-10">
                        <UAvatar
                          :src="getImageUrl(user?.avatar)"
                          :alt="user?.name"
                          size="lg"
                          class="ring-2 ring-primary-100"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-extrabold text-slate-900 truncate tracking-tight">{{ user?.name }}</p>
                          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{{ user?.role || 'Member' }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-3">
                      <UButton
                        to="/dashboard"
                        block
                        color="neutral"
                        variant="soft"
                        icon="i-lucide-layout-dashboard"
                        class="rounded-xl py-3.5 font-bold justify-start px-5"
                        @click="isMenuOpen = false"
                      >
                        Dashboard
                      </UButton>
                      <UButton
                        to="/dashboard/profil"
                        block
                        color="neutral"
                        variant="soft"
                        icon="i-lucide-user"
                        class="rounded-xl py-3.5 font-bold justify-start px-5"
                        @click="isMenuOpen = false"
                      >
                        Profil Saya
                      </UButton>
                      <UButton
                        block
                        color="error"
                        variant="ghost"
                        icon="i-lucide-log-out"
                        class="rounded-xl py-3.5 font-bold justify-start px-5 text-red-500 hover:bg-red-50 hover:text-red-600"
                        @click="async () => { await logout(); isMenuOpen = false }"
                      >
                        Keluar
                      </UButton>
                    </div>
                  </template>
                </ClientOnly>
              </div>
            </div>
          </div>
        </template>
      </UDrawer>
    </nav>
  </header>
</template>

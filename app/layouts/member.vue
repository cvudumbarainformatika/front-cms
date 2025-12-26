<script setup lang="ts">
/**
 * Member Layout
 * Layout untuk portal anggota (authenticated members)
 * Dengan sidebar navigasi dan protected route
 */

const { isAuthenticated } = useAuth()

// Redirect ke login jika belum authenticated
watch(isAuthenticated, (value) => {
  if (!value) {
    navigateTo('/login')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <PublicHeader />

    <UMain class="flex-1">
      <UContainer>
        <div class="py-8">
          <slot />
        </div>
      </UContainer>
    </UMain>

    <PublicFooter />
  </div>
</template>

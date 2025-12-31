<script setup lang="ts">
// Layout untuk halaman berita / artikel publik dengan struktur seperti Docs
</script>

<template>
  <div>
    <LandingHeader />

    <UMain class="mt-24">
      <UContainer>
        <slot />
      </UContainer>
    </UMain>

    <LandingFooter />
  </div>
</template>

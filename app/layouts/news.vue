<script setup lang="ts">
// Layout untuk halaman berita / artikel publik dengan struktur seperti Docs
</script>

<template>
  <div>
    <PublicHeader />

    <UMain>
      <UContainer>
        <slot />
      </UContainer>
    </UMain>

    <PublicFooter />
  </div>
</template>

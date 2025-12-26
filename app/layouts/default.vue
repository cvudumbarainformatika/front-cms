<template>
  <!--
    Default Layout - Updated
    Layout untuk halaman publik dengan menu dinamis
  -->
  <div class="min-h-screen flex flex-col">
    <PublicHeader />

    <UMain class="flex-1">
      <slot />
    </UMain>

    <PublicFooter />
  </div>
</template>

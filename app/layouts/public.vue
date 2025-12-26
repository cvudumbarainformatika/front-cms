<template>
  <!--
    Public Layout
    Layout untuk halaman publik (non-authenticated)
    SSR-friendly dengan menu dinamis
  -->
  <div class="min-h-screen flex flex-col">
    <PublicHeader />

    <UMain class="flex-1">
      <slot />
    </UMain>

    <PublicFooter />
  </div>
</template>

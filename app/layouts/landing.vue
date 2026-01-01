<script setup lang="ts">
/**
 * Landing Page Layout
 * Simple layout dengan LandingHeader dan LandingFooter components
 */
</script>

<template>
  <div class="antialiased selection:bg-primary-200 selection:text-primary-900 bg-slate-50 text-slate-600 font-sans min-h-screen flex flex-col">
    <LandingHeader />
    
    <main class="flex-1">
      <slot />
    </main>
    
    <LandingFooter />
    <ScrollToTop />
  </div>
</template>

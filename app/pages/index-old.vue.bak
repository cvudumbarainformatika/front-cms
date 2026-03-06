<script setup lang="ts">
/**
 * Homepage - Redesigned with Modular Components
 * Simple composition dari section components
 */

definePageMeta({
  layout: 'landing'
})

useHead({
  title: 'Indonesian Respiratory Association - Official Portal',
  style: [
    {
      children: `
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes pulse-ring {
            0% { transform: scale(0.33); opacity: 1; }
            80%, 100% { transform: scale(1); opacity: 0; }
        }
        .animate-pulse-ring::before {
            content: '';
            position: absolute;
            left: 0; top: 0;
            height: 100%; width: 100%;
            border-radius: 50%;
            background-color: #10b981;
            animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        /* Scroll Reveal Animations */
        .reveal-hidden {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Stagger delay for cards */
        .reveal-hidden:nth-child(1) { transition-delay: 0ms; }
        .reveal-hidden:nth-child(2) { transition-delay: 100ms; }
        .reveal-hidden:nth-child(3) { transition-delay: 200ms; }
        .reveal-hidden:nth-child(4) { transition-delay: 300ms; }
        .reveal-hidden:nth-child(5) { transition-delay: 400ms; }
        .reveal-hidden:nth-child(6) { transition-delay: 500ms; }
      `
    }
  ],
  link: [
    { href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap', rel: 'stylesheet' }
  ]
})
</script>

<template>
  <div>
    <LandingHeroSection />
    <!-- <LandingProfilSection /> -->
    <LandingAgendaSection />
    <LandingPublikasiSection />
    <!-- <LandingEdukasiSection /> -->
    <LandingDirekoriSection />
  </div>
</template>

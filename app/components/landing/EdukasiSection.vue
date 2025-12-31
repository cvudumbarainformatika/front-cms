<script setup lang="ts">
/**
 * Edukasi Masyarakat Section
 * 3 article cards dengan images
 */
</script>

<template>
  <UPageSection id="edukasi" class="py-24 bg-slate-50">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 text-slate-900">
        Edukasi <span class="text-primary-600">Masyarakat</span>
      </h2>
      <p class="text-lg text-slate-500 font-medium">
        Artikel terpercaya seputar kesehatan paru dan pernapasan untuk awam.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Edu Card 1 -->
      <article class="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
        <div class="rounded-2xl overflow-hidden h-48 bg-slate-100 relative">
          <img src="https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=600" alt="Masker" class="w-full h-full object-cover">
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-3 text-slate-900">Pentingnya Masker di Era Polusi Tinggi</h3>
          <p class="text-slate-500 mb-4 text-sm leading-relaxed">Bagaimana memilih masker yang tepat untuk melindungi paru-paru Anda dari PM2.5...</p>
          <NuxtLink to="#" class="text-primary-600 font-semibold text-sm hover:underline">Baca Artikel →</NuxtLink>
        </div>
      </article>

      <!-- Edu Card 2 -->
      <article class="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
        <div class="rounded-2xl overflow-hidden h-48 bg-slate-100 relative">
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600" alt="Lari" class="w-full h-full object-cover">
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-3 text-slate-900">Olahraga Aman untuk Penderita Asma</h3>
          <p class="text-slate-500 mb-4 text-sm leading-relaxed">Tips berolahraga agar tetap bugar tanpa memicu serangan asma mendadak...</p>
          <NuxtLink to="#" class="text-primary-600 font-semibold text-sm hover:underline">Baca Artikel →</NuxtLink>
        </div>
      </article>

      <!-- Edu Card 3 -->
      <article class="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
        <div class="rounded-2xl overflow-hidden h-48 bg-slate-100 relative">
          <img src="https://plus.unsplash.com/premium_photo-1661766569022-1b7f918ac3f3?auto=format&fit=crop&q=80&w=600" alt="Rokok" class="w-full h-full object-cover">
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-3 text-slate-900">Bahaya Vape vs Rokok Konvensional</h3>
          <p class="text-slate-500 mb-4 text-sm leading-relaxed">Mengupas fakta medis mengenai dampak penggunaan rokok elektrik terhadap alveolus...</p>
          <NuxtLink to="#" class="text-primary-600 font-semibold text-sm hover:underline">Baca Artikel →</NuxtLink>
        </div>
      </article>
    </div>
  </UPageSection>
</template>

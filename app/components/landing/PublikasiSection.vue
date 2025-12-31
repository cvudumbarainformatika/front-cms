<script setup lang="ts">
/**
 * Berita & Publikasi Section
 * Grid dengan 1 highlighted article + 2 small articles
 */
</script>

<template>
  <UPageSection id="publikasi" class="py-24">
    <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
      <div>
        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider bg-primary-50 text-primary-600 border border-primary-100">Updates</span>
        <h2 class="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
          Berita & <span class="text-primary-500">Publikasi Ilmiah</span>
        </h2>
      </div>
      <NuxtLink to="#" class="group flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700 transition-colors">
        Lihat Semua
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Highlighted Article -->
      <div class="lg:col-span-2 group cursor-pointer">
        <div class="relative rounded-3xl overflow-hidden mb-4 aspect-video shadow-sm">
          <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1000" alt="Research" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
          <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm text-primary-700">Jurnal Terbaru</div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-3 text-sm text-slate-400 font-medium">
            <span class="flex items-center gap-1"><UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" /> 12 Okt 2023</span>
            <span>•</span>
            <span>Vol 24, No 2</span>
          </div>
          <h3 class="text-2xl font-semibold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">Studi Klinis: Efektivitas Bronkodilator Generasi Baru pada Pasien Asma Berat</h3>
          <p class="text-slate-500 line-clamp-2">Penelitian multicenter yang melibatkan 5 rumah sakit besar di Indonesia menunjukkan hasil positif signifikan...</p>
        </div>
      </div>

      <!-- Small Article 1 -->
      <div class="group cursor-pointer">
        <div class="relative rounded-3xl overflow-hidden mb-4 aspect-[4/3] shadow-sm">
          <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg" alt="News" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
          <div class="absolute top-4 left-4 bg-primary-100/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm text-primary-700">Berita</div>
        </div>
        <div class="space-y-2">
          <span class="text-xs font-medium text-slate-400">10 Okt 2023</span>
          <h3 class="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">Pelantikan Pengurus Baru Periode 2024-2029</h3>
        </div>
      </div>

      <!-- Small Article 2 -->
      <div class="group cursor-pointer">
        <div class="relative rounded-3xl overflow-hidden mb-4 aspect-[4/3] shadow-sm">
          <img src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=500" alt="Guideline" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
          <div class="absolute top-4 left-4 bg-blue-100/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm text-blue-700">Pedoman</div>
        </div>
        <div class="space-y-2">
          <span class="text-xs font-medium text-slate-400">05 Okt 2023</span>
          <h3 class="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">Rilis Pedoman Penatalaksanaan Tuberkulosis Terkini</h3>
        </div>
      </div>
    </div>
  </UPageSection>
</template>

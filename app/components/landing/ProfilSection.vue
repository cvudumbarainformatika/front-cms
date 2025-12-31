<script setup lang="ts">
/**
 * Profil Organisasi Section
 * 3 cards: Visi & Misi, Sejarah, Pengurus & AD/ART
 */
</script>

<template>
  <UPageSection id="profil" class="py-24 bg-slate-50">
    <div class="text-center max-w-2xl mx-auto mb-20">
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 text-slate-900">
        Profil <span class="text-primary-600">Organisasi</span>
      </h2>
      <p class="text-lg text-slate-500 font-medium">
        Mengenal lebih dekat visi, misi, dan struktur kepengurusan organisasi kami.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Visi & Misi -->
      <div class="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 relative overflow-hidden">
        <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-target" class="w-6 h-6" />
        </div>
        <h3 class="text-2xl font-semibold mb-3 tracking-tight text-slate-900">Visi & Misi</h3>
        <p class="text-slate-500 leading-relaxed mb-4">Menjadi organisasi profesi terdepan dalam meningkatkan kesehatan respirasi di tingkat nasional dan internasional melalui riset dan pelayanan.</p>
        <NuxtLink to="#" class="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700">
          Baca Selengkapnya <UIcon name="i-lucide-chevron-right" class="ml-1 w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Sejarah -->
      <div class="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 relative overflow-hidden">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-history" class="w-6 h-6" />
        </div>
        <h3 class="text-2xl font-semibold mb-3 tracking-tight text-slate-900">Sejarah</h3>
        <p class="text-slate-500 leading-relaxed mb-4">Didirikan pada tahun 1980, kami telah berkembang dari kelompok diskusi kecil menjadi asosiasi nasional dengan ribuan anggota.</p>
        <NuxtLink to="#" class="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700">
          Lihat Timeline <UIcon name="i-lucide-chevron-right" class="ml-1 w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Pengurus & AD/ART -->
      <div class="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 relative overflow-hidden">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-users" class="w-6 h-6" />
        </div>
        <h3 class="text-2xl font-semibold mb-3 tracking-tight text-slate-900">Pengurus & AD/ART</h3>
        <p class="text-slate-500 leading-relaxed mb-4">Struktur kepemimpinan periode 2024-2029 dan dokumen legalitas dasar organisasi (AD/ART).</p>
        <NuxtLink to="#" class="inline-flex items-center text-sm font-semibold text-purple-600 hover:text-purple-700">
          Unduh Dokumen <UIcon name="i-lucide-chevron-right" class="ml-1 w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
/**
 * Direktori Rumah Sakit Section
 * Map UI dengan pins, search bar, dan sidebar list
 */
</script>

<template>
  <UPageSection id="direktori" class="py-24 bg-white">
    <div class="mb-10 text-center md:text-left">
      <h2 class="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
        Direktori <span class="text-primary-600">Rumah Sakit</span>
      </h2>
      <p class="text-lg text-slate-500">Temukan layanan spesialis paru terdekat di kota Anda.</p>
    </div>

    <!-- Map UI Container -->
    <div class="relative w-full h-[600px] bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50 group">
      
      <!-- Background Map Image -->
      <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" alt="Map Background" class="absolute inset-0 w-full h-full object-cover opacity-60 grayscale mix-blend-multiply">
      
      <!-- Overlay Gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-transparent to-slate-900/10"></div>

      <!-- Floating Search Bar -->
      <div class="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-20">
        <div class="bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/50 flex gap-2">
          <div class="relative flex-grow">
            <UIcon name="i-lucide-search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Cari nama RS, Kota, atau Provinsi..." class="w-full bg-transparent h-12 pl-12 pr-4 text-slate-900 placeholder-slate-400 font-medium focus:outline-none rounded-xl hover:bg-slate-50 transition-colors">
          </div>
          <UButton color="primary" class="px-6 rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:bg-primary-600">
            Cari
          </UButton>
        </div>
      </div>

      <!-- Pins (Simulated Locations) -->
      <!-- Pin 1 -->
      <div class="absolute top-[40%] left-[30%] group/pin cursor-pointer">
        <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/40 z-10 hover:scale-110 transition-transform">
          <div class="absolute -inset-4 bg-primary-500/20 rounded-full animate-ping"></div>
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white rounded-xl shadow-xl p-4 opacity-0 group-hover/pin:opacity-100 transition-opacity duration-300 pointer-events-none z-20 scale-95 group-hover/pin:scale-100 origin-bottom">
          <h4 class="font-bold text-slate-900 text-sm">RS Persahabatan</h4>
          <p class="text-xs text-slate-500 mt-1 mb-2">Pusat Rujukan Respirasi Nasional</p>
          <span class="inline-flex items-center text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">Buka 24 Jam</span>
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
        </div>
      </div>

      <!-- Pin 2 -->
      <div class="absolute top-[60%] left-[60%] group/pin cursor-pointer">
        <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/40 z-10 hover:scale-110 transition-transform">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-white rounded-xl shadow-xl p-4 opacity-0 group-hover/pin:opacity-100 transition-opacity duration-300 pointer-events-none z-20 scale-95 group-hover/pin:scale-100 origin-bottom">
          <h4 class="font-bold text-slate-900 text-sm">RSUD Dr. Soetomo</h4>
          <p class="text-xs text-slate-500 mt-1">Surabaya, Jawa Timur</p>
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
        </div>
      </div>

      <!-- Pin 3 -->
      <div class="absolute top-[35%] left-[75%] group/pin cursor-pointer">
        <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/40 z-10 hover:scale-110 transition-transform">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-white rounded-xl shadow-xl p-4 opacity-0 group-hover/pin:opacity-100 transition-opacity duration-300 pointer-events-none z-20 scale-95 group-hover/pin:scale-100 origin-bottom">
          <h4 class="font-bold text-slate-900 text-sm">RSUP Dr. Wahidin</h4>
          <p class="text-xs text-slate-500 mt-1">Makassar, Sulawesi Selatan</p>
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
        </div>
      </div>

      <!-- Floating Sidebar List (Desktop Only) -->
      <div class="absolute top-28 left-8 bottom-8 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden hidden lg:flex flex-col border border-slate-100">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 class="font-semibold text-slate-900">Hasil Pencarian</h3>
          <p class="text-xs text-slate-500">Menampilkan 3 RS Rujukan Utama</p>
        </div>
        <div class="overflow-y-auto flex-1 p-2 space-y-2 no-scrollbar">
          <!-- List Item 1 -->
          <div class="p-3 hover:bg-primary-50 rounded-xl cursor-pointer transition-colors group/item">
            <h4 class="font-semibold text-sm text-slate-900 group-hover/item:text-primary-700">RS Persahabatan</h4>
            <p class="text-xs text-slate-500 mb-2">Jakarta Timur</p>
            <div class="flex gap-1">
              <span class="text-[10px] border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">Spirometri</span>
              <span class="text-[10px] border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">Bronkoskopi</span>
            </div>
          </div>
          <!-- List Item 2 -->
          <div class="p-3 hover:bg-primary-50 rounded-xl cursor-pointer transition-colors group/item">
            <h4 class="font-semibold text-sm text-slate-900 group-hover/item:text-primary-700">RSUD Dr. Soetomo</h4>
            <p class="text-xs text-slate-500 mb-2">Surabaya</p>
            <div class="flex gap-1">
              <span class="text-[10px] border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">Rawat Inap</span>
              <span class="text-[10px] border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">IGD 24H</span>
            </div>
          </div>
          <!-- List Item 3 -->
          <div class="p-3 hover:bg-primary-50 rounded-xl cursor-pointer transition-colors group/item">
            <h4 class="font-semibold text-sm text-slate-900 group-hover/item:text-primary-700">RSUP Dr. Wahidin</h4>
            <p class="text-xs text-slate-500 mb-2">Makassar</p>
            <div class="flex gap-1">
              <span class="text-[10px] border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">Poli Paru</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </UPageSection>
</template>

<template>
  <div class="h-screen w-full grid lg:grid-cols-2 overflow-hidden">
    <!-- Left: Branding (Hidden on mobile) -->
    <div class="hidden lg:flex relative bg-gray-900 text-white flex-col justify-between p-12 overflow-hidden">
      <!-- Background Pattern/Image -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-600 to-gray-900 z-0" />
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay z-0" />

      <!-- Top: Logo -->
      <div class="relative z-10">
        <div class="flex items-center gap-3">
          <img src="/logo_pdpi_official.png" alt="Logo PDPI" class="w-12 h-12 object-contain" />
          <span class="text-xl font-bold tracking-tight">PDPI</span>
        </div>
      </div>

      <!-- Center: Quote/Content -->
      <div class="relative z-10 max-w-md">
        <h1 class="text-4xl font-bold mb-6 leading-tight">
          Bersama Memajukan Kesehatan Respirasi Indonesia.
        </h1>
        <p class="text-lg text-gray-300">
          Bergabunglah dengan ribuan dokter spesialis paru dalam wadah organisasi profesi yang profesional dan inovatif.
        </p>
      </div>

      <!-- Bottom: Copyright -->
      <div class="relative z-10 text-sm text-gray-400">
        &copy; 2024 Perhimpunan Dokter Paru Indonesia
      </div>
    </div>

    <!-- Right: Form Content -->
    <div class="flex flex-col h-full overflow-y-auto bg-white dark:bg-gray-950">
      <!-- Mobile Header (Logo & Back) -->
      <div class="lg:hidden p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
         <OrganizationLogo size="sm" />
         <UButton to="/" icon="i-lucide-x" variant="ghost" color="neutral" />
      </div>

      <!-- Desktop Back Button -->
      <div class="hidden lg:flex justify-end p-8">
        <UButton to="/" label="Kembali ke Beranda" variant="ghost" icon="i-lucide-arrow-left" color="neutral" />
      </div>

      <!-- Form Wrapper -->
      <div class="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div class="w-full">
           <slot />
        </div>
      </div>
    </div>
  </div>
</template>

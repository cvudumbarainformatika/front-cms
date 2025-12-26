<script setup lang="ts">
/**
 * Halaman Visi & Misi PDPI
 */

const { data: profil } = await useFetch('/api/profil')

useSeoMeta({
  title: 'Visi & Misi - PDPI',
  description: 'Visi dan Misi Perhimpunan Dokter Paru Indonesia untuk kemajuan kesehatan respiratori Indonesia',
  ogTitle: 'Visi & Misi - PDPI',
  ogDescription: 'Visi dan Misi Perhimpunan Dokter Paru Indonesia'
})
</script>

<template>
  <div v-if="profil?.data.visiMisi">
    <UPageHero
      title="Visi & Misi PDPI"
      description="Komitmen kami untuk kemajuan kesehatan respiratori Indonesia"
      :links="[{
        label: 'Kembali ke Profil',
        to: '/profil',
        icon: 'i-lucide-arrow-left',
        color: 'neutral',
        variant: 'outline'
      }]"
    />

    <UPageSection>
      <div class="max-w-4xl mx-auto space-y-12">
        <!-- Visi -->
        <UPageCard
          title="Visi"
          icon="i-lucide-eye"
          spotlight
        >
          <p class="text-lg text-foreground leading-relaxed">
            {{ profil.data.visiMisi.visi }}
          </p>
        </UPageCard>

        <!-- Misi -->
        <UPageCard
          title="Misi"
          icon="i-lucide-target"
          spotlight
        >
          <ul class="space-y-4">
            <li
              v-for="(item, index) in profil.data.visiMisi.misi"
              :key="index"
              class="flex gap-3"
            >
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <span class="text-primary font-semibold text-sm">{{ index + 1 }}</span>
              </div>
              <p class="text-foreground flex-1">
                {{ item }}
              </p>
            </li>
          </ul>
        </UPageCard>
      </div>
    </UPageSection>

    <!-- CTA -->
    <USeparator />

    <UPageCTA
      title="Bergabunglah dengan PDPI"
      description="Mari bersama-sama mewujudkan visi dan misi PDPI untuk kemajuan kesehatan respiratori Indonesia."
      :links="[{
        label: 'Daftar Anggota',
        to: '/daftar',
        size: 'xl',
        trailingIcon: 'i-lucide-arrow-right'
      }]"
    />
  </div>
</template>

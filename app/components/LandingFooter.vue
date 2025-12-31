<script setup lang="ts">
/**
 * Landing Footer Component
 * Footer dengan 4 kolom dan social links
 */

import type { HomepageData } from '~/types/content'

// Fetch homepage data untuk carousel images
const { data: home } = await useFetch<{ success: boolean, data: HomepageData, message: string }>('/api/homepage')
const homeData = computed(() => home.value?.data)
</script>

<template>
  <UFooter class="pt-20 pb-10 border-t bg-slate-50 border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <UFooterColumns :ui="{ wrapper: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16' }">
        <!-- Brand -->
        <template #left>
          <div class="space-y-6">
            <NuxtLink to="/" class="flex items-center gap-2">
              <!-- <div class="bg-primary-500 p-1.5 rounded-lg text-white">
                <UIcon name="i-lucide-activity" class="w-6 h-6 stroke-[1.5]" />
              </div>
              <span class="text-xl font-semibold tracking-tight text-slate-900">Respira<span class="text-primary-600">Org</span></span> -->
              <OrganizationLogo size="md" />
            </NuxtLink>
            <div class="text-muted font-medium">
              {{homeData?.hero.description}} 
            </div>
            <div class="flex gap-4">
              <NuxtLink to="#" class="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 transition-all bg-white border-slate-200 text-primary-600 hover:text-white">
                <UIcon name="i-lucide-facebook" class="w-5 h-5" />
              </NuxtLink>
              <NuxtLink to="#" class="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 transition-all bg-white border-slate-200 text-primary-600 hover:text-white">
                <UIcon name="i-lucide-instagram" class="w-5 h-5" />
              </NuxtLink>
              <NuxtLink to="#" class="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 transition-all bg-white border-slate-200 text-primary-600 hover:text-white">
                <UIcon name="i-lucide-twitter" class="w-5 h-5" />
              </NuxtLink>
            </div>
          </div>
        </template>

        <!-- Contact & Quick Links -->
        <template #center>
          <div>
            <h4 class="font-bold mb-6 text-slate-900">Sekretariat Pusat</h4>
            <ul class="space-y-4">
              <li class="flex items-start gap-3 text-slate-500 font-medium">
                <UIcon name="i-lucide-map-pin" class="text-primary-500 shrink-0 w-5 h-5" />
                <span>Gedung Asma Indonesia, Lt. 2<br>Jl. Persahabatan Raya No. 1, Jakarta</span>
              </li>
              <li class="flex items-center gap-3 text-slate-500 font-medium">
                <UIcon name="i-lucide-phone" class="text-primary-500 shrink-0 w-5 h-5" />
                <span>(021) 489-1234</span>
              </li>
              <li class="flex items-center gap-3 text-slate-500 font-medium">
                <UIcon name="i-lucide-mail" class="text-primary-500 shrink-0 w-5 h-5" />
                <span>secretariat@org-respirasi.id</span>
              </li>
            </ul>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="font-bold mb-6 text-slate-900">Tautan Cepat</h4>
            <ul class="space-y-3 text-slate-500 font-medium">
              <li><NuxtLink to="#" class="hover:text-primary-500 transition-colors">Daftar Anggota</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-primary-500 transition-colors">Kolegium Pulmonologi</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-primary-500 transition-colors">Unduh Guideline</NuxtLink></li>
              <li><NuxtLink to="#" class="hover:text-primary-500 transition-colors">Kalender Ilmiah</NuxtLink></li>
            </ul>
          </div>
        </template>

        <!-- Membership -->
        <template #right>
          <div>
            <h4 class="font-bold mb-6 text-slate-900">Anggota</h4>
            <p class="text-sm text-slate-500 mb-4">Login ke portal anggota untuk akses jurnal dan materi eksklusif.</p>
            <UButton
              to="/login"
              block
              color="white"
              class="border border-slate-200 hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm justify-center"
            >
              Login Anggota
            </UButton>
          </div>
        </template>
      </UFooterColumns>

      <!-- Bottom Bar -->
      <div class="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-slate-200">
        <p class="text-slate-500 font-medium text-sm">© 2024 Indonesian Respiratory Association. All Rights Reserved.</p>
        <div class="flex gap-8 text-sm font-medium text-slate-500">
          <NuxtLink to="#" class="hover:text-primary-600">Kebijakan Privasi</NuxtLink>
          <NuxtLink to="#" class="hover:text-primary-600">Syarat & Ketentuan</NuxtLink>
        </div>
      </div>
    </div>
  </UFooter>
</template>

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
  <footer class="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
        <!-- Brand Column -->
        <div class="space-y-6">
          <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="relative w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
            <div class="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/30 transition-all"></div>
            <NuxtImg
              src="/images/logo-pdpi.png"
              alt="Logo PDPI"
              class="relative w-full h-full object-contain drop-shadow-sm"
              width="40"
              height="40"
              format="webp"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 tracking-tight leading-none group-hover:to-primary-600 transition-all font-heading">
              PDPI
            </span>
            <span class="text-[0.65rem] font-medium text-muted-500 dark:text-muted-400 tracking-widest uppercase group-hover:text-primary-500 transition-colors">
              Respirologi Indonesia
            </span>
          </div>
        </NuxtLink>
          <div class="text-slate-500 font-medium">
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

        <!-- Link Terkait Column -->
        <div>
          <h4 class="font-bold mb-6 text-slate-900">Link Terkait</h4>
          <ul class="space-y-3 text-slate-500 font-medium">
            <li>
              <NuxtLink
                to="https://www.direktoripdpi.com/"
                target="_blank"
                class="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 transition-colors break-words"
              >
                https://www.direktoripdpi.com/
                <UIcon name="i-lucide-external-link" class="w-4 h-4 ml-0.5 shrink-0" />
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Membership Column -->
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
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-slate-500 font-medium text-sm">© {{ new Date().getFullYear() }} Indonesian Society of Respirology. All Rights Reserved.</p>

      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * PublicFooter Component
 * Redesigned to match Screenshot 2 exactly - Green Theme
 */
import type { HomepageData } from '~/types/content'

const { $apiFetch } = useNuxtApp()
const { data: home } = await useAsyncData('home-footer-final',
  () => $apiFetch<{ success: boolean, data: HomepageData, message: string }>('/homepage'),
  { server: false, lazy: true }
)

const homeData = computed(() => home.value?.data)
const footerData = computed(() => homeData.value?.footer)

const currentYear = new Date().getFullYear()

const { data: headerMenus } = await useMenu('header')
const { user } = useAuth()

// Filter menus by user role (same as header)
const navLinks = computed(() => {
  if (!headerMenus.value) return []
  const userRole = user.value?.role || 'public'
  return filterMenusByRole(headerMenus.value, userRole)
})
</script>

<template>
  <footer class="w-full">
    <!-- Top Bar (White Background) -->
    <div class="bg-white py-6 border-b border-slate-100">
      <UContainer>
        <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-8 text-center md:text-left">
          <!-- Logo (Left) -->
          <div class="flex justify-center md:justify-start">
            <OrganizationLogo size="lg" />
          </div>

          <!-- Title (Center) -->
          <div class="text-center">
             <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 mb-0.5">Perhimpunan</p>
             <h3 class="text-xl font-black text-slate-800 leading-none tracking-tight">
                Dokter Paru <span class="text-primary-600">Indonesia</span>
             </h3>
          </div>

          <!-- Socials (Right) -->
          <div class="flex items-center justify-center md:justify-end gap-6">
             <NuxtLink
                v-if="footerData?.socials?.instagram"
                :to="`https://instagram.com/${footerData.socials.instagram}`"
                target="_blank"
                class="flex items-center gap-3 group"
             >
                <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                   <UIcon name="i-simple-icons-instagram" class="w-5 h-5" />
                </div>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">@{{ footerData.socials.instagram }}</span>
             </NuxtLink>

             <NuxtLink
                v-if="footerData?.socials?.youtube"
                :to="`https://youtube.com/@${footerData.socials.youtube}`"
                target="_blank"
                class="flex items-center gap-3 group"
             >
                <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                   <UIcon name="i-simple-icons-youtube" class="w-5 h-5" />
                </div>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ footerData.socials.youtube }}</span>
             </NuxtLink>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Main Footer (Green Background) -->
    <div class="bg-linear-to-r from-blue-900 via-sky-800 to-emerald-600 text-white py-20 relative overflow-hidden">
      <!-- Subtle Pattern Overlay -->
      <div class="absolute inset-0 bg-[url('/images/footer-pattern.svg')] opacity-[0.03] pointer-events-none"></div>

      <UContainer>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <!-- Column 1: Navigation -->
          <div class="space-y-6">
            <h5 class="text-xs font-black uppercase tracking-[0.3em] text-primary-400 mb-4 opacity-50">NAVIGASI</h5>
            <div class="flex flex-col gap-4">
               <NuxtLink v-for="link in navLinks" :key="link.label" :to="link.to" class="text-sm font-bold opacity-80 hover:opacity-100 hover:text-primary-300 transition-all leading-snug">
                  {{ link.label }}
               </NuxtLink>
            </div>
          </div>

          <!-- Column 2 & 3: Dynamic Specialities -->
          <template v-if="footerData?.columns && footerData.columns.length > 0">
             <div v-for="(col, idx) in footerData.columns.slice(0, 2)" :key="idx" class="space-y-6">
                <h5 class="text-xs font-black uppercase tracking-[0.3em] text-primary-400 mb-4 opacity-50">{{ col.title }}</h5>
                 <div class="flex flex-col gap-3">
                    <div v-for="item in col.items" :key="item" class="text-sm font-bold opacity-80 leading-tight">
                       {{ item }}
                    </div>
                 </div>
             </div>
          </template>
          <!-- Fallback if no dynamic columns -->
          <template v-else>
             <div class="space-y-6">
                <h5 class="text-xs font-black uppercase tracking-[0.3em] text-primary-400 mb-4 opacity-50">ALAMAT RUMAH PDPI</h5>
                <div class="flex flex-col gap-3 text-sm font-bold opacity-80 leading-tight">
                   <p>Alamat Lengkap :</p>
                   <p>Jl. Cipinang Bunder No.19</p>
                   <p>Cipinang Pulogadung – Jakarta</p>
                   <p>• Kode Pos : 13240</p>
                   <p>• Telepon : (021) 22474845</p>
                   <p>• Email : sekjen_pdpi@ymail.com</p>
                   <p>• Website : www.klikpdpi.com</p>
                </div>
             </div>
             <div class="space-y-6">
                <h5 class="text-xs font-black uppercase tracking-[0.3em] text-primary-400 mb-4 opacity-50">ORGANISASI</h5>
                <div class="flex flex-col gap-3 text-sm font-bold opacity-80 leading-tight">
                   <p>1. Badan Legislatif: KONAS, PIK, KONKER</p>
                   <p>2. Majelis Kehormatan: 9 orang</p>
                   <p>3. Dewan Pengawas</p>
                   <p>4. Dewan Etik, Hukum & Pembelaan: 7 orang</p>
                   <p>5. Dewan Eksekutif: Pengurus Harian</p>
                   <p>6. Dewan Pendidikan</p>
                   <p>7. Pengurus Cabang</p>
                   <p class="opacity-40 italic">(AD-ART BAB VII Pasal 8)</p>
                </div>
             </div>
          </template>

          <!-- Column 4: Contact Info -->
          <div class="space-y-10">
             <!-- Contact Info Section -->
             <div class="space-y-6">
                <div class="flex gap-4 group">
                   <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary-400">
                      <UIcon name="i-lucide-phone" class="w-5 h-5" />
                   </div>
                   <div class="space-y-2">
                      <h6 class="text-[10px] font-black opacity-40 uppercase tracking-widest">CONTACT INFO</h6>
                      <p class="text-xs font-bold leading-relaxed whitespace-pre-line text-primary-50">
                         {{ footerData?.contact?.phone || '+62 21 568 1149' }}
                      </p>
                   </div>
                </div>

                <div class="flex gap-4 group">
                   <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary-400">
                      <UIcon name="i-lucide-mail" class="w-5 h-5" />
                   </div>
                   <div class="space-y-2">
                      <h6 class="text-[10px] font-black opacity-40 uppercase tracking-widest">EMAIL</h6>
                      <p class="text-xs font-bold leading-relaxed whitespace-pre-line text-primary-50">
                         {{ footerData?.contact?.email || 'sekretariat@pdpi.or.id' }}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Horizontal Line & Copyright (Bottom) -->
        <div class="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
           <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
              Copyright by PDPI {{ currentYear }}. All rights reserved.
           </p>
           <div class="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
              Indonesian Society of Respirology.
           </div>
        </div>
      </UContainer>
    </div>
  </footer>
</template>

<style scoped>
.bg-primary-900 { background-color: #064E3B; }
.text-primary-600 { color: #10B981; }
.text-primary-400 { color: #4ADE80; }
.text-primary-50 { color: #ECFDF5; }
.decoration-primary-600 { text-decoration-color: #10B981; }
</style>

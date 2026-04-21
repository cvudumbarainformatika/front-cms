<script setup lang="ts">
/**
 * LandingAboutUs Component
 * About Us section refined - Green Theme
 */
import type { HomepageData } from '~/types/content'
import MemberCard from './MemberCard.vue'

const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

const { data: home } = useAsyncData('home-about',
  () => $apiFetch<{ success: boolean, data: HomepageData, message: string }>('/homepage'),
  { server: false, lazy: true }
)

const homeData = computed(() => home.value?.data)
const aboutData = computed(() => homeData.value?.about)

const members = computed(() => {
  const m = aboutData.value?.members
  if (Array.isArray(m) && m.length > 0) return m

  return [
    { name: 'Lucia Kris Dinarti', position: 'ECHOCARDIOGRAPHY', photo: '', joinedDate: 'May 2023', icon: 'i-lucide-heart-pulse' },
    { name: 'Meity Ardiana', position: 'PREVENTION & CV REHABILITATION', photo: '', joinedDate: 'May 2023', icon: 'i-lucide-users' },
    { name: 'Achmad Fauzi Yahya', position: 'INTERVENTIONAL CARDIOLOGY', photo: '', joinedDate: 'May 2023', icon: 'i-lucide-activity' },
    { name: 'Anwar Santoso', position: 'PREVENTION & CV REHABILITATION', photo: '', joinedDate: 'May 2023', icon: 'i-lucide-hand-heart' }
  ]
})
</script>

<template>
  <section id="about" class="py-24 bg-white overflow-hidden relative">
    <div class="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -z-10 -skew-x-12 translate-x-1/2"></div>

    <UContainer>
      <div class="grid lg:grid-cols-2 gap-20 items-center mb-20">
        <!-- Left: Image styled as MemberCard -->
        <ScrollReveal animation="slide-right">
          <div class="relative max-w-md mx-auto lg:mx-0">
             <MemberCard
                :name="aboutData?.title || homeData?.hero?.title || 'Perhimpunan Dokter Paru Indonesia'"
                :position="aboutData?.subtitle || 'ABOUT PDPI'"
                :photo="aboutData?.photo"
                :show-join-date="false"
                icon="i-lucide-info"
             />
          </div>
        </ScrollReveal>

        <!-- Right: Content -->
        <ScrollReveal animation="slide-left">
          <div class="space-y-8">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <span class="text-primary-600 font-bold uppercase tracking-[0.2em] text-sm">TENTANG KAMI</span>
                <div class="h-0.5 w-16 bg-primary-600/30 rounded-full"></div>
              </div>
              <h2 class="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tighter">
                Perhimpunan <span class="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-primary-900">Dokter Paru</span> Indonesia.
              </h2>
            </div>

            <p class="text-slate-500 leading-relaxed text-lg font-medium whitespace-pre-line">
              {{ aboutData?.description || 'Berdiri sejak 8 September 1973\n• Ikatan Dokter Paru Indonesia (IDPI): rapat 20 dokter ahli penyakit paru di Indonesia, termasuk Dr. Rasmin Rasjid memperjuangkan pembentukan Bagian Pulmonologi di FKUI.\n• 1988: nama IDPI diubah menjadi Perhimpunan Dokter Paru Indonesia (PDPI) dalam Kongres Nasional V-IDPI, disesuaikan dengan Muktamar IDI ke-20 di Surabaya\n• 2023 HUT PDPI 50 tahun\n• 2025 HUT PDPI 52 tahun' }}
            </p>
          </div>
        </ScrollReveal>
      </div>

      <!-- Members Grid (No title as requested) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScrollReveal
           v-for="(member, idx) in members"
           :key="idx"
           animation="slide-up"
           :delay="idx * 100"
        >
          <MemberCard
             :name="member.name"
             :position="member.position"
             :photo="member.photo"
             :joined-date="member.joinedDate"
             :icon="(member as any).icon"
          />
        </ScrollReveal>
      </div>

      <!-- Footer Buttons -->
      <ScrollReveal animation="fade" :delay="400">
        <div class="mt-24 bg-linear-to-r from-blue-900 via-sky-800 to-emerald-600 rounded-[3rem] p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(16,185,129,0.3)]">
          <div class="absolute inset-0 bg-primary-600/10 pointer-events-none"></div>
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

          <div class="space-y-4 max-w-lg relative z-10 text-center md:text-left">
             <h4 class="text-3xl md:text-4xl font-bold text-white tracking-tight">Cari Anggota Berdasarkan Wilayah & Lokasi.</h4>
             <p class="text-primary-100 font-medium">Temukan dokter spesialis paru terdekat di kota Anda melalui direktori resmi kami.</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-6 relative z-10 w-full md:w-auto">
            <UButton
              to="/direktori"
              size="xl"
              color="primary"
              class="rounded-full px-12 py-5 font-extrabold shadow-2xl shadow-primary-500/40"
            >
              DIREKTORI
            </UButton>
            <UButton
              to="https://www.direktoripdpi.com/"
              target="_blank"
              size="xl"
              variant="ghost"
              class="rounded-full px-12 py-5 border-2 border-white/20 text-white hover:bg-white hover:text-primary-900 transition-all font-extrabold"
            >
              WEB DIREKTORI
            </UButton>
          </div>
        </div>
      </ScrollReveal>
    </UContainer>
  </section>
</template>

<style scoped>
.text-primary-600 { color: #10B981; }
.bg-primary-600 { background-color: #10B981; }
.bg-primary-900 { background-color: #064E3B; }
</style>

<script setup lang="ts">
/**
 * Dashboard Index Page
 * Halaman utama dashboard dengan overview stats
 */

definePageMeta({
  layout: 'dashboard',
  ssr: false
})

useSeoMeta({
  title: 'Dashboard',
  description: 'Dashboard anggota PDPI'
})

const { user, isAdmin, isAuthenticated } = useAuth()
const router = useRouter()
// Fetch dashboard stats
const { data: statsResponse, status: statsStatus } = await useAsyncData('dashboard-stats', async () => {
  const { $apiFetch } = useNuxtApp()
  return await $apiFetch<{
    success: boolean
    message: string
    data: {
      article_count: number
      agenda_count: number
      member_count: number
    }
  }>('/dashboard/stats')
})

const stats = computed(() => {
  const data = statsResponse.value?.data || { article_count: 0, agenda_count: 0, member_count: 0 }

  return [
    {
      label: 'Total Artikel',
      value: data.article_count?.toLocaleString('id-ID') || '0',
      icon: 'i-lucide-newspaper',
    },
    {
      label: 'Total Agenda',
      value: data.agenda_count?.toLocaleString('id-ID') || '0',
      icon: 'i-lucide-calendar',
    },
    {
      label: 'Anggota Direktori',
      value: data.member_count?.toLocaleString('id-ID') || '0',
      icon: 'i-lucide-users',
      description: 'Terdaftar di PDPI'
    }
  ]
})

// Dummy upcoming events
const upcomingEvents = ref([
  {
    id: 1,
    title: 'Webinar Tatalaksana PPOK 2024',
    date: '28 Des 2024',
    type: 'webinar',
    skp: 4
  },
  {
    id: 2,
    title: 'Workshop Bronkoskopi',
    date: '15 Jan 2025',
    type: 'workshop',
    skp: 8
  },
  {
    id: 3,
    title: 'Kongres Nasional PDPI',
    date: '20-22 Feb 2025',
    type: 'kongres',
    skp: 25
  }
])



// Cek authentikasi saat komponen di mount
const checkAuth = async () => {
  // Tunggu sebentar agar state authentikasi terinisialisasi dari localStorage
  await new Promise(resolve => setTimeout(resolve, 100))

  if (!isAuthenticated.value) {
    await router.push('/login')
  }
}

onMounted(checkAuth)
</script>

<template>
  <div class="space-y-10">
    <!-- Welcome Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <ClientOnly>
        <h1 class="text-2xl font-bold text-highlighted">
          Selamat Datang, {{ user?.name?.split(' ')[0] }}! 👋
        </h1>
        <p class="text-muted">
          NPA: {{ user?.memberId || 'Belum tersedia' }}
        </p>
      </ClientOnly>

      <div class="flex gap-2">
        <ClientOnly>
          <UButton
            label="Profil Saya"
            icon="i-lucide-user"
            color="neutral"
            variant="outline"
            to="/dashboard/profil"
          />
          <UButton
            v-if="isAdmin"
            label="Kelola Users"
            icon="i-lucide-users"
            color="primary"
            to="/dashboard/admin/anggota"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <UPageCard
        v-for="stat in stats"
        :key="stat.label"
        class="p-6 transition-transform hover:-translate-y-1 duration-300"
      >
        <div class="flex items-center gap-6">
          <div class="p-3 rounded-lg bg-primary/10">
            <UIcon
              :name="stat.icon"
              class="w-6 h-6 text-primary"
            />
          </div>
          <div>
            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>
            <p class="text-2xl font-bold text-highlighted">
              {{ stat.value }}
            </p>
            <p
              v-if="stat.description"
              class="text-xs text-muted"
            >
              {{ stat.description }}
            </p>
          </div>
        </div>
      </UPageCard>
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 gap-8">
      <!-- Upcoming Events -->
      <UPageCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-highlighted">
              {{ 'Agenda Mendatang' }}
            </h2>
            <UButton
              label="Lihat Semua"
              variant="link"
              trailing-icon="i-lucide-arrow-right"
              to="/agenda"
              size="sm"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="event in upcomingEvents"
            :key="event.id"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div class="p-2 rounded-lg bg-primary/10">
              <UIcon
                :name="event.type === 'webinar' ? 'i-lucide-video' : event.type === 'workshop' ? 'i-lucide-wrench' : 'i-lucide-users'"
                class="w-5 h-5 text-primary"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-highlighted truncate">
                {{ event.title }}
              </p>
              <p class="text-sm text-muted">
                {{ event.date }}
              </p>
            </div>
            <UBadge
              color="primary"
              variant="subtle"
            >
              {{ event.skp }} SKP
            </UBadge>
          </div>
        </div>
      </UPageCard>


    </div>
  </div>
</template>

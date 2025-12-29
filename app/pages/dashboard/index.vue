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

// Dummy stats data
const stats = ref([
  {
    label: 'Total SKP',
    value: '125',
    icon: 'i-lucide-award',
    change: '+12',
    changeType: 'positive' as const
  },
  {
    label: 'Sertifikat',
    value: '8',
    icon: 'i-lucide-file-badge',
    change: '+2',
    changeType: 'positive' as const
  },
  {
    label: 'Status STR',
    value: 'Aktif',
    icon: 'i-lucide-shield-check',
    description: 'Berlaku s/d Des 2025'
  },
  {
    label: 'Status SIP',
    value: 'Aktif',
    icon: 'i-lucide-file-check',
    description: 'Berlaku s/d Mar 2026'
  }
])

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

// Dummy notifications
const notifications = ref([
  {
    id: 1,
    title: 'Iuran Tahunan 2025',
    message: 'Pembayaran iuran tahunan akan jatuh tempo pada 31 Januari 2025',
    type: 'warning',
    date: '2 hari lalu'
  },
  {
    id: 2,
    title: 'STR Akan Berakhir',
    message: 'STR Anda akan berakhir dalam 12 bulan. Segera persiapkan perpanjangan.',
    type: 'info',
    date: '1 minggu lalu'
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
  <div class="space-y-6">
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
            label="Kelola Anggota"
            icon="i-lucide-users"
            color="primary"
            to="/dashboard/admin/anggota"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UPageCard
        v-for="stat in stats"
        :key="stat.label"
        class="p-4"
      >
        <div class="flex items-center gap-4">
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
              v-if="stat.change"
              :class="[
                'text-xs',
                stat.changeType === 'positive' ? 'text-success' : 'text-error'
              ]"
            >
              {{ stat.change }} bulan ini
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <!-- Notifications -->
      <UPageCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-highlighted">
              {{ 'Notifikasi' }}
            </h2>
            <UButton
              icon="i-lucide-check-check"
              variant="ghost"
              size="sm"
              color="neutral"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="notif in notifications"
            :key="notif.id"
            class="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              :class="[
                'p-2 rounded-lg',
                notif.type === 'warning' ? 'bg-warning/10' : 'bg-info/10'
              ]"
            >
              <UIcon
                :name="notif.type === 'warning' ? 'i-lucide-alert-triangle' : 'i-lucide-info'"
                :class="[
                  'w-5 h-5',
                  notif.type === 'warning' ? 'text-warning' : 'text-info'
                ]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-highlighted">
                {{ notif.title }}
              </p>
              <p class="text-sm text-muted line-clamp-2">
                {{ notif.message }}
              </p>
              <p class="text-xs text-muted mt-1">
                {{ notif.date }}
              </p>
            </div>
          </div>
        </div>
      </UPageCard>
    </div>
  </div>
</template>

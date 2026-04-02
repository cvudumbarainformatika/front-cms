<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { $apiFetch } = useNuxtApp()
const toast = useToast()

const loading = ref(true)
const logs = ref({
  success: [] as string[],
  deferred: [] as string[]
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const response = await $apiFetch<any>('/broadcast/email-logs')
    logs.value = {
      success: response?.success || [],
      deferred: response?.deferred || []
    }
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal mengambil data log email',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})

const searchQuery = ref('')
const activeTab = ref('success')

const filteredSuccess = computed(() => {
  return logs.value.success.filter(email => 
    email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredDeferred = computed(() => {
  return logs.value.deferred.filter(email => 
    email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const stats = computed(() => {
  const s = logs.value.success.length
  const d = logs.value.deferred.length
  const total = s + d
  const rate = total > 0 ? Math.round((s / total) * 100) : 0
  return { s, d, total, rate }
})
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Laporan Broadcast Email</h1>
        <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Monitor status pengiriman pesan ke anggota secara real-time dari riwayat mailserver.
        </p>
      </div>
      <div>
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="outline"
          :loading="loading"
          @click="fetchLogs"
          class="shadow-sm hover:shadow-md transition-shadow"
        >
          Refresh Data
        </UButton>
      </div>
    </div>

    <!-- Premium Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      
      <!-- Total -->
      <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800/50">
            <UIcon name="i-lucide-mail" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Total Antrean</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ stats.total }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Sent -->
      <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800/50">
            <UIcon name="i-lucide-check-circle-2" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Berhasil (Sent)</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ stats.s }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Deferred -->
      <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800/50">
            <UIcon name="i-lucide-clock-4" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Tertunda</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ stats.d }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Rate -->
      <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-800/50">
            <UIcon name="i-lucide-pie-chart" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Success Rate</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ stats.rate }}%</h3>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Main Content Panel -->
    <UCard class="shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800' } }">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center p-1 bg-gray-100/80 dark:bg-gray-900/80 rounded-lg">
            <UButton
              :color="activeTab === 'success' ? 'primary' : 'neutral'"
              :variant="activeTab === 'success' ? 'solid' : 'ghost'"
              @click="activeTab = 'success'"
              class="w-full sm:w-auto transition-all"
              icon="i-lucide-check-circle"
            >
              Terkirim ({{ logs.success.length }})
            </UButton>
            <UButton
              :color="activeTab === 'deferred' ? 'warning' : 'neutral'"
              :variant="activeTab === 'deferred' ? 'solid' : 'ghost'"
              @click="activeTab = 'deferred'"
              class="w-full sm:w-auto transition-all"
              icon="i-lucide-clock"
            >
              Tertunda ({{ logs.deferred.length }})
            </UButton>
          </div>
          <div class="relative">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              placeholder="Cari email..."
              class="w-full sm:w-64"
              variant="outline"
              color="neutral"
            />
          </div>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-gray-50/30 dark:bg-gray-900/10">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-gray-400 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400 font-medium text-sm">Menarik data log terbaru...</p>
      </div>

      <!-- Data View -->
      <div v-else class="bg-white dark:bg-gray-900">
        
        <!-- Terkirim Tab -->
        <div v-if="activeTab === 'success'">
          <div v-if="filteredSuccess.length === 0" class="flex flex-col items-center justify-center py-20 px-4">
            <div class="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700">
              <UIcon name="i-lucide-mail-open" class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-gray-900 dark:text-white font-medium mb-1">Riwayat Kosong</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Belum ada email yang berstatus terkirim atau cocok dengan pencarian Anda.
            </p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">No</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alamat Email</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Status Pengiriman</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800/80">
                <tr v-for="(email, index) in filteredSuccess" :key="email" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td class="px-6 py-4 text-sm tracking-wide text-gray-400 dark:text-gray-500">{{ index + 1 }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{{ email }}</td>
                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-500/20">
                      <UIcon name="i-lucide-check" class="w-3.5 h-3.5" />
                      Terkirim
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tertunda Tab -->
        <div v-else-if="activeTab === 'deferred'">
          <div v-if="filteredDeferred.length === 0" class="flex flex-col items-center justify-center py-20 px-4">
            <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800/30">
              <UIcon name="i-lucide-shield-check" class="w-8 h-8 text-emerald-500" />
            </div>
            <h3 class="text-gray-900 dark:text-white font-medium mb-1">Semua Lancar</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Hebat! Tidak ada email yang tersangkut dalam antrean server saat ini.
            </p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">No</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alamat Email</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Keterangan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800/80">
                <tr v-for="(email, index) in filteredDeferred" :key="email" class="hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors group">
                  <td class="px-6 py-4 text-sm tracking-wide text-gray-400 dark:text-gray-500">{{ index + 1 }}</td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ email }}</span>
                      <span class="text-xs text-amber-600 dark:text-amber-500 mt-0.5 flex items-center gap-1">
                        <UIcon name="i-lucide-alert-circle" class="w-3 h-3" />
                        Masih dalam pengulangan otomatis
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20">
                      <UIcon name="i-lucide-loader-2" class="w-3.5 h-3.5 animate-spin" />
                      Retrying
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <template #footer>
        <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg py-2 px-4 inline-block">
          <p class="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <UIcon name="i-lucide-activity" class="w-3.5 h-3.5 text-blue-500" />
            PDPI Internal System &bull; Evaluated Logs: <span class="font-bold text-gray-700 dark:text-gray-300">{{ stats.total }}</span>
          </p>
        </div>
      </template>
    </UCard>
  </div>
</template>

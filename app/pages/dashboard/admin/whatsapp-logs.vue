<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { $apiFetch } = useNuxtApp()
const toast = useToast()

const loading = ref(true)
const timeFilter = ref<'1h' | 'today' | 'all'>('all')
const logs = ref({
  success: [] as string[],
  failed: [] as string[]
})

const since = computed(() => {
  if (timeFilter.value === '1h') return Math.floor(Date.now() / 1000) - 3600
  if (timeFilter.value === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.floor(today.getTime() / 1000)
  }
  return 0
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const query: any = {}
    if (since.value > 0) query.since = since.value

    const response = await $apiFetch<any>('/broadcast/whatsapp-logs', {
      query: query
    })
    logs.value = {
      success: response?.success || [],
      failed: response?.failed || []
    }
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal mengambil data log WhatsApp',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
  // Auto refresh every 10 seconds
  const interval = setInterval(fetchLogs, 10000)
  onUnmounted(() => clearInterval(interval))
})

watch(timeFilter, () => {
  fetchLogs()
})

const searchQuery = ref('')
const activeTab = ref('success')

const filteredSuccess = computed(() => {
  return logs.value.success.filter(phone => 
    phone.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredFailed = computed(() => {
  return logs.value.failed.filter(phone => 
    phone.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const stats = computed(() => {
  const s = logs.value.success.length
  const f = logs.value.failed.length
  const total = s + f
  const rate = total > 0 ? Math.round((s / total) * 100) : 0
  return { s, f, total, rate }
})
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Laporan Broadcast WhatsApp</h1>
        <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Monitor status pengiriman WhatsApp secara real-time dari log server.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex gap-1.5 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
          <UButton :color="timeFilter === '1h' ? 'primary' : 'neutral'" :variant="timeFilter === '1h' ? 'solid' : 'ghost'" size="sm" @click="timeFilter = '1h'">1 Jam</UButton>
          <UButton :color="timeFilter === 'today' ? 'primary' : 'neutral'" :variant="timeFilter === 'today' ? 'solid' : 'ghost'" size="sm" @click="timeFilter = 'today'">Hari Ini</UButton>
          <UButton :color="timeFilter === 'all' ? 'primary' : 'neutral'" :variant="timeFilter === 'all' ? 'solid' : 'ghost'" size="sm" @click="timeFilter = 'all'">Semua</UButton>
        </div>
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="outline"
          size="sm"
          :loading="loading"
          @click="fetchLogs"
          class="shadow-sm hover:shadow-md transition-shadow"
        >
          Refresh
        </UButton>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      
      <!-- Total -->
      <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 ring-1 ring-green-100 dark:ring-green-800/50">
            <UIcon name="i-lucide-phone" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Total Terproses</p>
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
            <UIcon name="i-lucide-check-check" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Berhasil (Sent)</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ stats.s }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Failed -->
      <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-800/50">
            <UIcon name="i-lucide-x-circle" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Gagal</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ stats.f }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Rate -->
      <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all group">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-800/50">
            <UIcon name="i-lucide-bar-chart" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Tingkat Berhasil</p>
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
              Berhasil ({{ logs.success.length }})
            </UButton>
            <UButton
              :color="activeTab === 'failed' ? 'error' : 'neutral'"
              :variant="activeTab === 'failed' ? 'solid' : 'ghost'"
              @click="activeTab = 'failed'"
              class="w-full sm:w-auto transition-all"
              icon="i-lucide-x-circle"
            >
              Gagal ({{ logs.failed.length }})
            </UButton>
          </div>
          <div class="relative">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              placeholder="Cari nomor..."
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
        <p class="text-gray-500 dark:text-gray-400 font-medium text-sm">Menarik data log WhatsApp...</p>
      </div>

      <!-- Data View -->
      <div v-else class="bg-white dark:bg-gray-900">
        
        <!-- Success Tab -->
        <div v-if="activeTab === 'success'">
          <div v-if="filteredSuccess.length === 0" class="flex flex-col items-center justify-center py-20 px-4">
            <div class="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700">
              <UIcon name="i-lucide-phone-incoming" class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-gray-900 dark:text-white font-medium mb-1">Riwayat Kosong</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Belum ada pesan WhatsApp yang berhasil dikirim atau cocok dengan pencarian Anda.
            </p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">No</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nomor WhatsApp</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800/80">
                <tr v-for="(phone, index) in filteredSuccess" :key="phone" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td class="px-6 py-4 text-sm tracking-wide text-gray-400 dark:text-gray-500">{{ index + 1 }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{{ phone }}</td>
                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-500/20">
                      <UIcon name="i-lucide-check" class="w-3.5 h-3.5" />
                      Berhasil
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Failed Tab -->
        <div v-else-if="activeTab === 'failed'">
          <div v-if="filteredFailed.length === 0" class="flex flex-col items-center justify-center py-20 px-4">
            <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800/30">
              <UIcon name="i-lucide-shield-check" class="w-8 h-8 text-emerald-500" />
            </div>
            <h3 class="text-gray-900 dark:text-white font-medium mb-1">Tidak Ada Error</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Semua pesan WhatsApp terkirim dengan lancar!
            </p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">No</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nomor WhatsApp</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Keterangan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800/80">
                <tr v-for="(phone, index) in filteredFailed" :key="phone" class="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors group">
                  <td class="px-6 py-4 text-sm tracking-wide text-gray-400 dark:text-gray-500">{{ index + 1 }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{{ phone }}</td>
                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-1 ring-inset ring-rose-600/20 dark:ring-rose-500/20">
                      <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
                      Gagal
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
            <UIcon name="i-lucide-activity" class="w-3.5 h-3.5 text-green-500" />
            WA Broadcast Logs &bull; Total: <span class="font-bold text-gray-700 dark:text-gray-300">{{ stats.total }}</span>
          </p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<template>
  <div class="pdpi-sync-container">
    <div class="header">
      <h1>🔄 Sinkronisasi Data Anggota PDPI</h1>
      <p class="subtitle">
        Sync semua data anggota dari database PDPI ke sistem CMS
      </p>
    </div>

    <!-- Action Card -->
    <div class="action-card">
      <div class="card-content">
        <div class="info-section">
          <div class="icon">📊</div>
          <div class="text">
            <h3>Sync All Members</h3>
            <p>Proses ini akan mengambil semua data anggota dari PDPI dan menyimpannya ke database lokal. Data yang sudah ada akan di-update.</p>
          </div>
        </div>

        <button 
          @click="handleSyncAll" 
          :disabled="isLoadingMember || isSyncing"
          class="btn-sync"
          :class="{ 'loading': isSyncing }"
        >
          <span v-if="!isSyncing">🚀 Mulai Sinkronisasi</span>
          <span v-else>⏳ Sedang Proses...</span>
        </button>
      </div>

      <!-- Progress Indicator -->
      <div v-if="isSyncing" class="progress-section">
        <div class="spinner"></div>
        <p>Mohon tunggu, sedang memproses data...</p>
      </div>
    </div>

    <!-- Result Card -->
    <div v-if="syncResult" class="result-card" :class="resultClass">
      <div class="result-header">
        <span class="icon">{{ syncResult.total_failed === 0 ? '✅' : '⚠️' }}</span>
        <h3>{{ syncResult.total_failed === 0 ? 'Sinkronisasi Berhasil!' : 'Sinkronisasi Selesai dengan Warning' }}</h3>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Total Diambil</div>
          <div class="stat-value">{{ syncResult.total_fetched }}</div>
        </div>
        <div class="stat-item success">
          <div class="stat-label">Berhasil</div>
          <div class="stat-value">{{ syncResult.total_synced }}</div>
        </div>
        <div class="stat-item" :class="{ 'error': syncResult.total_failed > 0 }">
          <div class="stat-label">Gagal</div>
          <div class="stat-value">{{ syncResult.total_failed }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Durasi</div>
          <div class="stat-value">{{ formatDuration(syncResult.duration_ms) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Total Page</div>
          <div class="stat-value">{{ syncResult.pages_fetched }}</div>
        </div>
      </div>

      <!-- Error Details -->
      <div v-if="syncResult.errors && syncResult.errors.length > 0" class="error-section">
        <h4>⚠️ Detail Error ({{ syncResult.errors.length }})</h4>
        <div class="error-list">
          <div v-for="(error, index) in syncResult.errors" :key="index" class="error-item">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Error Card -->
    <div v-if="errorMessage" class="error-card">
      <div class="error-header">
        <span class="icon">❌</span>
        <h3>Terjadi Kesalahan</h3>
      </div>
      <p class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  ssr: false
})

const { syncAllMembers, isLoadingMember } = usePDPI()
const { isAuthenticated } = useAuth()
const router = useRouter()

const isSyncing = ref(false)
const syncResult = ref<{
  total_fetched: number
  total_synced: number
  total_failed: number
  duration_ms: number
  pages_fetched: number
  errors?: string[]
} | null>(null)
const errorMessage = ref<string | null>(null)

const resultClass = computed(() => {
  if (!syncResult.value) return ''
  return syncResult.value.total_failed === 0 ? 'success' : 'warning'
})

const handleSyncAll = async () => {
  try {
    isSyncing.value = true
    syncResult.value = null
    errorMessage.value = null

    const result = await syncAllMembers()
    syncResult.value = result

    // Show toast notification
    if (result.total_failed === 0) {
      console.log('✅ Sinkronisasi berhasil!')
    } else {
      console.warn('⚠️ Sinkronisasi selesai dengan beberapa error')
    }
  } catch (error: any) {
    console.error('Sync error:', error)
    errorMessage.value = error?.message || 'Gagal melakukan sinkronisasi'
  } finally {
    isSyncing.value = false
  }
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

// Check authentication
const checkAuth = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  if (!isAuthenticated.value) {
    await router.push('/login')
  }
}

onMounted(checkAuth)
</script>

<style scoped>
.pdpi-sync-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-section {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
}

.info-section .icon {
  font-size: 3rem;
}

.info-section .text h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.info-section .text p {
  color: #718096;
  font-size: 0.95rem;
  line-height: 1.5;
}

.btn-sync {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-sync:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-sync:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sync.loading {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-section p {
  color: #4a5568;
  font-weight: 500;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.result-card.success {
  border-left: 4px solid #48bb78;
}

.result-card.warning {
  border-left: 4px solid #ed8936;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.result-header .icon {
  font-size: 1.75rem;
}

.result-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-item.success {
  background: #f0fff4;
}

.stat-item.error {
  background: #fff5f5;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-item.success .stat-value {
  color: #38a169;
}

.stat-item.error .stat-value {
  color: #e53e3e;
}

.error-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.error-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #ed8936;
  margin-bottom: 1rem;
}

.error-list {
  max-height: 300px;
  overflow-y: auto;
  background: #fffaf0;
  border-radius: 8px;
  padding: 1rem;
}

.error-item {
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #744210;
  border-bottom: 1px solid #feebc8;
}

.error-item:last-child {
  border-bottom: none;
}

.error-card {
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.error-header .icon {
  font-size: 1.5rem;
}

.error-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #c53030;
}

.error-message {
  color: #742a2a;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .pdpi-sync-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .card-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-sync {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })

const route = useRoute()
const router = useRouter()
const { $apiFetch } = useNuxtApp()
const toast = useToast()

const id = route.params.id as string
const loading = ref(false)
const saving = ref(false)
const member = ref<any>(null)

// For linking to user
const users = ref<any[]>([])
const selectedUserId = ref<number | null>(null)

// Fetch Member Detail
async function fetchMember() {
  loading.value = true
  try {
    const res: any = await $apiFetch(`/members/${id}`)
    member.value = res.data
    selectedUserId.value = member.value.user_id?.Int64 ? Number(member.value.user_id.Int64) : null
  }
  catch (error: any) {
    toast.add({
      title: 'Gagal memuat data anggota',
      description: error?.data?.message || 'Terjadi kesalahan',
      color: 'error'
    })
  }
  finally {
    loading.value = false
  }
}

// Fetch Users for dropdown
async function fetchUsers() {
  try {
    const res: any = await $apiFetch('/users/get-lists', { query: { limit: 1000, status: 'active' } })
    users.value = res.data?.items?.data || []
  }
  catch (error) {
    console.error('Error fetching users', error)
  }
}

// Save (Update User Link)
async function save() {
  saving.value = true
  try {
    await $apiFetch(`/members/${id}`, {
      method: 'PUT',
      body: { user_id: selectedUserId.value }
    })
    toast.add({ title: 'Berhasil disimpan', color: 'success' })
    fetchMember()
  }
  catch (error: any) {
    toast.add({
      title: 'Gagal menyimpan',
      description: error?.data?.message || 'Terjadi kesalahan',
      color: 'error'
    })
  }
  finally {
    saving.value = false
  }
}

// Sync Single Member
const syncing = ref(false)
async function syncMember() {
  if (!member.value?.npa)
    return
  syncing.value = true
  try {
    await $apiFetch('/pdpi/sync-member', {
      method: 'POST',
      body: { npa: member.value.npa }
    })
    toast.add({ title: 'Sync berhasil', color: 'success' })
    fetchMember()
  }
  catch (error: any) {
    toast.add({
      title: 'Sync gagal',
      description: error?.data?.message || 'Gagal sinkronisasi dengan PDPI',
      color: 'error'
    })
  }
  finally {
    syncing.value = false
  }
}

function formatDate(dateObj: any) {
  if (!dateObj?.Valid)
    return '-'
  return new Date(dateObj.Time).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => {
  fetchMember()
  fetchUsers()
})
</script>

<template>
  <div class="min-h-screen pb-8">
    <!-- Header dengan Gradient Background -->
    <div class="relative mb-8 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6">
      <!-- Gradient Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      
      <!-- Decorative Elements -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />

      <!-- Content -->
      <div class="relative px-4 lg:px-6 pt-8 pb-12">
        <!-- Back Button -->
        <div class="mb-6">
          <UButton
            to="/dashboard/admin/daftar-anggota"
            variant="soft"
            color="white"
            icon="i-lucide-arrow-left"
            size="sm"
            class="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20"
          >
            Kembali ke Daftar
          </UButton>
        </div>

        <!-- Profile Header -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin text-white/80 mx-auto mb-3" />
            <p class="text-white/70">Memuat data anggota...</p>
          </div>
        </div>

        <div v-else-if="member" class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Avatar dengan Gradient Border -->
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-sm group-hover:blur-md transition-all" />
            <div class="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-400 dark:to-primary-500 flex items-center justify-center shadow-xl">
              <UIcon name="i-lucide-user" class="w-12 h-12 md:w-16 md:h-16 text-primary-700 dark:text-primary-900" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-3 mb-2">
              <h1 class="text-3xl md:text-4xl font-bold text-white">
                {{ member.gelar?.String }} {{ member.nama }} {{ member.gelar2?.String }}
              </h1>
              <UBadge
                :label="member.status?.String || 'N/A'"
                :color="member.status?.String === 'Aktif' ? 'success' : 'neutral'"
                size="lg"
                variant="solid"
                class="shadow-lg"
              />
            </div>
            
            <div class="flex flex-wrap items-center gap-4 text-white/90 mb-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-credit-card" class="w-4 h-4" />
                <span class="font-mono font-semibold">{{ member.npa }}</span>
              </div>
              <div v-if="member.cabang?.String" class="flex items-center gap-2">
                <UIcon name="i-lucide-building-2" class="w-4 h-4" />
                <span>{{ member.cabang.String }}</span>
              </div>
              <div v-if="member.email?.String" class="flex items-center gap-2">
                <UIcon name="i-lucide-mail" class="w-4 h-4" />
                <span>{{ member.email.String }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <UButton
                @click="syncMember"
                :loading="syncing"
                icon="i-lucide-refresh-cw"
                color="white"
                variant="soft"
                size="sm"
                class="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20"
              >
                Sync dari PDPI
              </UButton>
              <UButton
                @click="save"
                :loading="saving"
                icon="i-lucide-save"
                color="white"
                size="sm"
                class="shadow-lg"
              >
                Simpan Perubahan
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="member" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Main Info (2 cols) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Data Pribadi dengan Glassmorphism -->
        <UCard class="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <UIcon name="i-lucide-user-circle" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                Data Pribadi
              </h2>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p class="font-medium">{{ member.nama }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIK</label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p class="font-mono">{{ member.nik?.String || '-' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <UIcon name="i-lucide-mail" class="w-3 h-3" />
                Email
              </label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p class="truncate">{{ member.email?.String || '-' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <UIcon name="i-lucide-phone" class="w-3 h-3" />
                No. HP
              </label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p class="font-mono">{{ member.no_hp?.String || '-' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                Tempat Lahir
              </label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p>{{ member.tempat_lahir?.String || '-' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <UIcon name="i-lucide-calendar" class="w-3 h-3" />
                Tanggal Lahir
              </label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p>{{ formatDate(member.tgl_lahir) }}</p>
              </div>
            </div>

            <div class="md:col-span-2 space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <UIcon name="i-lucide-home" class="w-3 h-3" />
                Alamat Rumah
              </label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p class="text-sm">{{ member.alamat_rumah?.String || '-' }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Data Profesi & Keanggotaan -->
        <UCard class="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <UIcon name="i-lucide-briefcase" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
                Data Profesi & Keanggotaan
              </h2>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cabang</label>
              <div class="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-lg border border-emerald-200 dark:border-emerald-700/30">
                <p class="font-medium text-emerald-700 dark:text-emerald-300">{{ member.cabang?.String || '-' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provinsi</label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p>{{ member.provinsi?.String || '-' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alumni</label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p>{{ member.alumni?.String || '-' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tahun Lulus</label>
              <div class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p class="font-mono">{{ member.thn_lulus?.Int64 || '-' }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Dokumen Profesi (STR & SIP) -->
        <UCard class="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <UIcon name="i-lucide-file-text" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
                Dokumen Profesi
              </h2>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- STR Info -->
            <div class="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200 dark:border-purple-700/30">
              <div class="flex items-center gap-2 mb-3">
                <div class="p-2 bg-purple-500 rounded-lg">
                  <UIcon name="i-lucide-shield-check" class="w-4 h-4 text-white" />
                </div>
                <h3 class="font-semibold text-purple-700 dark:text-purple-300">STR (Surat Tanda Registrasi)</h3>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">No. STR</p>
                  <p class="font-mono font-semibold">{{ member.no_str?.String || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Berlaku Sampai</p>
                  <p class="font-medium">{{ formatDate(member.str_berlaku_sampai) }}</p>
                </div>
              </div>
            </div>

            <!-- SIP Info -->
            <div class="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200 dark:border-blue-700/30">
              <div class="flex items-center gap-2 mb-3">
                <div class="p-2 bg-blue-500 rounded-lg">
                  <UIcon name="i-lucide-clipboard-check" class="w-4 h-4 text-white" />
                </div>
                <h3 class="font-semibold text-blue-700 dark:text-blue-300">SIP (Surat Izin Praktik)</h3>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">No. SIP</p>
                  <p class="font-mono font-semibold">{{ member.no_sip?.String || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Berlaku Sampai</p>
                  <p class="font-medium">{{ formatDate(member.sip_berlaku_sampai) }}</p>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Tempat Praktek -->
        <UCard class="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <UIcon name="i-lucide-hospital" class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                Tempat Praktek
              </h2>
            </div>
          </template>

          <div class="space-y-4">
            <div class="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl border border-orange-200 dark:border-orange-700/30">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-star" class="w-4 h-4 text-orange-500" />
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tempat Tugas Utama</p>
              </div>
              <p class="font-medium text-lg">{{ member.tempat_tugas?.String || '-' }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Tempat Praktek 1</p>
                <p class="font-medium">{{ member.tempat_praktek_1?.String || '-' }}</p>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Tempat Praktek 2</p>
                <p class="font-medium">{{ member.tempat_praktek_2?.String || '-' }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column - Sidebar (1 col) -->
      <div class="space-y-6">
        <!-- System Link -->
        <UCard class="backdrop-blur-sm bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 border-primary-200 dark:border-primary-700/30 shadow-xl sticky top-6">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary-500 rounded-lg">
                <UIcon name="i-lucide-link" class="w-5 h-5 text-white" />
              </div>
              <h3 class="font-bold text-primary-700 dark:text-primary-300">System Link</h3>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 block">
                Tautkan ke User Akun
              </label>
              <USelectMenu
                v-model="selectedUserId"
                :options="users"
                value-attribute="id"
                option-attribute="name"
                searchable
                placeholder="Pilih user akun..."
                class="w-full"
              >
                <template #label>
                  <span v-if="selectedUserId" class="font-medium">{{ users.find(u => u.id === selectedUserId)?.name || selectedUserId }}</span>
                  <span v-else class="text-gray-400">Belum bertaut</span>
                </template>
                <template #option="{ option }">
                  <div class="flex flex-col truncate">
                    <span class="truncate font-medium">{{ option.name }}</span>
                    <span class="text-xs text-gray-400 truncate">{{ option.email }}</span>
                  </div>
                </template>
              </USelectMenu>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Hubungkan data anggota dengan akun user login
              </p>
            </div>

            <div v-if="member.user_id?.Int64" class="p-4 bg-success-50 dark:bg-success-900/20 rounded-xl border border-success-200 dark:border-success-700/30">
              <div class="flex items-center gap-2 text-success-700 dark:text-success-300 font-semibold mb-1">
                <UIcon name="i-lucide-check-circle-2" class="w-5 h-5" />
                Terhubung
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                ID: <span class="font-mono">{{ member.user_id.Int64 }}</span>
              </p>
            </div>
            <div v-else class="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold mb-1">
                <UIcon name="i-lucide-alert-circle" class="w-5 h-5" />
                Belum Terhubung
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Pilih user di atas untuk menghubungkan
              </p>
            </div>
          </div>
        </UCard>

        <!-- Sync Info -->
        <UCard class="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                <UIcon name="i-lucide-cloud-download" class="w-5 h-5 text-white" />
              </div>
              <h3 class="font-bold text-gray-700 dark:text-gray-300">Sync Info</h3>
            </div>
          </template>

          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="text-sm text-gray-500 dark:text-gray-400">Terakhir Sync</span>
              <span class="font-mono text-sm font-medium">
                {{ member.synced_at?.Valid ? new Date(member.synced_at.Time).toLocaleDateString('id-ID') : 'Belum pernah' }}
              </span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="text-sm text-gray-500 dark:text-gray-400">Dibuat</span>
              <span class="font-mono text-sm font-medium">{{ new Date(member.created_at).toLocaleDateString('id-ID') }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="text-sm text-gray-500 dark:text-gray-400">Diupdate</span>
              <span class="font-mono text-sm font-medium">{{ new Date(member.updated_at).toLocaleDateString('id-ID') }}</span>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

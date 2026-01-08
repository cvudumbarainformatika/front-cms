<script setup lang="ts">
/**
 * Admin Anggota Management Page
 * Menampilkan daftar anggota dengan tabel interaktif
 * Endpoint: GET /api/v1/users/get-lists
 */

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Manajemen Anggota',
  description: 'Kelola data anggota PDPI'
})

const { $apiFetch } = useNuxtApp()
const toast = useToast()

// Types
interface User {
  id: string
  name: string
  email: string
  phone: string
  cabang: string
  status: 'pending_verification' | 'verified' | 'active' | 'inactive'
  role: 'member' | 'admin' | 'super_admin'
  created_at: string
  updated_at: string
}

interface PaginationData {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

interface UsersResponse {
  success: boolean
  data: {
    items: User[]
    pagination: PaginationData
  }
  message: string
}

// State
const loading = ref(false)
const users = ref<User[]>([])
const pagination = ref<PaginationData>({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})

// Filter & Search
const filters = reactive({
  search: '',
  status: '',
  role: '',
  cabang: ''
})

const q = ref('')
const selectedRows = ref<User[]>([])
const sort = reactive({
  column: 'created_at',
  direction: 'desc' as 'asc' | 'desc'
})

// Modal Confirm State
interface ConfirmModal {
  title: string
  description: string
  confirmText: string
  cancelText: string
  onConfirm: () => Promise<void>
}

const isConfirmModalOpen = ref(false)
const confirmModalLoading = ref(false)
const confirmModal = ref<ConfirmModal>({
  title: '',
  description: '',
  confirmText: 'Hapus',
  cancelText: 'Batal',
  onConfirm: async () => {}
})

// Computed
const searchQuery = computed({
  get: () => q.value,
  set: (value) => {
    q.value = value
    filters.search = value
    page.value = 1
  }
})

const page = ref(1)

// Filter options
const statusOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Pending Verifikasi', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const roleOptions = [
  { label: 'Semua Role', value: 'all' },
  { label: 'Member', value: 'member' },
  { label: 'Admin Pusat', value: 'admin_pusat' },
  { label: 'Super Wilayah', value: 'super_wilayah' },
  { label: 'Super Cabang', value: 'super_cabang' }
]

// Table columns
const columns = [
  {
    key: 'name',
    label: 'Nama',
    sortable: true
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true
  },
  {
    key: 'phone',
    label: 'WhatsApp',
    sortable: false
  },
  {
    key: 'cabang',
    label: 'Cabang',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true
  },
  {
    key: 'created_at',
    label: 'Terdaftar',
    sortable: true
  },
  {
    key: 'actions',
    label: 'Aksi',
    sortable: false
  }
]

// Methods
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', page.value.toString())
    params.append('per_page', pagination.value.per_page.toString())
    
    if (filters.search.trim()) params.append('q', filters.search)
    if (filters.status !== 'all') params.append('status', filters.status)
    if (filters.role !== 'all') params.append('role', filters.role)
    if (filters.cabang.trim()) params.append('cabang', filters.cabang)
    
    params.append('sort', sort.column)
    params.append('order', sort.direction)

    const res = await $apiFetch<UsersResponse>(`/users/get-lists?${params.toString()}`)

    if (res?.success && res?.data) {
      users.value = res.data.items
      pagination.value = res.data.pagination
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal mengambil data anggota',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const handleClearSearch = () => {
  page.value = 1
  q.value = ''
  filters.search = ''
  fetchUsers()
}

const handleSort = (column: string) => {
  if (sort.column === column) {
    sort.direction = sort.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sort.column = column
    sort.direction = 'asc'
  }
  page.value = 1
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

const handlePerPageChange = (newPerPage: number) => {
  pagination.value.per_page = newPerPage
  page.value = 1
}

const handleSelectAll = (value: boolean) => {
  selectedRows.value = value ? users.value : []
}

const navigateToDetail = (user: User) => {
  navigateTo(`/dashboard/admin/anggota/${user.id}`)
}

const handleEdit = (user: User) => {
  navigateTo(`/dashboard/admin/anggota/${user.id}/edit`)
}

const openConfirmModal = (title: string, description: string, confirmText: string, onConfirm: () => Promise<void>) => {
  confirmModal.value.title = title
  confirmModal.value.description = description
  confirmModal.value.confirmText = confirmText
  confirmModal.value.onConfirm = onConfirm
  isConfirmModalOpen.value = true
}

const closeConfirmModal = () => {
  isConfirmModalOpen.value = false
}

const handleConfirmModal = async () => {
  confirmModalLoading.value = true
  try {
    await confirmModal.value.onConfirm()
    closeConfirmModal()
  } finally {
    confirmModalLoading.value = false
  }
}

const handleDelete = async (user: User) => {
  openConfirmModal(
    'Hapus Anggota',
    `Apakah Anda yakin ingin menghapus anggota ${user.name}? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus',
    async () => {
      try {
        await $apiFetch(`/users/delete/${user.id}`, {
          method: 'DELETE'
        })
        
        toast.add({
          title: 'Berhasil',
          description: 'Anggota berhasil dihapus',
          color: 'success'
        })
        
        await fetchUsers()
      } catch (error) {
        toast.add({
          title: 'Error',
          description: 'Gagal menghapus anggota',
          color: 'error'
        })
      }
    }
  )
}

// const handleVerify = async (user: User) => {
//   try {
//     await $apiFetch(`/api/v1/users/patch/${user.id}`, {
//       method: 'PATCH',
//       body: {
//         status: 'verified'
//       }
//     })
    
//     toast.add({
//       title: 'Berhasil',
//       description: 'Anggota berhasil diverifikasi',
//       color: 'success'
//     })
    
//     await fetchUsers()
//   } catch (error) {
//     toast.add({
//       title: 'Error',
//       description: 'Gagal memverifikasi anggota',
//       color: 'error'
//     })
//   }
// }

const handleVerify = async (user: User) => {

  
  

  openConfirmModal(
    'Verifikasi Anggota',
    `Apakah Anda yakin ingin memverifikasi anggota ${user.name}? Anggota akan mendapatkan email konfirmasi dan dapat login ke aplikasi.`,
    'Verifikasi',
    async () => {
      try {
        await $apiFetch(`/users/patch/${user.id}`, {
          method: 'PATCH',
          body: {
            status: 'active'
          }
        })
        
        toast.add({
          title: 'Berhasil',
          description: `${user.name} berhasil diverifikasi`,
          color: 'success'
        })
        
        await fetchUsers()
      } catch (error) {
        toast.add({
          title: 'Error',
          description: 'Gagal memverifikasi anggota',
          color: 'error'
        })
      }
    }
  )
}

// const handleApprove = async (user: User) => {
//   try {
//     await $apiFetch(`/api/v1/users/patch/${user.id}`, {
//       method: 'PATCH',
//       body: {
//         status: 'active'
//       }
//     })
    
//     toast.add({
//       title: 'Berhasil',
//       description: 'Anggota berhasil diaktifkan',
//       color: 'success'
//     })
    
//     await fetchUsers()
//   } catch (error) {
//     toast.add({
//       title: 'Error',
//       description: 'Gagal mengaktifkan anggota',
//       color: 'error'
//     })
//   }
// }

const handleApprove = async (user: User) => {
  openConfirmModal(
    'Aktifkan Anggota',
    `Apakah Anda yakin ingin mengaktifkan anggota ${user.name}? Anggota akan bisa login ke aplikasi.`,
    'Aktifkan',
    async () => {
      try {
        await $apiFetch(`/api/v1/users/patch/${user.id}`, {
          method: 'PATCH',
          body: {
            status: 'active'
          }
        })
        
        toast.add({
          title: 'Berhasil',
          description: `${user.name} berhasil diaktifkan`,
          color: 'success'
        })
        
        await fetchUsers()
      } catch (error) {
        toast.add({
          title: 'Error',
          description: 'Gagal mengaktifkan anggota',
          color: 'error'
        })
      }
    }
  )
}

// Watchers
watch([() => filters.status, () => filters.role, () => filters.cabang], () => {
  page.value = 1
  fetchUsers()
})

watch(() => page.value, () => {
  fetchUsers()
})

watch(() => sort, () => {
  page.value = 1
  fetchUsers()
}, { deep: true })

// Watch for debugging
watch(() => isConfirmModalOpen.value, (newVal) => {
  console.log('isConfirmModalOpen changed:', newVal)
})

// Lifecycle
onMounted(() => {
  fetchUsers()
})

// Helper functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending_verification: 'warning',
    verified: 'info',
    active: 'success',
    inactive: 'neutral'
  }
  return colors[status] || 'neutral'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending_verification: 'Pending Verifikasi',
    verified: 'Verified',
    active: 'Active',
    inactive: 'Inactive'
  }
  return labels[status] || status
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    member: 'info',
    admin: 'warning',
    super_admin: 'error'
  }
  return colors[role] || 'neutral'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    member: 'Member',
    admin: 'Admin',
    super_admin: 'Super Admin'
  }
  return labels[role] || role
}
</script>

<template>

  <div class="space-y-4">
    <!-- Header dengan Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex-1">
        <p class="text-sm text-gray-600">
          Total Anggota: <span class="font-semibold text-gray-900">{{ pagination.total }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-lucide-plus"
          label="Tambah Anggota"
          to="/dashboard/admin/anggota/create"
          color="primary"
        />
        <UButton
          icon="i-lucide-download"
          label="Export"
          variant="soft"
          color="neutral"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Search -->
      <div>
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Cari nama, email..."
          size="md"
          @change="fetchUsers"
        >
        <template v-if="searchQuery?.length" #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-circle-x"
            aria-label="Clear input"
            @click="handleClearSearch"
          />
        </template>
      </UInput>
      </div>

      <!-- Status Filter -->
      <div>
        <USelect
          v-model="filters.status"
          :items="statusOptions"
          value-key="value"
          placeholder="Filter Status"
          size="md"
        />
      </div>

      <!-- Role Filter -->
      <div>
        <USelect
          v-model="filters.role"
          :items="roleOptions"
          value-key="value"
          placeholder="Filter Role"
          size="md"
        />
      </div>

      <!-- Clear Filters -->
      <div class="flex gap-2">
        <UButton
          variant="outline"
          color="primary"
          icon="i-lucide-x"
          @click="() => {
            filters.search = ''
            filters.status = ''
            filters.role = ''
            filters.cabang = ''
            page = 1
          }"
          label="Clear"
        />
      </div>
    </div>

    <!-- Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Daftar Anggota</h2>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-refresh-cw"
              variant="ghost"
              color="neutral"
              @click="fetchUsers"
              :loading="loading"
            />
          </div>
        </div>
      </template>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <!-- Header -->
          <thead class="border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th class="px-4 py-3 text-left">
                <UCheckbox
                  :model-value="selectedRows.length === users.length && users.length > 0"
                  @update:model-value="handleSelectAll"
                />
              </th>
              <th
                v-for="column in columns.filter(c => c.key !== 'actions')"
                :key="column.key"
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <button
                  v-if="column.sortable"
                  @click="handleSort(column.key)"
                  class="flex items-center gap-1 hover:text-primary"
                >
                  {{ column.label }}
                  <UIcon
                    v-if="sort.column === column.key"
                    :name="sort.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
                    class="w-4 h-4"
                  />
                </button>
                <span v-else>{{ column.label }}</span>
              </th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Aksi
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
            >
              <!-- Checkbox -->
              <td class="px-4 py-3">
                <UCheckbox
                  :model-value="selectedRows.includes(user)"
                  @update:model-value="(value) => {
                    if (value) {
                      selectedRows.push(user)
                    } else {
                      selectedRows = selectedRows.filter(u => u.id !== user.id)
                    }
                  }"
                />
              </td>

              <!-- Name -->
              <td class="px-4 py-3">
                <button
                  @click="navigateToDetail(user)"
                  class="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary"
                >
                  {{ user.name }}
                </button>
              </td>

              <!-- Email -->
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {{ user.email }}
              </td>

              <!-- Phone -->
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {{ user.phone }}
              </td>

              <!-- Cabang -->
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {{ user.cabang }}
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <UBadge
                  :color="getStatusColor(user.status)"
                  variant="soft"
                >
                  {{ getStatusLabel(user.status) }}
                </UBadge>
              </td>

              <!-- Role -->
              <td class="px-4 py-3">
                <UBadge
                  :color="getRoleColor(user.role)"
                  variant="soft"
                >
                  {{ getRoleLabel(user.role) }}
                </UBadge>
              </td>

              <!-- Terdaftar -->
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(user.created_at) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- Verify Button (untuk pending) -->
                  <UButton
                    v-if="user?.status === 'pending'"
                    icon="i-lucide-check"
                    size="xs"
                    color="success"
                    variant="soft"
                    @click="handleVerify(user)"
                    title="Verifikasi"
                  />

                  <!-- Approve Button (untuk verified) -->
                 

                  <!-- Edit Button -->
                  <UButton
                    icon="i-lucide-edit"
                    size="xs"
                    color="neutral"
                    variant="soft"
                    @click="handleEdit(user)"
                    title="Edit"
                  />

                  <!-- Delete Button -->
                  <UButton
                    icon="i-lucide-trash-2"
                    size="xs"
                    color="error"
                    variant="soft"
                    @click="handleDelete(user)"
                    title="Hapus"
                  />
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="users.length === 0 && !loading">
              <td :colspan="columns.length + 1" class="px-4 py-12 text-center">
                <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p class="text-gray-500">Tidak ada anggota ditemukan</p>
              </td>
            </tr>

            <!-- Loading State -->
            <tr v-if="loading">
              <td :colspan="columns.length + 1" class="px-4 py-12 text-center">
                <USkeleton class="h-8 w-full" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <template #footer>
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Tampilkan</span>
            <USelect
              v-model="pagination.per_page"
              :options="[10, 25, 50, 100]"
              @update:model-value="handlePerPageChange"
              size="xs"
            />
            <span class="text-sm text-gray-600">per halaman</span>
          </div>

          <div class="flex items-center justify-center gap-2">
            <UButton
              icon="i-lucide-chevron-left"
              variant="ghost"
              color="neutral"
              :disabled="page === 1"
              @click="handlePageChange(page - 1)"
            />

            <span class="text-sm font-medium">
              {{ page }} dari {{ pagination.last_page }}
            </span>

            <UButton
              icon="i-lucide-chevron-right"
              variant="ghost"
              color="neutral"
              :disabled="page === pagination.last_page"
              @click="handlePageChange(page + 1)"
            />
          </div>

          <div class="text-sm text-gray-600">
            Total: {{ pagination.total }} anggota
          </div>
        </div>
      </template>
    </UCard>
  
    <UModal v-model:open="isConfirmModalOpen" description="" title="">
    <!-- <UButton label="Open" color="neutral" variant="subtle" /> -->
      <template #header>
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-yellow-500" />
          <span class="font-semibold text-lg">{{ confirmModal.title }}</span>
      </template>
    <template #body>
      <p>{{ confirmModal.description }}</p>
      
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Submit" color="error" :loading="confirmModalLoading"
            @click="handleConfirmModal" />
    </template>
  </UModal>
  
  </div>

  
</template>

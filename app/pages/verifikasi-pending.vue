<script setup lang="ts">
/**
 * Halaman Verifikasi Pending
 * Ditampilkan setelah user berhasil register
 * Menginformasikan user bahwa akun sedang menunggu verifikasi admin
 */

definePageMeta({
  layout: 'verification'
})

useSeoMeta({
  title: 'Verifikasi Akun Pending',
  description: 'Akun Anda sedang menunggu verifikasi dari admin'
})

const router = useRouter()
const route = useRoute()

// Ambil email dari query parameter
const email = computed(() => route.query.email as string || 'user@example.com')

// Timeline berapa lama verifikasi
const verificationTime = ref('1 x 24 jam kerja')

// Status counts untuk tambah visual
const stats = [
  {
    icon: 'i-lucide-clock',
    label: 'Waktu Tunggu',
    value: '24 Jam Kerja',
    color: 'blue'
  },
  {
    icon: 'i-lucide-shield-check',
    label: 'Status',
    value: 'Menunggu Verifikasi',
    color: 'amber'
  },
  {
    icon: 'i-lucide-mail',
    label: 'Notifikasi',
    value: 'Akan Dikirim Email',
    color: 'green'
  }
]

// Steps dalam proses verifikasi
const steps = [
  {
    title: 'Pendaftaran Selesai',
    description: 'Data Anda telah kami terima dengan baik',
    status: 'completed'
  },
  {
    title: 'Verifikasi Admin',
    description: 'Tim admin akan memeriksa data Anda dalam 24 jam kerja',
    status: 'pending'
  },
  {
    title: 'Akun Diaktifkan',
    description: 'Anda akan menerima email konfirmasi untuk login',
    status: 'waiting'
  }
]

const handleBackToHome = () => {
  router.push('/')
}

const handleResendEmail = () => {
  // TODO: Implement resend email verification
  alert('Email verifikasi akan dikirim ulang ke ' + email.value)
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <!-- Main Card -->
    <UCard class="shadow-2xl border-0">
      <template #header>
        <div class="flex flex-col items-center pt-6">
          <!-- Success Icon with Animation -->
          <div class="relative mb-6">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-30 animate-pulse"></div>
            <div class="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full">
              <UIcon name="i-lucide-check-circle" class="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 text-center mb-2">
            Pendaftaran Berhasil!
          </h1>
          <p class="text-gray-500 text-center text-lg">
            Akun Anda sedang menunggu verifikasi
          </p>
        </div>
      </template>

      <!-- Content -->
      <div class="space-y-8">
        <!-- Alert Info -->
        <UAlert
          icon="i-lucide-info"
          color="blue"
          variant="soft"
          title="Akun Sedang Diverifikasi"
          description="Tim admin kami akan memverifikasi data Anda dalam waktu 1 x 24 jam kerja. Anda akan menerima email notifikasi setelah proses verifikasi selesai."
        />

        <!-- Email Display -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <p class="text-sm text-gray-600 mb-2">Email Terdaftar</p>
          <p class="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <UIcon name="i-lucide-mail" class="w-5 h-5 text-blue-600" />
            {{ email }}
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(stat, idx) in stats"
            :key="idx"
            class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition"
          >
            <div class="flex items-center justify-between mb-3">
              <UIcon :name="stat.icon" :class="`w-6 h-6 text-${stat.color}-500`" />
            </div>
            <p class="text-sm text-gray-600 mb-1">{{ stat.label }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ stat.value }}</p>
          </div>
        </div>

        <!-- Timeline -->
        <div class="space-y-4">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <UIcon name="i-lucide-loader" class="w-5 h-5" />
            Proses Verifikasi
          </h3>
          
          <div class="space-y-3">
            <div
              v-for="(step, idx) in steps"
              :key="idx"
              class="flex gap-4"
            >
              <!-- Step Circle -->
              <div class="flex flex-col items-center">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                    step.status === 'completed' ? 'bg-green-100 text-green-600' : '',
                    step.status === 'pending' ? 'bg-blue-100 text-blue-600 animate-pulse' : '',
                    step.status === 'waiting' ? 'bg-gray-100 text-gray-400' : ''
                  ]"
                >
                  <UIcon
                    v-if="step.status === 'completed'"
                    name="i-lucide-check"
                    class="w-5 h-5"
                  />
                  <UIcon
                    v-else-if="step.status === 'pending'"
                    name="i-lucide-hourglass"
                    class="w-5 h-5"
                  />
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div
                  v-if="idx !== steps.length - 1"
                  class="w-1 h-8 bg-gradient-to-b from-gray-300 to-gray-100 my-1"
                ></div>
              </div>

              <!-- Step Content -->
              <div class="pb-4">
                <p class="font-semibold text-gray-900">{{ step.title }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-500">
          <h4 class="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5" />
            Informasi Penting
          </h4>
          <ul class="space-y-2 text-sm text-amber-800">
            <li class="flex gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Periksa email Anda secara berkala untuk notifikasi verifikasi</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Jika tidak menerima email dalam 24 jam, silakan hubungi admin</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Pastikan data yang Anda masukkan sudah benar</span>
            </li>
          </ul>
        </div>

        <!-- Contact Support -->
        <div class="bg-blue-50 rounded-lg p-6 text-center">
          <p class="text-sm text-gray-600 mb-3">
            Butuh bantuan? Hubungi tim support kami
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <UButton
              variant="ghost"
              icon="i-lucide-mail"
              to="mailto:admin@example.com"
            >
              Email: admin@example.com
            </UButton>
            <UButton
              variant="ghost"
              icon="i-lucide-phone"
              to="tel:+6212345678"
            >
              WhatsApp: +62 1234 5678
            </UButton>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <template #footer>
        <div class="flex flex-col sm:flex-row gap-3 justify-between">
          <UButton
            variant="soft"
            color="gray"
            @click="handleResendEmail"
            icon="i-lucide-refresh-cw"
          >
            Kirim Ulang Email
          </UButton>
          <UButton
            @click="handleBackToHome"
            icon="i-lucide-home"
            class="flex-1 sm:flex-none"
          >
            Kembali ke Beranda
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>

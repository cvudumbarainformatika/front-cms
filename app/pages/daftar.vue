<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Daftar Anggota - PDPI',
  description: 'Bergabunglah dengan Perhimpunan Dokter Paru Indonesia'
})

const { register } = useAuth()
const toast = useToast()
const router = useRouter()
const isLoading = ref(false)

// Schema validasi
const schema = z.object({
  name: z.string().min(3, 'Nama lengkap harus diisi (min 3 karakter)'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
  cabang: z.any().refine(val => val && (val.value || val), 'Pilih asal cabang/provinsi'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Password tidak sama",
  path: ["passwordConfirm"],
})

type Schema = z.output<typeof schema>

const state = reactive({
  name: undefined as string | undefined,
  email: undefined as string | undefined,
  phone: undefined as string | undefined,
  cabang: undefined as any,
  password: undefined as string | undefined,
  passwordConfirm: undefined as string | undefined
})

// Dummy branches berdasarkan provinsi Indonesia
const branches = ref([
  { label: 'Pusat (Jakarta)', value: 'pusat' },
  { label: 'Sumatera Utara', value: 'sumatera_utara' },
  { label: 'Sumatera Barat', value: 'sumatera_barat' },
  { label: 'Riau', value: 'riau' },
  { label: 'Jambi', value: 'jambi' },
  { label: 'Sumatera Selatan', value: 'sumatera_selatan' },
  { label: 'Bengkulu', value: 'bengkulu' },
  { label: 'Lampung', value: 'lampung' },
  { label: 'Bangka Belitung', value: 'bangka_belitung' },
  { label: 'Riau Islands', value: 'riau_islands' },
  { label: 'DKI Jakarta', value: 'jakarta' },
  { label: 'Jawa Barat', value: 'jawa_barat' },
  { label: 'Jawa Tengah', value: 'jawa_tengah' },
  { label: 'DI Yogyakarta', value: 'yogyakarta' },
  { label: 'Jawa Timur', value: 'jawa_timur' },
  { label: 'Banten', value: 'banten' },
  { label: 'Bali', value: 'bali' },
  { label: 'Nusa Tenggara Barat', value: 'nusa_tenggara_barat' },
  { label: 'Nusa Tenggara Timur', value: 'nusa_tenggara_timur' },
  { label: 'Kalimantan Barat', value: 'kalimantan_barat' },
  { label: 'Kalimantan Tengah', value: 'kalimantan_tengah' },
  { label: 'Kalimantan Selatan', value: 'kalimantan_selatan' },
  { label: 'Kalimantan Timur', value: 'kalimantan_timur' },
  { label: 'Kalimantan Utara', value: 'kalimantan_utara' },
  { label: 'Sulawesi Utara', value: 'sulawesi_utara' },
  { label: 'Sulawesi Tengah', value: 'sulawesi_tengah' },
  { label: 'Sulawesi Selatan', value: 'sulawesi_selatan' },
  { label: 'Sulawesi Tenggara', value: 'sulawesi_tenggara' },
  { label: 'Gorontalo', value: 'gorontalo' },
  { label: 'Sulawesi Barat', value: 'sulawesi_barat' },
  { label: 'Maluku', value: 'maluku' },
  { label: 'Maluku Utara', value: 'maluku_utara' },
  { label: 'Papua', value: 'papua' },
  { label: 'Papua Barat', value: 'papua_barat' },
  { label: 'Papua Tengah', value: 'papua_tengah' },
  { label: 'Papua Pegunungan', value: 'papua_pegunungan' },
  { label: 'Papua Selatan', value: 'papua_selatan' }
])

function onError(event: any) {
  console.log('Validation Error:', event.errors)
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('Submitting form with state:', state)
  
  if (isLoading.value) return
  isLoading.value = true

  try {
    // Extract cabang value from state (Object binding defensive)
    const cabangValue = state.cabang?.value || state.cabang

    // Simulasi register
    await register({
      name: state.name!,
      email: state.email!,
      password: state.password!,
      phone: state.phone!,
      cabang: cabangValue
    })
    
    toast.add({
      title: 'Pendaftaran Berhasil',
      description: 'Silakan tunggu verifikasi dari admin',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })

    // Redirect ke halaman verifikasi pending dengan email sebagai query param
    setTimeout(() => {
      router.push({
        path: '/verifikasi-pending',
        query: { email: state.email }
      })
    }, 1000)

  } catch (error: any) {
    console.error('Registration failed:', error)
    toast.add({
      title: 'Gagal Mendaftar',
      description: error.message || 'Terjadi kesalahan sistem',
      color: 'error'
    })
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto w-full">
    <div class="sm:mx-auto sm:w-full">
      <div class="text-center mb-6">
        <div class="flex justify-center mb-4">
          <OrganizationLogo size="2xl" :show-text="false"   />
        </div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Pendaftaran Anggota
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Lengkapi data diri Anda untuk bergabung
        </p>
      </div>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-5"
        @submit="onSubmit"
        @error="onError"
      >
        <div class="grid grid-cols-1">
          <!-- Nama Lengkap -->
          <UFormField label="Nama Lengkap (dengan gelar)" name="name" required>
            <UInput
              v-model="state.name"
              placeholder="Contoh: Dr. dr. Budi Santoso, Sp.P(K)"
              icon="i-lucide-user"
              size="md"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Grid: Email & Phone -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Alamat Email" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="nama@email.com"
              icon="i-lucide-mail"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Nomor WhatsApp" name="phone" required>
            <UInput
              v-model="state.phone"
              placeholder="0812..."
              icon="i-lucide-phone"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Asal Cabang/Provinsi -->
        <UFormField label="Asal Cabang/Provinsi" name="cabang" required>
          <USelectMenu
            v-model="state.cabang"
            :items="branches"
            searchable
            searchable-placeholder="Cari provinsi/cabang..."
            class="w-full"
          />
        </UFormField>

        <USeparator />

        <!-- Grid: Password -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Password" name="password" required>
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Min. 8 karakter"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Konfirmasi Password" name="passwordConfirm" required>
            <UInput
              v-model="state.passwordConfirm"
              type="password"
              placeholder="Ulangi password"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="pt-2">
          <UButton
            type="submit"
            block
            size="lg"
            :loading="isLoading"
          >
            Daftar Sekarang
          </UButton>
        </div>
      </UForm>
      
      <p class="mt-6 text-center text-xs text-gray-500">
        Sudah punya akun?
        <ULink to="/login" class="text-primary font-medium hover:underline">
          Masuk disini
        </ULink>
      </p>
    </div>
  </div>
</template>

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
  // Validation for Select Menu (Object) - Gunakan z.any() agar tidak crash dengan object binding
  category: z.any().refine(val => val && (val.value || val), 'Pilih kategori keanggotaan'),
  branchId: z.any().refine(val => val && (val.value || val), 'Pilih cabang asal'),
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
  category: undefined as any,
  branchId: undefined as any,
  password: undefined as string | undefined,
  passwordConfirm: undefined as string | undefined
})

const categories = ref([
  { label: 'Anggota Biasa (Dokter Paru)', value: 'biasa' },
  { label: 'Anggota Muda (Residen)', value: 'muda' },
  { label: 'Anggota Luar Biasa', value: 'luar_biasa' }
])

const branches = ref([
  { label: 'Pusat (Jakarta)', value: 1 },
  { label: 'Cabang Jawa Barat', value: 2 },
  { label: 'Cabang Jawa Timur', value: 3 },
  { label: 'Cabang Jawa Tengah', value: 4 },
  { label: 'Cabang Sumatera Utara', value: 5 }
])

function onError(event: any) {
  console.log('Validation Error:', event.errors)
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('Submitting form with state:', state)
  
  if (isLoading.value) return
  isLoading.value = true

  try {
    // Extract values directly from state (Object binding defensive)
    // Handle possibility of value being object or primitive (jika user switch methods)
    const categoryValue = state.category?.value || state.category
    const branchValue = state.branchId?.value || state.branchId

    // Simulasi register
    await register({
      name: state.name!,
      email: state.email!,
      password: state.password!,
      phone: state.phone!,
      category: categoryValue,
      branchId: branchValue
    })
    
    toast.add({
      title: 'Pendaftaran Berhasil',
      description: 'Selamat datang di Portal Anggota PDPI',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })

    // Redirect ke dashboard
    setTimeout(() => {
      router.push('/dashboard')
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
          <OrganizationLogo class="h-10 w-auto text-3xl" />
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

        <!-- Grid: Kategori & Cabang -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Kategori Keanggotaan" name="category" required>
             <USelectMenu
                v-model="state.category"
                :items="categories"
                searchable
                searchable-placeholder="Cari kategori..."
                class="w-full"
             />
          </UFormField>

          <UFormField label="Asal Cabang" name="branchId" required>
            <USelectMenu
              v-model="state.branchId"
              :items="branches"
              searchable
              searchable-placeholder="Cari cabang..."
              class="w-full"
            />
          </UFormField>
        </div>

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

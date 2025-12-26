<script setup lang="ts">
/**
 * Login Page - Updated
 * Halaman login dengan dummy role selection untuk testing
 */

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Masuk',
  description: 'Masuk ke portal anggota PDPI'
})

const { login } = useAuth()
const toast = useToast()
const router = useRouter()

const loading = ref(false)

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Masukkan email Anda',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Masukkan password Anda'
}]

const schema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter')
})

type Schema = z.output<typeof schema>

// Demo role selection
const demoRole = ref('member')
const demoRoles = [
  { label: 'Anggota', value: 'member' },
  { label: 'Admin Cabang', value: 'admin_cabang' },
  { label: 'Admin Wilayah', value: 'admin_wilayah' },
  { label: 'Admin Pusat', value: 'admin_pusat' }
]

async function onSubmit(_payload: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    await login(demoRole.value as any)

    toast.add({
      title: 'Berhasil masuk!',
      description: 'Anda akan diarahkan ke dashboard.',
      color: 'success'
    })

    await router.push('/dashboard')
  } catch (error) {
    toast.add({
      title: 'Gagal masuk',
      description: 'Email atau password salah.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto space-y-6">
    <div class="text-center">
      <OrganizationLogo size="lg" class="justify-center mb-4" />
      <h1 class="text-xl font-bold text-highlighted">Selamat Datang</h1>
      <p class="text-muted text-sm">Masuk ke portal anggota PDPI</p>
    </div>

    <!-- Demo Role Selector -->
    <UAlert
      icon="i-lucide-info"
      color="info"
      variant="subtle"
      title="Mode Demo"
      description="Pilih role untuk testing (fitur ini akan dihapus di production)"
    />

    <UFormField label="Pilih Role Demo" name="demo-role">
      <USelect
        v-model="demoRole"
        :items="demoRoles"
        class="w-full"
      />
    </UFormField>

    <USeparator label="atau login manual" />

    <UAuthForm
      :fields="fields"
      :schema="schema"
      :loading="loading"
      submit-label="Masuk"
      @submit="onSubmit"
    >
      <template #description>
        Belum punya akun?
        <ULink to="/daftar" class="text-primary font-medium">
          Daftar sekarang
        </ULink>.
      </template>

      <template #password-hint>
        <ULink to="/lupa-password" class="text-primary font-medium" tabindex="-1">
          Lupa password?
        </ULink>
      </template>

      <template #footer>
        Dengan masuk, Anda menyetujui
        <ULink to="/syarat-ketentuan" class="text-primary font-medium">
          Syarat & Ketentuan
        </ULink> kami.
      </template>
    </UAuthForm>
  </div>
</template>

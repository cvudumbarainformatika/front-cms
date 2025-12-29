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

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    await login(payload.data.email, payload.data.password)

    toast.add({
      title: 'Berhasil masuk!',
      description: 'Anda akan diarahkan ke dashboard.',
      color: 'success'
    })

    await router.push('/dashboard')
  } catch (_error) {
    console.error('Login error:', _error)
    toast.add({
      title: 'Gagal masuk',
      description: 'Email atau password salah atau server tidak tersedia.',
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
      <OrganizationLogo
        size="2xl"
        class="justify-center mb-4"
        :show-text="false"
      />
      <h1 class="text-xl font-bold text-highlighted">
        Selamat Datang
      </h1>
      <p class="text-muted text-sm">
        Masuk ke portal anggota PDPI
      </p>
    </div>

    <UAuthForm
      :fields="fields"
      :schema="schema"
      :loading="loading"
      submit-label="Masuk"
      @submit="onSubmit"
    >
      <template #password-hint>
        <ULink
          to="/lupa-password"
          class="text-primary font-medium"
          tabindex="-1"
        >
          Lupa password?
        </ULink>
      </template>

      <template #footer>
        <USeparator label="..." class="my-4" />
        Dengan masuk, Anda menyetujui
        <ULink
          to="/syarat-ketentuan"
          class="text-primary font-medium"
        >
          Syarat & Ketentuan
        </ULink> kami.

        <div class="text-center pt-4">
          Belum punya akun?
          <ULink
            to="/daftar"
            class="text-primary font-medium"
          >
            Daftar sekarang
          </ULink>.
        </div>
      </template>
    </UAuthForm>
  </div>
</template>

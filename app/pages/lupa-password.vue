<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Lupa Password',
  description: 'Reset password akun anggota PDPI'
})

const toast = useToast()
const loading = ref(false)

const fields = [{
  name: 'email',
  type: 'email' as const,
  label: 'Email',
  placeholder: 'Masukkan email terdaftar',
  required: true
}]

const schema = z.object({
  email: z.email('Email tidak valid')
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.add({
      title: 'Email Terkirim',
      description: `Link reset password telah dikirim ke ${event.data.email}`,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Gagal Mengirim',
      description: 'Terjadi kesalahan, silakan coba lagi',
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
      <h1 class="text-xl font-bold text-highlighted">Reset Password</h1>
      <p class="text-muted text-sm">Masukkan email untuk menerima link reset</p>
    </div>

    <UAuthForm
      :fields="fields"
      :schema="schema"
      :loading="loading"
      submit-label="Kirim Link Reset"
      @submit="onSubmit"
    >
      <template #description>
        Ingat password Anda?
        <ULink to="/login" class="text-primary font-medium">
          Masuk kembali
        </ULink>
      </template>
    </UAuthForm>
  </div>
</template>

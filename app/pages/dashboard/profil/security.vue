<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const { isAuthenticated, changePassword } = useAuth()
const router = useRouter()
const toast = useToast()
const loading = ref(false)

// Cek authentikasi saat komponen di mount
onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))

  if (!isAuthenticated.value) {
    await router.push('/login')
  }
})

// Password change form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini diperlukan'),
  newPassword: z.string().min(8, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string().min(8, 'Konfirmasi password diperlukan')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword']
})
type PasswordSchema = z.output<typeof passwordSchema>

const passwordState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Security settings
const securityState = reactive({
  ingat_saya: false,
  logout_otomatis: true
})

async function onChangePassword(event: FormSubmitEvent<PasswordSchema>) {
  loading.value = true
  try {
    // Call backend API untuk change password
    const result = await changePassword(event.data)
    
    toast.add({
      title: 'Password Berhasil Diubah',
      description: result?.message || 'Password Anda telah diperbarui',
      icon: 'i-lucide-check',
      color: 'success'
    })
    
    // Reset form
    passwordState.currentPassword = ''
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
  } catch (error: any) {
    toast.add({
      title: 'Gagal Mengubah Password',
      description: error.message || 'Terjadi kesalahan saat mengubah password',
      icon: 'i-lucide-alert-circle',
      color: 'warning'
    })
  } finally {
    loading.value = false
  }
}

const links = [[{
  label: 'Profile',
  icon: 'i-lucide-user',
  to: '/dashboard/profil',
  exact: true
}, {
  label: 'Security',
  icon: 'i-lucide-settings',
  to: '/dashboard/profil/security'
}]] satisfies NavigationMenuItem[][]

definePageMeta({
  layout: 'dashboard'
})
</script>

<template>
  <div class="space-y-4">
    <UDashboardToolbar>
      <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
      <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
    </UDashboardToolbar>
    <div class="flex flex-center justify-center">
      <UCard class="mt-4 max-w-xl">
        <template #header>
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Keamanan Akun
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ubah password dan kelola sesi Anda.
          </p>
        </template>

        <div class="space-y-4">
          <!-- Change Password Form -->
          <UForm :schema="passwordSchema" :state="passwordState" @submit="onChangePassword" class="space-y-4">
            <UFormField label="Password Saat Ini" name="currentPassword" 
            description="Masukkan Password Saat ini" class="flex max-sm:flex-col justify-between items-start gap-4">
              <UInput type="password" v-model="passwordState.currentPassword" placeholder="Masukkan password saat ini" />
            </UFormField>

            <UFormField label="Password Baru" name="newPassword" class="flex max-sm:flex-col justify-between items-start gap-4" description="Masukkan password baru (minimal 6 karakter)">
              <UInput type="password" v-model="passwordState.newPassword" placeholder="password baru" />
            </UFormField>

            <UFormField label="Konfirmasi Password Baru" name="confirmPassword" class="flex max-sm:flex-col justify-between items-start gap-4" description="Konfirmasi password baru">
              <UInput type="password" v-model="passwordState.confirmPassword" placeholder="Konfirmasi" />
            </UFormField>

            <div class="flex justify-end pt-4">
              <UButton
                type="submit"
                label="Ganti Password"
                :loading="loading"
              />
            </div>
          </UForm>

          <USeparator />

          <!-- Security Settings -->
          <UFormField
            label="Ingat Saya"
            description="Biarkan saya tetap login selama 30 hari."
            class="flex items-center justify-between not-last:pb-4 gap-2"
          >
            <USwitch v-model="securityState.ingat_saya" />
          </UFormField>

          <USeparator />

          <UFormField
            label="Logout Otomatis"
            description="Logout otomatis setelah 30 menit tidak aktif."
            class="flex items-center justify-between not-last:pb-4 gap-2"
          >
            <USwitch v-model="securityState.logout_otomatis" />
          </UFormField>
        </div>
      </UCard>
    </div>
  </div>
</template>

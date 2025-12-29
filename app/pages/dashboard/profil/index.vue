<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'protected',
  ssr: false
})

const { user, updateProfile } = useAuth()
const toast = useToast()
const loading = ref(false)
const fileRef = ref<HTMLInputElement>()

// Modals state
const isPasswordModalOpen = ref(false)
const isTwoFactorModalOpen = ref(false)

const items = [{
  label: 'Data Diri',
  icon: 'i-lucide-user',
  slot: 'personal'
}, {
  label: 'Keamanan',
  icon: 'i-lucide-lock',
  slot: 'security'
}]

// --- Bagian Profil ---
const profileSchema = z.object({
  name: z.string().min(2, 'Nama terlalu pendek'),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional()
})
type ProfileSchema = z.output<typeof profileSchema>
const state = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  phone: user.value?.phone ?? '',
  address: user.value?.address ?? '',
  bio: user.value?.bio ?? '',
  avatar: user.value?.avatar ?? ''
})

// --- Bagian Keamanan ---
const securityState = reactive({
  ingat_saya: false,
  logout_otomatis: true
})

const passwordState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

async function onSaveProfile(event: FormSubmitEvent<ProfileSchema>) {
  loading.value = true
  try {
    await updateProfile(event.data)
    toast.add({
      title: 'Profil Diperbarui',
      icon: 'i-lucide-check',
      color: 'primary'
    })
  } catch (error: any) {
    toast.add({
      title: 'Gagal Memperbarui',
      description: error.message,
      icon: 'i-lucide-alert-circle',
      color: 'neutral'
    })
  } finally {
    loading.value = false
  }
}

async function onChangePassword() {
  loading.value = true
  // Di sini Anda akan memanggil API untuk mengubah password
  console.log(passwordState)
  setTimeout(() => {
    loading.value = false
    isPasswordModalOpen.value = false
    toast.add({
      title: 'Password Berhasil Diubah',
      icon: 'i-lucide-check',
      color: 'success'
    })
    // Reset state password
    passwordState.currentPassword = ''
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
  }, 1500)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) {
    return
  }
  state.avatar = URL.createObjectURL(input.files[0])
  toast.add({ title: 'Gambar dipilih', description: 'Jangan lupa Simpan Perubahan.' })
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Profil Saya</h1>
      <p class="text-muted">Kelola informasi data diri dan keamanan akun</p>
    </div>

    <UTabs :items="items" class="w-full">
      <template #personal="{ item }">
        <UCard class="mt-4">
          <template #header>
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Profil Publik
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Informasi ini akan ditampilkan secara publik.
            </p>
          </template>

          <UForm :schema="profileSchema" :state="state" class="space-y-4" @submit="onSaveProfile">
            <UFormGroup
              name="name"
              label="Nama"
              description="Nama ini akan muncul di profil publik Anda."
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <UInput
                v-model="state.name"
                autocomplete="off"
                icon="i-lucide-user"
              />
            </UFormGroup>
            <USeparator />
            <UFormGroup
              name="email"
              label="Email"
              description="Digunakan untuk masuk dan notifikasi."
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <UInput
                v-model="state.email"
                type="email"
                autocomplete="off"
                icon="i-lucide-mail"
                disabled
              />
            </UFormGroup>
            <USeparator />
            <UFormGroup
              name="phone"
              label="Telepon"
              description="Nomor telepon aktif untuk dihubungi."
              class="flex max-sm:flex-col justify-between items-start gap-4"
            >
              <UInput
                v-model="state.phone"
                type="tel"
                autocomplete="off"
                icon="i-lucide-phone"
              />
            </UFormGroup>
            <USeparator />
            <UFormGroup
              name="avatar"
              label="Avatar"
              description="JPG, GIF atau PNG. Maks 1MB."
              class="flex max-sm:flex-col justify-between sm:items-center gap-4"
            >
              <div class="flex flex-wrap items-center gap-3">
                <UAvatar
                  :src="state.avatar"
                  :alt="state.name"
                  size="lg"
                />
                <UButton
                  label="Pilih Gambar"
                  color="neutral"
                  @click="onFileClick"
                />
                <input
                  ref="fileRef"
                  type="file"
                  class="hidden"
                  accept=".jpg, .jpeg, .png, .gif"
                  @change="onFileChange"
                >
              </div>
            </UFormGroup>
            <USeparator />
            <UFormGroup
              name="address"
              label="Alamat"
              description="Alamat domisili Anda."
              class="flex max-sm:flex-col justify-between items-start gap-4"
              :ui="{ container: 'w-full' }"
            >
              <UTextarea
                v-model="state.address"
                :rows="3"
                autoresize
                class="w-full"
              />
            </UFormGroup>
            <USeparator />
            <UFormGroup
              name="bio"
              label="Bio"
              description="Deskripsi singkat tentang diri Anda."
              class="flex max-sm:flex-col justify-between items-start gap-4"
              :ui="{ container: 'w-full' }"
            >
              <UTextarea
                v-model="state.bio"
                :rows="5"
                autoresize
                class="w-full"
              />
            </UFormGroup>

            <div class="flex justify-end pt-4">
              <UButton
                type="submit"
                label="Simpan Perubahan"
                :loading="loading"
              />
            </div>
          </UForm>
        </UCard>
      </template>

      <template #security="{  }">
        <UCard class="mt-4">
          <template #header>
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Keamanan Akun
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ubah password dan kelola sesi Anda.
            </p>
          </template>

          <div class="space-y-4">
            <UFormGroup
              label="Password"
              description="Kelola dan ubah password Anda."
              class="flex items-center justify-between not-last:pb-4 gap-2"
            >
              <UButton label="Ubah Password" color="gray" variant="outline" @click="isPasswordModalOpen = true" />
            </UFormGroup>

            <USeparator />

            <UFormGroup
              label="Autentikasi Dua Faktor"
              description="Tambahkan lapisan keamanan ekstra ke akun Anda."
              class="flex items-center justify-between not-last:pb-4 gap-2"
            >
              <UButton label="Aktifkan 2FA" color="gray" variant="outline" @click="isTwoFactorModalOpen = true" />
            </UFormGroup>

            <USeparator />

            <UFormGroup
              label="Ingat Saya"
              description="Biarkan saya tetap login selama 30 hari."
              class="flex items-center justify-between not-last:pb-4 gap-2"
            >
              <UToggle v-model="securityState.ingat_saya" />
            </UFormGroup>

            <USeparator />

            <UFormGroup
              label="Logout Otomatis"
              description="Logout otomatis setelah 30 menit tidak aktif."
              class="flex items-center justify-between not-last:pb-4 gap-2"
            >
              <UToggle v-model="securityState.logout_otomatis" />
            </UFormGroup>
          </div>
        </UCard>
      </template>
    </UTabs>

    <!-- Modal untuk Ubah Password -->
    <UModal v-model="isPasswordModalOpen">
      <UCard>
        <template #header>
            <h3 class="text-base font-semibold">Ubah Password</h3>
        </template>
        <form @submit.prevent="onChangePassword" class="space-y-4">
          <UFormGroup label="Password Saat Ini" name="currentPassword" required>
            <UInput type="password" v-model="passwordState.currentPassword" />
          </UFormGroup>

          <UFormGroup label="Password Baru" name="newPassword" required>
            <UInput type="password" v-model="passwordState.newPassword" />
          </UFormGroup>

          <UFormGroup label="Konfirmasi Password Baru" name="confirmPassword" required>
            <UInput type="password" v-model="passwordState.confirmPassword" />
          </UFormGroup>
          
          <div class="flex justify-end pt-4">
            <UButton
              type="submit"
              label="Ganti Password"
              :loading="loading"
              :disabled="!passwordState.currentPassword || !passwordState.newPassword || passwordState.newPassword !== passwordState.confirmPassword"
            />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal untuk Aktifkan 2FA -->
    <UModal v-model="isTwoFactorModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-base font-semibold">Aktifkan Autentikasi Dua Faktor</h3>
        </template>
        <p>Langkah-langkah untuk mengaktifkan 2FA akan muncul di sini.</p>
      </UCard>
    </UModal>
  </div>
</template>

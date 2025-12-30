<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const { user, updateProfile, isAuthenticated } = useAuth()
const { getImageUrl } = useImageUrl()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const fileRef = ref<HTMLInputElement>()

// Cek authentikasi saat komponen di mount
onMounted(async () => {
  // Tunggu sebentar agar state authentikasi terinisialisasi dari localStorage
  await new Promise(resolve => setTimeout(resolve, 100))

  if (!isAuthenticated.value) {
    await router.push('/login')
  }
})

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
  avatar: getImageUrl(user.value?.avatar) ?? ''
})

// Track jika ada file avatar baru
const avatarFile = ref<File | null>(null)

// Watch user data changes dan update state
watch(() => user.value, (newUser) => {
  if (newUser) {
    state.name = newUser.name ?? ''
    state.email = newUser.email ?? ''
    state.phone = newUser.phone ?? ''
    state.address = newUser.address ?? ''
    state.bio = newUser.bio ?? ''
    state.avatar = getImageUrl(newUser.avatar) ?? ''
  }
}, { deep: true })

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
    // Jika ada file avatar baru, upload sebagai multipart/form-data
    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('name', event.data.name)
      formData.append('phone', event.data.phone || '')
      formData.append('address', event.data.address || '')
      formData.append('bio', event.data.bio || '')
      formData.append('avatar', avatarFile.value)
      
      await updateProfile(formData as any)
      avatarFile.value = null // Reset file reference
    } else {
      // Jika tidak ada avatar baru, kirim sebagai JSON dengan avatar kosong
      const profileData = {
        ...event.data,
        avatar: '' // Jangan kirim blob URL
      }
      await updateProfile(profileData)
    }
    
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

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) {
    return
  }
  const file = input.files[0]
  if (!file) {
    return
  }
  // Validasi ukuran file (max 1MB)
  if (file.size > 1024 * 1024) {
    toast.add({
      title: 'Gagal',
      description: 'Ukuran file tidak boleh lebih dari 1MB',
      icon: 'i-lucide-alert-circle',
      color: 'warning'
    })
    return
  }

  // Simpan file reference
  avatarFile.value = file

  // Tampilkan preview dengan blob URL (hanya untuk UI preview, tidak dikirim ke server)
  state.avatar = URL.createObjectURL(file)

  toast.add({
    title: 'Gambar dipilih',
    description: 'Jangan lupa Simpan Perubahan.',
    icon: 'i-lucide-check'
  })
}

function onFileClick() {
  fileRef.value?.click()
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
      <UCard class=" max-w-xl flex-center justify-center">
        <template #header>
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Profil Publik
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Informasi ini akan ditampilkan secara publik.
          </p>
        </template>

        <UForm :schema="profileSchema" :state="state" class="space-y-4" @submit="onSaveProfile">
          <UFormField
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
          </UFormField>
          <USeparator />
          <UFormField
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
          </UFormField>
          <USeparator />
          <UFormField
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
          </UFormField>
          <USeparator />
          <UFormField
            name="avatar"
            label="Avatar"
            description="JPG, GIF atau PNG. Maks 1MB."
            class="flex max-sm:flex-col justify-between sm:items-center gap-4"
          >
            <div class="flex flex-wrap items-center gap-3">
              <UAvatar
                :src="state.avatar"
                :alt="state.name"
                size="xl"
                
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
          </UFormField>
          <USeparator />
          <UFormField
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
          </UFormField>
          <USeparator />
          <UFormField
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
          </UFormField>

          <div class="flex justify-end pt-4">
            <UButton
              type="submit"
              label="Simpan Perubahan"
              :loading="loading"
            />
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

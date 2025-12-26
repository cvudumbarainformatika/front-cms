<script setup lang="ts">
/**
 * Halaman Edit Profil Anggota
 */

const { user, updateProfile } = useAuth()
const toast = useToast()
const loading = ref(false)

const items = [{
  label: 'Data Diri',
  icon: 'i-lucide-user',
  slot: 'personal'
}, {
  label: 'Keamanan',
  icon: 'i-lucide-lock',
  slot: 'security'
}]

// State form profil
const state = reactive({
  name: user.value?.name || '',
  phone: user.value?.phone || '', // Need to add phone to User type later properly
  bio: user.value?.bio || '',     // Need to add bio to User type
  address: user.value?.address || '' // Need to add address
})

// State password
const passwordState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

async function onSaveProfile() {
  loading.value = true
  try {
    await updateProfile(state)
    toast.add({
      title: 'Profil Diperbarui',
      color: 'success'
    })
  } finally {
    loading.value = false
  }
}

async function onChangePassword() {
  // Simulasi ganti password
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.add({
      title: 'Password Diubah',
      description: 'Silakan login ulang dengan password baru',
      color: 'success'
    })
    passwordState.currentPassword = ''
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
  }, 1000)
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
          <form @submit.prevent="onSaveProfile" class="space-y-6">
            <div class="flex flex-col md:flex-row gap-8 items-start">
              <!-- Avatar Section -->
              <div class="flex flex-col items-center gap-4">
                <UAvatar
                  :src="user?.avatar"
                  :alt="user?.name"
                  size="3xl"
                />
                <UButton
                  label="Ubah Foto"
                  variant="outline"
                  size="xs"
                  color="neutral"
                />
              </div>

              <!-- Form Fields -->
              <div class="flex-1 w-full space-y-4">
                <UFormGroup label="Nama Lengkap" name="name">
                  <UInput v-model="state.name" icon="i-lucide-user" />
                </UFormGroup>

                <div class="grid md:grid-cols-2 gap-4">
                  <UFormGroup label="Email" name="email">
                    <UInput :model-value="user?.email" disabled icon="i-lucide-mail" />
                    <template #help>Email tidak dapat diubah</template>
                  </UFormGroup>

                  <UFormGroup label="Nomor Telepon" name="phone">
                    <UInput v-model="state.phone" placeholder="+62..." icon="i-lucide-phone" />
                  </UFormGroup>
                </div>

                <UFormGroup label="Alamat / Domisili" name="address">
                  <UTextarea v-model="state.address" placeholder="Alamat lengkap..." />
                </UFormGroup>

                <div class="pt-4 flex justify-end">
                  <UButton
                    type="submit"
                    label="Simpan Perubahan"
                    :loading="loading"
                  />
                </div>
              </div>
            </div>
          </form>
        </UCard>
      </template>

      <template #security="{ item }">
        <UCard class="mt-4 max-w-2xl">
          <form @submit.prevent="onChangePassword" class="space-y-4">
            <UFormGroup label="Password Saat Ini" required>
              <UInput type="password" v-model="passwordState.currentPassword" />
            </UFormGroup>

            <USeparator />

            <UFormGroup label="Password Baru" required>
              <UInput type="password" v-model="passwordState.newPassword" />
            </UFormGroup>

            <UFormGroup label="Konfirmasi Password Baru" required>
              <UInput type="password" v-model="passwordState.confirmPassword" />
            </UFormGroup>

            <div class="pt-4">
              <UButton
                type="submit"
                label="Ganti Password"
                color="neutral"
                variant="outline"
                :loading="loading"
                :disabled="!passwordState.currentPassword || !passwordState.newPassword"
              />
            </div>
          </form>
        </UCard>
      </template>
    </UTabs>
  </div>
</template>

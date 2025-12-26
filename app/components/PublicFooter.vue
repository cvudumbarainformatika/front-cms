<script setup lang="ts">
/**
 * PublicFooter Component
 * Footer dinamis untuk halaman publik dengan menu dari API
 * Menggunakan Nuxt UI UFooter
 */

const { data: footerMenus } = await useMenu('footer')

const toast = useToast()

const email = ref('')
const loading = ref(false)

/**
 * Handle newsletter subscription
 */
async function onSubscribe() {
  if (!email.value) return

  loading.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  toast.add({
    title: 'Berhasil!',
    description: 'Anda telah berlangganan newsletter kami.',
    color: 'success'
  })

  email.value = ''
  loading.value = false
}

/**
 * Footer columns structure
 */
const columns = computed(() => [
  {
    label: 'Organisasi',
    children: [
      { label: 'Tentang Kami', to: '/profil' },
      { label: 'Pengurus', to: '/profil/pengurus' },
      { label: 'AD/ART', to: '/profil/ad-art' },
      { label: 'Sejarah', to: '/profil/sejarah' }
    ]
  },
  {
    label: 'Layanan',
    children: [
      { label: 'Pendaftaran Anggota', to: '/daftar' },
      { label: 'Portal Anggota', to: '/login' },
      { label: 'Direktori RS', to: '/direktori' },
      { label: 'Agenda', to: '/agenda' }
    ]
  },
  {
    label: 'Informasi',
    children: footerMenus.value?.map(item => ({
      label: item.label,
      to: item.to
    })) || []
  }
])

const currentYear = new Date().getFullYear()
</script>

<template>
  <USeparator
    icon="i-lucide-wind"
    class="h-px"
  />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <form @submit.prevent="onSubscribe">
              <UFormField
                name="email"
                label="Berlangganan Newsletter"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Masukkan email Anda"
                  :disabled="loading"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="primary"
                      label="Langganan"
                      :loading="loading"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <div class="flex flex-col gap-2">
        <OrganizationLogo size="sm" />
        <p class="text-muted text-sm">
          © {{ currentYear }} PDPI. Hak Cipta Dilindungi.
        </p>
      </div>
    </template>

    <template #right>
      <UButton
        to="https://instagram.com/pdpi_respirologi"
        target="_blank"
        icon="i-simple-icons-instagram"
        aria-label="PDPI di Instagram"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://youtube.com/@pdpi"
        target="_blank"
        icon="i-simple-icons-youtube"
        aria-label="PDPI di YouTube"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://facebook.com/pdpi"
        target="_blank"
        icon="i-simple-icons-facebook"
        aria-label="PDPI di Facebook"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="mailto:sekretariat@pdpi.or.id"
        icon="i-lucide-mail"
        aria-label="Email PDPI"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>

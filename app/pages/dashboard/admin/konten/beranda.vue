<script setup lang="ts">
/**
 * Admin: Kelola Beranda
 * Mengelola konten Hero, Statistik, Fitur, dan SEO di halaman depan
 */

definePageMeta({
  layout: 'dashboard',
  ssr: false
})

const { isAdmin, authState, userRole } = useAuth()

// Redirect if not admin
onMounted(() => {
  if (!isAdmin.value) {
    navigateTo('/dashboard')
  }
})

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const { $apiFetch } = useNuxtApp()
const { getImageUrl } = useImageUrl()

import type { HomepageData } from '../../../../types/content'

interface BerandaState {
  theme: string
  hero: {
    title: string
    label: string
    description: string
    images: string[]
    event_tag: string
    event_title: string
    event_desc: string
  }
  about: {
    title: string
    subtitle: string
    description: string
    photo: string
    members: {
      name: string
      position: string
      photo: string
      joinedDate: string
    }[]
  }
  footer: {
    contact: { phone: string; email: string }
    socials: { instagram: string; youtube: string }
    columns: { title: string; items: string[] }[]
  }
  stats: { label: string; value: string }[]
  seo: {
    title: string
    description: string
  }
}

const state = reactive<BerandaState>({
  theme: 'theme-2',
  hero: {
    title: '',
    label: '',
    description: '',
    images: [],
    event_tag: '',
    event_title: '',
    event_desc: ''
  },
  about: {
    title: '',
    subtitle: '',
    description: '',
    photo: '',
    members: []
  },
  footer: {
    contact: { phone: '', email: '' },
    socials: { instagram: '', youtube: '' },
    columns: [
      {
        title: 'ALAMAT RUMAH PDPI',
        items: [
          'Alamat Lengkap :',
          'Jl. Cipinang Bunder No.19',
          'Cipinang Pulogadung – Jakarta',
          '• Kode Pos : 13240',
          '• Telepon : (021) 22474845',
          '• Email : sekjen_pdpi@ymail.com',
          '• Website : www.klikpdpi.com'
        ]
      },
      {
        title: 'ORGANISASI',
        items: [
          '1. Badan Legislatif: KONAS, PIK, KONKER',
          '2. Majelis Kehormatan: 9 orang',
          '3. Dewan Pengawas',
          '4. Dewan Etik, Hukum & Pembelaan: 7 orang',
          '5. Dewan Eksekutif: Pengurus Harian',
          '6. Dewan Pendidikan',
          '7. Pengurus Cabang',
          '(AD-ART BAB VII Pasal 8)'
        ]
      }
    ]
  },
  stats: [],
  seo: {
    title: '',
    description: ''
  }
})

// Fetch data on mounted
onMounted(() => {
  if (!isAdmin.value) {
    navigateTo('/dashboard')
    return
  }
  fetchHome()
})

async function fetchHome() {
  loading.value = true
  try {
    const res = await $apiFetch<{ success: boolean, data: HomepageData, message: string }>('/homepage')

    if (res?.data) {
      const data = res.data

      state.theme = data.theme || 'theme-2'

      // Update Hero
      const hero = data.hero as any
      state.hero.title = hero?.title || ''
      state.hero.label = hero?.label || ''
      state.hero.description = hero?.description || ''
      state.hero.images = Array.isArray(hero?.images) ? [...hero.images] : []
      state.hero.event_tag = hero?.event_tag || ''
      state.hero.event_title = hero?.event_title || ''
      state.hero.event_desc = hero?.event_desc || ''

      // Update About
      if (data.about) {
        state.about.title = data.about.title || ''
        state.about.subtitle = data.about.subtitle || ''
        state.about.description = data.about.description || ''
        state.about.photo = data.about.photo || ''

        // Initialize with existing members or 4 empty slots by default
        if (Array.isArray(data.about.members) && data.about.members.length > 0) {
          state.about.members = data.about.members.map(m => ({ ...m }))
        } else {
          state.about.members = [
            { name: '', position: '', photo: '', joinedDate: '' },
            { name: '', position: '', photo: '', joinedDate: '' },
            { name: '', position: '', photo: '', joinedDate: '' },
            { name: '', position: '', photo: '', joinedDate: '' }
          ]
        }
      }

      // Update Footer
      if (data.footer) {
        state.footer.contact = { ...data.footer.contact }
        state.footer.socials = { ...data.footer.socials }
        if (Array.isArray(data.footer.columns) && data.footer.columns.length > 0) {
          state.footer.columns = data.footer.columns.map(c => ({
            title: c.title || '',
            items: Array.isArray(c.items) ? [...c.items] : []
          }))
        }
      }

      // Update Stats
      state.stats = Array.isArray(data.stats) ? data.stats.map(s => ({ ...s })) : []

      // Update SEO
      state.seo.title = data.seo?.title || ''
      state.seo.description = data.seo?.description || ''
    }
  } catch (error) {
    toast.add({
      title: 'Gagal Memuat Data',
      description: 'Terjadi kesalahan saat memuat data beranda.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Methods for Hero Images
// Footer Management
function addFooterColumn() {
  if (!state.footer.columns) state.footer.columns = []
  state.footer.columns.push({ title: 'KOLOM BARU', items: ['Item 1'] })
}

function removeFooterColumn(idx: number) {
  if (state.footer.columns) state.footer.columns.splice(idx, 1)
}

function addFooterItem(colIdx: number) {
  if (state.footer.columns && state.footer.columns[colIdx]) {
    if (!state.footer.columns[colIdx].items) state.footer.columns[colIdx].items = []
    state.footer.columns[colIdx].items.push('Item Baru')
  }
}

function removeFooterItem(colIdx: number, itemIdx: number) {
  if (state.footer.columns && state.footer.columns[colIdx]) {
    state.footer.columns[colIdx].items.splice(itemIdx, 1)
  }
}

async function handleImageUpload(event: Event, type: 'hero' | 'member' | 'about', memberIndex?: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const fd = new FormData()
  fd.append('file', file)

  uploading.value = true
  try {
    const res: any = await $apiFetch('/upload?type=galeri', {
      method: 'POST',
      body: fd
    })

    const url = res?.data?.url || res?.url
    if (url) {
      if (type === 'hero') {
        state.hero.images.push(url)
      } else if (type === 'about') {
        state.about.photo = url
      } else if (type === 'member' && memberIndex !== undefined && state.about.members[memberIndex]) {
        state.about.members[memberIndex].photo = url
      }
      toast.add({ title: 'Upload Berhasil', color: 'success' })
    }
  } catch (error) {
    toast.add({ title: 'Gagal Upload', color: 'error' })
  } finally {
    uploading.value = false
    if (input) input.value = ''
  }
}

function removeHeroImage(index: number) {
  state.hero.images.splice(index, 1)
}

// Methods for Members
function addMember() {
  state.about.members.push({ name: '', position: '', photo: '', joinedDate: '' })
}
function removeMember(index: number) {
  state.about.members.splice(index, 1)
}

// Methods for Stats
function addStat() {
  state.stats.push({ label: '', value: '' })
}
function removeStat(index: number) {
  state.stats.splice(index, 1)
}

async function onSave() {
  saving.value = true
  try {
    await $apiFetch('/homepage', {
      method: 'POST',
      body: state
    })
    toast.add({
      title: 'Berhasil Disimpan',
      description: 'Konten beranda telah diperbarui.',
      color: 'success'
    })
    await fetchHome()
  } catch (error: any) {
    toast.add({
      title: 'Gagal Menyimpan',
      description: error.data?.message || 'Terjadi kesalahan saat menyimpan data.',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Kelola Beranda</h1>
        <p class="text-muted text-sm">Atur konten utama dan tema tampilan website</p>
      </div>
      <UButton
        label="Simpan Perubahan"
        icon="i-lucide-save"
        size="lg"
        :loading="saving"
        @click="onSave"
      />
    </div>

    <ClientOnly>
      <div class="space-y-6">
        <!-- Theme Selection -->
        <UCard>
          <template #header>
            <h2 class="font-semibold text-highlighted">Pengaturan Tema</h2>
          </template>
          <div class="flex items-center gap-6">
              <URadio v-model="state.theme" value="theme-1" label="Theme 1 (Classic)" />
              <URadio v-model="state.theme" value="theme-2" label="Theme 2 (Modern Green)" />
              <div class="text-xs text-muted ml-auto bg-slate-50 px-2 py-1 rounded border">Note: Tema 2 menyertakan Overlay Hero, About Us & Slider lebar.</div>
          </div>
        </UCard>

        <!-- Hero Section -->
        <UCard>
          <template #header>
            <h2 class="font-semibold text-highlighted">Hero & Slider Section</h2>
          </template>

          <div class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <UFormField label="Judul Utama (Title)">
                <UInput v-model="state.hero.title" class="w-full" />
              </UFormField>
              <UFormField label="Label / Badge" help="Teks kecil di atas judul">
                <UInput v-model="state.hero.label" class="w-full" />
              </UFormField>
            </div>

            <UFormField label="Deskripsi">
              <UTextarea v-model="state.hero.description" :rows="2" class="w-full" />
            </UFormField>

            <USeparator label="Konten Kartu Highlight (WOW Effect) - (Dinonaktifkan pada Tema ini)" class="py-4" />
            <div class="grid md:grid-cols-3 gap-2 opacity-75">
              <UFormField label="Tag Event" help="e.g. PDPI (Dinonaktifkan)">
                <UTextarea v-model="state.hero.event_tag" :rows="2" class="w-full" disabled />
              </UFormField>
              <UFormField label="Judul Event" help="(Dinonaktifkan)">
                <UTextarea v-model="state.hero.event_title" :rows="2" class="w-full" disabled />
              </UFormField>
              <UFormField label="Deskripsi Singkat" help="(Dinonaktifkan)">
                <UTextarea v-model="state.hero.event_desc" :rows="2" class="w-full" disabled />
              </UFormField>
            </div>

            <USeparator label="Gambar Slider (Rekomendasi 1920x800)" class="py-4" />

            <div class="space-y-4">
              <div v-if="state.hero.images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(img, idx) in state.hero.images" :key="idx" class="relative group aspect-video rounded-lg overflow-hidden border bg-slate-100">
                  <img :src="getImageUrl(img)" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <UButton icon="i-lucide-trash" color="error" variant="solid" size="xs" @click="removeHeroImage(idx)" />
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-center w-full">
                <label for="hero-upload" class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <UIcon name="i-lucide-image-plus" class="w-6 h-6 text-slate-400 mb-1" />
                  <p class="text-xs text-slate-500">Klik untuk upload gambar slider</p>
                  <input id="hero-upload" type="file" class="hidden" accept="image/*" @change="e => handleImageUpload(e, 'hero')" :disabled="uploading" />
                </label>
              </div>
            </div>
          </div>
        </UCard>

        <!-- About Us & Members -->
        <UCard v-if="state.theme === 'theme-2'">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-highlighted">About Us & Anggota</h2>
              <UButton label="Tambah Anggota" icon="i-lucide-plus" size="xs" color="neutral" variant="outline" @click="addMember" />
            </div>
          </template>

          <div class="space-y-6">
             <div class="grid md:grid-cols-2 gap-6 items-start">
               <UFormField label="Deskripsi About Us">
                 <UTextarea v-model="state.about.description" :rows="14" class="w-full" />
               </UFormField>

               <UFormField label="Foto Utama About Us">
                 <div class="space-y-4">
                   <div class="aspect-video rounded-lg border bg-white overflow-hidden flex items-center justify-center relative group">
                      <img v-if="state.about.photo" :src="getImageUrl(state.about.photo)" class="w-full h-full object-cover" />
                      <UIcon v-else name="i-lucide-image" class="w-12 h-12 text-slate-200" />
                      <label for="about-photo-upload" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                         <span class="text-white text-xs font-bold px-3 py-1 bg-primary-600 rounded-full">Ganti Foto</span>
                         <input id="about-photo-upload" type="file" class="hidden" @change="e => handleImageUpload(e, 'about')" />
                      </label>
                   </div>
                   <p class="text-[10px] text-muted italic">Rekomendasi: 800x600px</p>
                   <div class="grid grid-cols-2 gap-2 mt-4">
                     <UFormField label="Nama / Judul Kartu">
                       <UInput v-model="state.about.title" placeholder="e.g. Perhimpunan Dokter Paru Indonesia" size="sm" />
                     </UFormField>
                     <UFormField label="Posisi / Sub-judul">
                       <UInput v-model="state.about.subtitle" placeholder="e.g. ABOUT PDPI" size="sm" />
                     </UFormField>
                   </div>
                 </div>
               </UFormField>
             </div>

             <div class="grid md:grid-cols-2 gap-4">
               <div v-for="(member, idx) in state.about.members" :key="idx" class="p-4 border rounded-lg bg-slate-50 space-y-3 relative">
                  <UButton icon="i-lucide-x" color="error" variant="ghost" size="xs" class="absolute top-2 right-2" @click="removeMember(idx)" />

                  <div class="flex gap-4 items-start">
                    <div class="w-16 h-16 rounded-lg bg-white border overflow-hidden shrink-0 relative flex items-center justify-center">
                       <img v-if="member.photo" :src="getImageUrl(member.photo)" class="w-full h-full object-cover" />
                       <UIcon v-else name="i-lucide-user" class="text-slate-300" />
                       <label :for="'member-upload-'+idx" class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <UIcon name="i-lucide-camera" class="text-white w-4 h-4" />
                          <input :id="'member-upload-'+idx" type="file" class="hidden" @change="e => handleImageUpload(e, 'member', idx)" />
                       </label>
                    </div>
                    <div class="flex-1 space-y-2">
                      <UInput v-model="member.name" placeholder="Nama Lengkap" size="sm" />
                      <UInput v-model="member.position" placeholder="Posisi / Spesialisasi" size="sm" />
                      <UInput v-model="member.joinedDate" placeholder="Bulan-Tahun Bergabung" size="sm" />
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </UCard>

        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Footer Info -->
          <UCard>
            <template #header>
              <h2 class="font-semibold text-highlighted">Informasi Footer & Kontak</h2>
            </template>
            <div class="space-y-4">
               <div class="grid md:grid-cols-2 gap-4">
                  <UFormField label="Phone / Contact" help="Gunakan baris baru untuk beberapa nomor">
                    <UTextarea v-model="state.footer.contact.phone" :rows="3" />
                  </UFormField>
                  <UFormField label="Email" help="Gunakan baris baru untuk beberapa email">
                    <UTextarea v-model="state.footer.contact.email" :rows="2" />
                   </UFormField>
               </div>
               <div class="grid md:grid-cols-2 gap-4">
                  <UFormField label="Instagram Account">
                    <UInput v-model="state.footer.socials.instagram" placeholder="e.g. inaheartperki" />
                  </UFormField>
                  <UFormField label="Youtube Account">
                    <UInput v-model="state.footer.socials.youtube" placeholder="e.g. Heart to Heart" />
                   </UFormField>
               </div>

               <!-- Dynamic Columns -->
               <div class="space-y-6 pt-6 border-t border-slate-100">
                  <div class="flex items-center justify-between">
                     <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Kolom Dinamis (SS 2)</h4>
                     <UButton label="Tambah Kolom" icon="i-lucide-plus" size="xs" variant="soft" @click="addFooterColumn" />
                  </div>

                  <div class="grid grid-cols-1 gap-4">
                     <div v-for="(col, cIdx) in state.footer.columns" :key="cIdx" class="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                        <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" @click="removeFooterColumn(cIdx)" />
                        <UFormField label="Judul Kolom" class="mb-4">
                           <UInput v-model="col.title" size="sm" placeholder="e.g. BIDANG PEMINATAN" />
                        </UFormField>
                        <div class="space-y-2">
                           <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Items</label>
                           <div v-for="(item, iIdx) in col.items" :key="iIdx" class="flex gap-2">
                              <UInput v-model="col.items[iIdx]" size="xs" class="flex-1" />
                              <UButton icon="i-lucide-minus" color="error" variant="ghost" size="xs" @click="removeFooterItem(cIdx, iIdx)" />
                           </div>
                           <UButton label="Tambah Item" icon="i-lucide-plus" size="xs" variant="ghost" block class="mt-2 border-dashed border-slate-200" @click="addFooterItem(cIdx)" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </UCard>

          <!-- Statistics -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="font-semibold text-highlighted">Statistik Beranda</h2>
                <UButton label="Tambah" icon="i-lucide-plus" size="xs" color="neutral" variant="outline" @click="addStat" />
              </div>
            </template>

            <div class="space-y-4 overflow-y-auto max-h-[250px] pr-2">
              <div v-for="(stat, idx) in state.stats" :key="idx" class="flex gap-2 items-end">
                <UFormField label="Label" size="sm" class="flex-1">
                  <UInput v-model="stat.label" />
                </UFormField>
                <UFormField label="Nilai" size="sm" class="flex-1">
                  <UInput v-model="stat.value" />
                </UFormField>
                <UButton icon="i-lucide-trash" color="error" variant="ghost" size="sm" @click="removeStat(idx)" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- SEO Section -->
        <UCard>
          <template #header>
            <h2 class="font-semibold text-highlighted">SEO & Metadata</h2>
          </template>

          <div class="space-y-4">
            <UFormField label="Meta Title" help="Tampil di tab browser">
              <UInput v-model="state.seo.title" class="w-full" />
            </UFormField>
            <UFormField label="Meta Description">
              <UTextarea v-model="state.seo.description" :rows="3" class="w-full" />
            </UFormField>
          </div>
        </UCard>

        <!-- Bottom Save Button -->
        <div class="flex justify-end pt-4 border-t border-slate-200">
          <UButton
            label="Simpan Perubahan"
            icon="i-lucide-save"
            size="lg"
            :loading="saving"
            @click="onSave"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

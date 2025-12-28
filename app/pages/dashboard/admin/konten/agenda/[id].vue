<script setup lang="ts">
definePageMeta({ layout: 'dashboard', ssr: false })
import TiptapEditor from '~/components/editor/TiptapEditor.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const id = route.params.id as string
const { data, refresh } = await useFetch('/api/agenda')
const current = computed(() => (data.value?.data?.items || []).find((a:any)=>a.id===id))

const form = reactive({
  title: '', slug: '', description: '', image: '', type: 'webinar', date: '', endDate: '', isOnline: false, location: '', fee: '', skp: 0, quota: 0, registered: 0, registrationUrl: '', status: 'draft' as 'draft'|'published'
})

watchEffect(() => {
  if (current.value) Object.assign(form, current.value)
})

const typeOptions = [
  { label: 'Webinar', value: 'webinar' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Seminar', value: 'seminar' },
  { label: 'Kongres', value: 'kongres' }
]

const errors = reactive<{ title?: string; slug?: string; type?: string; date?: string; description?: string }>({})
watch(() => form.title, v => { errors.title = v ? '' : 'Judul wajib' })
watch(() => form.slug, v => { errors.slug = v ? '' : 'Slug wajib' })
watch(() => form.type, v => { errors.type = v ? '' : 'Jenis wajib' })
watch(() => form.date, v => { errors.date = v ? '' : 'Tanggal wajib' })
watch(() => form.description, v => { errors.description = v ? '' : 'Deskripsi wajib' })

const saving = ref(false)
function genSlug() { form.slug = (form.slug || form.title).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') }
async function save(status?: 'draft'|'published') {
  if (status) form.status = status
  if (!form.title || !form.slug || !form.type || !form.date || !form.description) {
    toast.add({ title: 'Validasi', description: 'Isi bidang wajib', color: 'warning' }); return
  }
  saving.value = true
  try {
    await $fetch(`/api/agenda/${id}`, { method: 'PUT', body: form })
    toast.add({ title: 'Tersimpan', color: 'success' })
    refresh()
  } catch (e: any) { toast.add({ title: 'Gagal', description: e?.statusMessage || 'Gagal menyimpan', color: 'error' }) }
  finally { saving.value = false }
}

async function toggleStatus () {
  const next = form.status === 'published' ? 'draft' : 'published'
  await $fetch(`/api/agenda/${id}`, { method: 'PATCH', body: { status: next } })
  toast.add({ title: next==='published'?'Dipublish':'Kembali draft', color: 'success' })
  refresh()
}

const previewHtml = computed(() => (form.description || '').toString())
</script>

<template>
  <div class="space-y-6">
    <UPageHeader :title="`Edit Agenda`" :description="`ID: ${id} | /agenda/${form.slug}`">
      <template #right>
        <div class="flex gap-2">
          <UButton :loading="saving" icon="i-lucide-save" @click="save()">Simpan</UButton>
          <UButton :loading="saving" :icon="form.status==='published'?'i-lucide-archive':'i-lucide-send'" color="primary" @click="toggleStatus">
            {{ form.status==='published' ? 'Unpublish' : 'Publish' }}
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UCard>
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div class="xl:col-span-3 space-y-4">
          <UFormField label="Judul" :error="errors.title" required>
            <UInput v-model="form.title" placeholder="Judul agenda" @blur="genSlug" />
          </UFormField>
          <UFormField label="Slug" :error="errors.slug">
            <div class="flex gap-2">
              <UInput v-model="form.slug" placeholder="otomatis dari judul" />
              <UButton variant="outline" @click="genSlug" icon="i-lucide-refresh-ccw">Generate</UButton>
            </div>
          </UFormField>
          <UFormField label="Jenis" :error="errors.type">
            <USelect v-model="form.type" :items="typeOptions" placeholder="Pilih jenis" />
          </UFormField>
          <UFormField label="Tanggal" :error="errors.date">
            <UInput v-model="form.date" type="datetime-local" />
          </UFormField>
          <UFormField label="Tanggal Selesai">
            <UInput v-model="form.endDate" type="datetime-local" />
          </UFormField>
          <UFormField label="Online?">
            <USwitch v-model="form.isOnline" />
          </UFormField>
          <UFormField label="Lokasi">
            <UInput v-model="form.location" placeholder="Lokasi acara" />
          </UFormField>
          <UFormField label="Biaya">
            <UInput v-model="form.fee" placeholder="Biaya pendaftaran" />
          </UFormField>
          <UFormField label="SKP">
            <UInput v-model.number="form.skp" type="number" min="0" />
          </UFormField>
          <UFormField label="Kuota">
            <UInput v-model.number="form.quota" type="number" min="0" />
          </UFormField>
          <UFormField label="URL Pendaftaran">
            <UInput v-model="form.registrationUrl" placeholder="https://..." />
          </UFormField>
          <UFormField label="Cover Image URL">
            <UInput v-model="form.image" placeholder="https://..." />
            <img v-if="form.image" :src="form.image" alt="cover" class="mt-2 w-full h-28 object-cover rounded" />
          </UFormField>
          <UFormField label="Status">
            <UBadge :label="form.status.toUpperCase()" :color="form.status==='published'?'primary':'neutral'" />
          </UFormField>
        </div>
        <div class="xl:col-span-9 space-y-4">
          <UTabs :items="[{ label: 'Deskripsi', value: 'desc' }, { label: 'Preview', value: 'preview' }]" />
          <UFormField label="Deskripsi (WYSIWYG)" :error="errors.description">
            <ClientOnly>
              <TiptapEditor v-model="form.description" />
            </ClientOnly>
          </UFormField>
          <div class="prose max-w-none border border-default rounded-lg p-4">
            <div v-html="previewHtml" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
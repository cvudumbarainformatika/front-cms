<script setup lang="ts">
import type { DocumentItem } from '~/types/content'

const columns = [{
  key: 'name',
  label: 'Nama Dokumen'
}, {
  key: 'type',
  label: 'Tipe'
}, {
  key: 'validUntil',
  label: 'Berlaku Hingga'
}, {
  key: 'status',
  label: 'Status'
}, {
  key: 'actions'
}] as any[]

const { data: response, pending } = await useFetch<{ success: boolean, data: DocumentItem[] }>('/api/documents')
const documents = computed(() => response.value?.data || [])

const items = (row: DocumentItem) => [
  [{
    label: 'Lihat File',
    icon: 'i-lucide-eye',
    click: () => console.log('View', row.id)
  }, {
    label: 'Download',
    icon: 'i-lucide-download',
    click: () => console.log('Download', row.id)
  }],
  [{
    label: 'Perbarui',
    icon: 'i-lucide-refresh-cw',
    click: () => console.log('Update', row.id)
  }]
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Dokumen Saya</h1>
        <p class="text-muted">Kelola dokumen legalitas dan sertifikasi</p>
      </div>
      <UButton
        label="Upload Dokumen Baru"
        icon="i-lucide-upload"
        size="md"
      />
    </div>

    <UCard :ui="{ body: '!p-0' }">
      <UTable
        :columns="columns"
        :rows="documents"
        :loading="pending"
      >
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-primary" />
            </div>
            <span class="font-medium text-highlighted">{{ (row as any).name }}</span>
          </div>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :label="(row as any).status === 'valid' ? 'Aktif' : (row as any).status === 'expired' ? 'Kadaluarsa' : 'Pending'"
            :color="(row as any).status === 'valid' ? 'success' : (row as any).status === 'expired' ? 'error' : 'warning'"
            variant="subtle"
            size="xs"
          />
        </template>

        <template #validUntil-data="{ row }">
          <span class="text-sm text-muted">{{ (row as any).validUntil }}</span>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="items(row as any)">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-more-horizontal"
            />
          </UDropdown>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

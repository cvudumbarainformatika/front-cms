<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { definePageMeta, useFetch, navigateTo, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'

/**
 * Admin: Kelola Menu
 * Mengelola struktur menu Header, Sidebar, dan Footer
 */

definePageMeta({
  layout: 'dashboard'
})

const { isAdmin, authState, userRole } = useAuth()
const toast = useToast()

// Redirect if not admin
onMounted(() => {
  if (!isAdmin.value) {
    navigateTo('/dashboard')
  }
})

const positions = [
  { value: 'header', label: 'Header Menu' },
  { value: 'sidebar', label: 'Sidebar Menu' },
  { value: 'footer', label: 'Footer Menu' }
]

const currentPosition = ref('header')
const saving = ref(false)

// Fetch menus
const { data: menuResponse, refresh, pending } = await useFetch<any>('/api/menus', {
  query: { position: currentPosition }
})

const menus = ref<any[]>([])

// Initialize local state
watchEffect(() => {
  if (menuResponse.value?.data) {
    menus.value = JSON.parse(JSON.stringify(menuResponse.value.data))
  }
})

// Methods
function addMenu(parentId: string | null = null) {
  const newItem = {
    id: `menu-${Date.now()}`,
    label: 'Menu Baru',
    slug: 'menu-baru',
    to: '/',
    icon: 'i-lucide-link',
    parentId,
    position: currentPosition.value,
    order: parentId ? (menus.value.find(m => m.id === parentId)?.children?.length || 0) : menus.value.length,
    isActive: true,
    isFixed: false,
    isDynamic: false,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat'],
    children: []
  }

  if (parentId) {
    const parent = findMenuById(menus.value, parentId)
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push(newItem)
    }
  } else {
    menus.value.push(newItem)
  }
}

function findMenuById(items: any[], id: string): any {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findMenuById(item.children, id)
      if (found) return found
    }
  }
  return null
}

function removeMenu(id: string) {
  const item = findMenuById(menus.value, id)
  if (item?.isFixed) {
    toast.add({ title: 'Dilarang', description: 'Menu sistem tidak dapat dihapus', color: 'error' })
    return
  }

  // Recursive removal from local state
  menus.value = removeFromList(menus.value, id)
}

function removeFromList(items: any[], id: string) {
  return items.filter(item => {
    if (item.id === id) return false
    if (item.children) {
      item.children = removeFromList(item.children, id)
    }
    return true
  })
}

async function onSave() {
  saving.value = true
  try {
    await $fetch('/api/menus', {
      method: 'POST',
      body: {
        position: currentPosition.value,
        menus: menus.value
      },
      headers: {
        'Authorization': `Bearer ${authState.value.token}`,
        'x-user-role': userRole.value
      }
    })
    toast.add({
      title: 'Berhasil',
      description: 'Struktur menu telah diperbarui.',
      color: 'success'
    })
    await refresh()
  } catch (error) {
    toast.add({
      title: 'Gagal',
      description: 'Gagal menyimpan perubahan menu.',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Kelola Menu</h1>
        <p class="text-muted">Atur navigasi website secara dinamis</p>
      </div>
      <div class="flex gap-3">
        <USelectMenu
          v-model="currentPosition"
          :options="positions"
          value-attribute="value"
          option-attribute="label"
          class="w-48"
        />
        <UButton
          label="Simpan Perubahan"
          icon="i-lucide-save"
          :loading="saving"
          @click="onSave"
        />
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-highlighted">Struktur Menu: {{ positions.find(p => p.value === currentPosition)?.label }}</h2>
          <UButton label="Tambah Menu Utama" icon="i-lucide-plus" size="xs" variant="outline" @click="addMenu(null)" />
        </div>
      </template>

      <div v-if="pending && !menus.length" class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-12 w-full" />
      </div>

      <div v-else-if="!menus.length" class="text-center py-12 text-muted">
        <UIcon name="i-lucide-layers" class="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>Belum ada menu di posisi ini.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in menus" :key="item.id" class="border border-default rounded-lg overflow-hidden translate-z-0">
          <!-- Main Menu Item -->
          <div class="p-4 bg-muted/30 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 flex-1">
              <UIcon :name="item.icon || 'i-lucide-link'" class="w-5 h-5 text-muted" />
              <div class="flex-1 grid grid-cols-2 gap-4">
                <UInput v-model="item.label" placeholder="Label Menu" size="sm" />
                <UInput v-model="item.to" placeholder="Path / URL" size="sm" :disabled="item.isFixed" />
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <UFormGroup label="Dinamis" size="xs" class="flex flex-col items-center">
                <UToggle v-model="item.isDynamic" size="sm" />
              </UFormGroup>
              <div class="flex items-center gap-1 border-l border-default pl-2 ml-2">
                <UButton 
                  icon="i-lucide-plus" 
                  variant="ghost" 
                  size="xs" 
                  color="neutral"
                  @click="addMenu(item.id)"
                  title="Tambah Submenu"
                />
                <UButton 
                  v-if="!item.isFixed"
                  icon="i-lucide-trash" 
                  variant="ghost" 
                  size="xs" 
                  color="error"
                  @click="removeMenu(item.id)" 
                />
                <UBadge v-else label="Fixed" variant="subtle" size="xs" color="neutral" />
              </div>
            </div>
          </div>

          <!-- Children / Submenus -->
          <div v-if="item.children?.length" class="pl-8 pr-4 py-2 space-y-2 border-t border-default bg-background/50">
            <div v-for="child in item.children" :key="child.id" class="flex items-center justify-between gap-4 py-2 border-b border-default last:border-0">
              <div class="flex items-center gap-3 flex-1">
                <UIcon :name="child.icon" class="w-4 h-4 text-muted/60" />
                <div class="flex-1 grid grid-cols-2 gap-4">
                  <UInput v-model="child.label" placeholder="Label Submenu" size="xs" />
                  <UInput v-model="child.to" placeholder="Path / URL" size="xs" :disabled="child.isFixed" />
                </div>
              </div>
              <div class="flex items-center gap-3">
                <UFormGroup label="Dinamis" size="xs" class="flex flex-col items-center">
                  <UToggle v-model="child.isDynamic" size="xs" />
                </UFormGroup>
                <UButton 
                  v-if="!child.isFixed"
                  icon="i-lucide-trash" 
                  variant="ghost" 
                  size="xs" 
                  color="error"
                  @click="removeMenu(child.id)" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { definePageMeta, useFetch, navigateTo, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'


/**
 * Admin: Kelola Menu
 * Mengelola struktur menu Header, Sidebar, dan Footer
 */

definePageMeta({
  layout: 'dashboard',
  ssr: false
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

const { $apiFetch } = useNuxtApp()

// Fetch menus with dynamic key based on position
const { data: menuResponse, refresh, pending } = await useAsyncData(
  () => `admin-menus-${currentPosition.value}`,
  () => $apiFetch('/menus', {
    query: { position: currentPosition.value }
  }),
  {
    watch: [currentPosition],
    server: false
  }
)

const menus = ref<any[]>([])
const shouldSyncFromServer = ref(true)

// Delete confirmation modal state
const isDeleteModalOpen = ref(false)
const menuToDelete = ref<any>(null)
const errorMessages = reactive<Record<string, string>>({})

// Initialize local state from server data
watchEffect(() => {
  // Only sync from server when explicitly allowed
  if (shouldSyncFromServer.value && menuResponse.value?.data) {
    menus.value = JSON.parse(JSON.stringify(menuResponse.value.data))
    shouldSyncFromServer.value = false // Prevent auto-sync until next explicit refresh
  } else if (!menuResponse.value?.data) {
    menus.value = []
  }
})

// Watch position changes to trigger sync
watch(currentPosition, () => {
  shouldSyncFromServer.value = true
})

// Methods
function normalizePath(raw: any): string {
  const s = (raw ?? '').toString().trim()
  if (!s || s === '/') return ''
  // only allow internal path for content editor (no http/https)
  if (/^https?:\/\//i.test(s)) return ''
  return s
}

function isValidInternalPath(raw: any): boolean {
  return normalizePath(raw).length > 0
}

function onEditContent(it: any) {
  const raw = it.to || it.slug
  if (!isValidInternalPath(raw)) {
    toast.add({ title: 'Path tidak valid', description: 'Isi Path / URL dengan path internal. Contoh: /profil/visi-misi', color: 'warning' })
    return
  }
  const to = getEditorPath(it)
  if (!to) {
    toast.add({ title: 'Path tidak valid', description: 'Tidak dapat membuka editor tanpa path yang benar.', color: 'warning' })
    return
  }
  navigateTo(to)
}

function getEditorPath(it: any) {
  const base = '/dashboard/admin/konten/editor/'
  const raw = it.to || it.slug
  if (!raw) return undefined
  const clean = typeof raw === 'string' ? (raw.startsWith('/') ? raw.slice(1) : raw) : String(raw)
  if (!clean) return undefined // hindari navigasi ke editor/ tanpa slug
  return base + clean
}

// Helper function to convert text to URL-friendly slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '')           // Remove &
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars except -
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '')          // Trim - from end of text
}

// Auto-update URL when label changes
function onLabelChange(item: any, newLabel: string) {
  item.label = newLabel
  
  // Only auto-update URL if it's a new menu (temporary ID) or if URL is empty/default
  const isNewMenu = String(item.id).startsWith('menu-')
  const isDefaultUrl = !item.to || item.to === '/' || item.to.endsWith('/')
  
  if (isNewMenu || isDefaultUrl) {
    const slug = slugify(newLabel)
    
    if (item.parentId) {
      // For submenu, prepend parent URL
      const parent = findMenuById(menus.value, item.parentId)
      if (parent && parent.to) {
        const parentUrl = parent.to.endsWith('/') ? parent.to : parent.to + '/'
        item.to = parentUrl + slug
      } else {
        item.to = '/' + slug
      }
    } else {
      // For main menu
      item.to = '/' + slug
    }
  }
  
  // Force reactivity update
  menus.value = [...menus.value]
  
  // Clear error for this field
  delete errorMessages[`label-${item.id}`]
}

// Handle URL changes
function onUrlChange(item: any, newUrl: string) {
  item.to = newUrl
  
  // Force reactivity update
  menus.value = [...menus.value]
  
  // Clear error for this field
  delete errorMessages[`to-${item.id}`]
}

function addMenu(parentId: string | null = null) {
  let defaultUrl = '/'
  
  // If adding a submenu, prepopulate URL with parent's URL + '/'
  if (parentId) {
    const parent = findMenuById(menus.value, parentId)
    if (parent && parent.to) {
      // Ensure parent URL ends with / and doesn't double up
      const parentUrl = parent.to.endsWith('/') ? parent.to : parent.to + '/'
      defaultUrl = parentUrl
    }
  }
  
  const newItem = {
    id: `menu-${Date.now()}`,
    label: 'Menu Baru',
    slug: 'menu-baru',
    to: defaultUrl,
    icon: 'i-lucide-link',
    parentId,
    position: currentPosition.value,
    order: parentId ? (menus.value.find(m => m.id === parentId)?.children?.length || 0) : menus.value.length,
    isActive: true,
    is_fixed: false,
    roles: ['public', 'member', 'admin_cabang', 'admin_wilayah', 'admin_pusat'],
    children: []
  }

  if (parentId) {
    const parent = findMenuById(menus.value, parentId)
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push(newItem)
      // Force reactivity by reassigning
      menus.value = [...menus.value]
    }
  } else {
    // Add to root menus
    menus.value = [...menus.value, newItem]
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

function removeMenu(id: string | number) {
  const item = findMenuById(menus.value, String(id))
  if (item?.is_fixed) {
    toast.add({ title: 'Dilarang', description: 'Menu sistem tidak dapat dihapus', color: 'error' })
    return
  }

  // Show confirmation modal
  menuToDelete.value = { id, label: item?.label || 'Menu' }
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  if (!menuToDelete.value) return
  
  const { id } = menuToDelete.value
  
  // Check if this is an existing menu (numeric ID) or new menu (string ID)
  const isExistingMenu = typeof id === 'number' || !String(id).startsWith('menu-')
  
  if (isExistingMenu) {
    // Call API to delete from database
    try {
      await $apiFetch(`/menus/${id}`, {
        method: 'DELETE'
      })
      
      toast.add({
        title: 'Berhasil',
        description: 'Menu berhasil dihapus',
        color: 'success'
      })
      
      // Remove from local state
      menus.value = removeFromList(menus.value, String(id))
    } catch (error: any) {
      toast.add({
        title: 'Gagal',
        description: error?.data?.message || 'Gagal menghapus menu',
        color: 'error'
      })
    }
  } else {
    // New menu (not yet in database), just remove from local state
    menus.value = removeFromList(menus.value, String(id))
    toast.add({
      title: 'Berhasil',
      description: 'Menu berhasil dihapus',
      color: 'success'
    })
  }
  
  // Close modal
  isDeleteModalOpen.value = false
  menuToDelete.value = null
}

function removeFromList(items: any[], id: string) {
  return items.filter(item => {
    if (String(item.id) === id) return false
    if (item.children) {
      item.children = removeFromList(item.children, id)
    }
    return true
  })
}

function validateMenus(): boolean {
  const seenUrls = new Set<string>()
  const seenLabels = new Set<string>()
  // Reset errors
  Object.keys(errorMessages).forEach(key => delete errorMessages[key])
  
  let isValid = true
  let firstErrorTitle = ''

  // Helper to traverse and validate
  function traverse(items: any[]) {
    for (const item of items) {
      // 1. Check Label
      if (!item.label || !item.label.trim()) {
        errorMessages[`label-${item.id}`] = 'Label menu tidak boleh kosong'
        isValid = false
        if (!firstErrorTitle) firstErrorTitle = 'Label menu tidak boleh kosong'
      } else {
        // Check duplicate label
        const label = item.label.trim().toLowerCase()
        if (seenLabels.has(label)) {
          errorMessages[`label-${item.id}`] = `Nama menu "${item.label}" sudah digunakan`
          isValid = false
          if (!firstErrorTitle) firstErrorTitle = `Nama menu "${item.label}" sudah digunakan`
        }
        seenLabels.add(label)
      }

      // 2. Check URL
      if (!item.to || !item.to.trim()) {
        errorMessages[`to-${item.id}`] = 'URL wajib diisi'
        isValid = false
        if (!firstErrorTitle) firstErrorTitle = `URL untuk menu "${item.label || 'baru'}" wajib diisi`
      } else {
         // 3. Check Uniqueness (only check if URL exists)
        const url = item.to.trim()
        if (seenUrls.has(url)) {
           errorMessages[`to-${item.id}`] = `URL "${url}" sudah digunakan`
           isValid = false
           if (!firstErrorTitle) firstErrorTitle = `URL "${url}" sudah digunakan`
        }
        seenUrls.add(url)
      }

      if (item.children && item.children.length) {
        traverse(item.children)
      }
    }
  }

  traverse(menus.value)
  
  if (!isValid) {
    toast.add({ title: 'Validasi Gagal', description: firstErrorTitle, color: 'warning' })
  }
  
  return isValid
}


async function onSave() {
  if (!validateMenus()) return

  saving.value = true
  try {
    const response = await $apiFetch('/menus', {
      method: 'POST',
      body: {
        position: currentPosition.value,
        menus: menus.value
      }
    })
    
    // Directly update menus from response for immediate UI update
    if (response?.data) {
      menus.value = JSON.parse(JSON.stringify(response.data))
    }
    
    toast.add({
      title: 'Berhasil',
      description: 'Struktur menu telah diperbarui.',
      color: 'success'
    })
    
    // Don't call refresh() - it causes stale data to overwrite our fresh data
    // The response already contains the latest data, so no need to fetch again
  } catch (error: any) {
    toast.add({
      title: 'Gagal',
      description: error?.data?.message || error?.message || 'Gagal menyimpan perubahan menu.',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

async function handleUrlSave() {
  // Trigger save only if validation passes
  // We reuse onSave which already includes validation
  await onSave()
}
</script>

<template>
  <ClientOnly>
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
                <UFormField :error="errorMessages[`label-${item.id}`]" :ui="{ container: 'w-full' }">
                  <UInput 
                    v-model="item.label" 
                    placeholder="Label Menu" 
                    size="sm"
                    class="w-full" 
                    @update:model-value="(val) => onLabelChange(item, val)"
                  />
                </UFormField>
                <UFormField :error="errorMessages[`to-${item.id}`]" :ui="{ container: 'w-full' }">
                  <UInput 
                    v-model="item.to" 
                    placeholder="Path / URL" 
                    size="sm"
                    class="w-full" 
                    :disabled="item.is_fixed"
                    @keydown.enter="handleUrlSave"
                    @blur="handleUrlSave"
                    @update:model-value="(val) => onUrlChange(item, val)"
                  />
                </UFormField>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <UBadge v-if="item.is_fixed" color="primary" variant="soft" size="xs">
                Fixed Menu
              </UBadge>
              <div v-if="!item.is_fixed" class="flex items-center gap-1 border-l border-default pl-2 ml-2">
                <UButton 
                  icon="i-lucide-plus" 
                  variant="ghost" 
                  size="xs" 
                  color="neutral"
                  @click="addMenu(item.id)"
                  title="Tambah Submenu"
                  />
                  <UButton
                    :disabled="!isValidInternalPath(item.to || item.slug)"
                    icon="i-lucide-file-pen"
                    variant="ghost"
                    size="xs"
                    color="primary"
                    @click="onEditContent(item)"
                    title="Buat/Edit Konten"
                  
                />
                <UButton 
                  v-if="!item.is_fixed"
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
                  <UFormField :error="errorMessages[`label-${child.id}`]" :ui="{ container: 'w-full' }">
                    <UInput 
                      v-model="child.label" 
                      placeholder="Label Submenu" 
                      size="xs"
                      class="w-full" 
                      @update:model-value="(val) => onLabelChange(child, val)"
                    />
                  </UFormField>
                  <UFormField :error="errorMessages[`to-${child.id}`]" :ui="{ container: 'w-full' }">
                    <UInput 
                      v-model="child.to" 
                      placeholder="Path / URL" 
                      size="xs"
                      class="w-full" 
                      :disabled="child.isFixed"
                      @keydown.enter="handleUrlSave"
                      @blur="handleUrlSave"
                      @update:model-value="(val) => onUrlChange(child, val)"
                    />
                  </UFormField>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <UBadge v-if="child.is_fixed" color="primary" variant="soft" size="sm">
                  Fixed Menu
                </UBadge>
                <UButton
                  v-if="!child.is_fixed"
                  :disabled="!isValidInternalPath(child.to || child.slug)"
                  icon="i-lucide-file-pen"
                  variant="ghost"
                  size="xs"
                  color="primary"
                  @click="onEditContent(child)"
                  title="Buat/Edit Konten"
                />
                <UButton 
                  v-if="!child.is_fixed"
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
    
    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen" title="Konfirmasi Hapus" description="">
      <template #header>
        <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-error" />
        <span class="font-semibold text-lg">Konfirmasi Hapus</span>
      </template>
      
      <template #body>
        <div class="space-y-3">
          <p>
            Apakah Anda yakin ingin menghapus menu <strong>{{ menuToDelete?.label }}</strong>?
          </p>
          <p class="text-sm text-muted">
            Menu ini dan semua submenu di dalamnya akan dihapus secara permanen.
          </p>
        </div>
      </template>

      <template #footer="{ close }">
        <UButton label="Batal" color="neutral" variant="outline" @click="close" />
        <UButton label="Hapus" color="error" icon="i-lucide-trash" @click="confirmDelete" />
      </template>
    </UModal>
    </div>
  </ClientOnly>
</template>

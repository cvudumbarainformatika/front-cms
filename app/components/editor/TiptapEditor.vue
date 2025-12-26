<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Tulis konten di sini...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const toast = useToast()
const uploading = ref(false)
const editorRef = ref<any>(null)
const currentEditor = ref<any>(null)

async function handleImageUpload(editor: any) {
  currentEditor.value = editor
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
  
  input.onchange = async (e: any) => {
    const file = e.target?.files?.[0]
    if (!file) return

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ 
        title: 'File terlalu besar', 
        description: 'Maksimal ukuran file 5MB', 
        color: 'error' 
      })
      return
    }

    uploading.value = true
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await $fetch<any>('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.success && response.data?.url) {
        // Insert image directly into editor
        if (currentEditor.value) {
          try {
            currentEditor.value.chain().focus().setImage({ src: response.data.url }).run()
          } catch (err) {
            console.error('[Upload] Failed to insert image:', err)
          }
        }
        
        toast.add({ 
          title: 'Upload berhasil', 
          description: `${response.data.originalName} telah diupload`, 
          color: 'success' 
        })
      }
    } catch (error: any) {
      toast.add({ 
        title: 'Upload gagal', 
        description: error.data?.statusMessage || 'Gagal mengupload gambar', 
        color: 'error' 
      })
    } finally {
      uploading.value = false
    }
  }
  
  input.click()
}

const toolbarItems = (editor: any) => [[{
  kind: 'undo' as const,
  icon: 'i-lucide-undo',
  tooltip: { text: 'Undo' }
}, {
  kind: 'redo' as const,
  icon: 'i-lucide-redo',
  tooltip: { text: 'Redo' }
}], [{
  icon: 'i-lucide-heading',
  tooltip: { text: 'Headings' },
  items: [{
    kind: 'heading' as const,
    level: 1,
    icon: 'i-lucide-heading-1',
    label: 'Heading 1'
  }, {
    kind: 'heading' as const,
    level: 2,
    icon: 'i-lucide-heading-2',
    label: 'Heading 2'
  }, {
    kind: 'heading' as const,
    level: 3,
    icon: 'i-lucide-heading-3',
    label: 'Heading 3'
  }, {
    kind: 'heading' as const,
    level: 4,
    icon: 'i-lucide-heading-4',
    label: 'Heading 4'
  }]
}, {
  icon: 'i-lucide-list',
  tooltip: { text: 'Lists' },
  items: [{
    kind: 'bulletList' as const,
    icon: 'i-lucide-list',
    label: 'Bullet List'
  }, {
    kind: 'orderedList' as const,
    icon: 'i-lucide-list-ordered',
    label: 'Numbered List'
  }]
}, {
  kind: 'blockquote' as const,
  icon: 'i-lucide-text-quote',
  tooltip: { text: 'Blockquote' }
}, {
  kind: 'codeBlock' as const,
  icon: 'i-lucide-square-code',
  tooltip: { text: 'Code Block' }
}], [{
  kind: 'mark' as const,
  mark: 'bold',
  icon: 'i-lucide-bold',
  tooltip: { text: 'Bold' }
}, {
  kind: 'mark' as const,
  mark: 'italic',
  icon: 'i-lucide-italic',
  tooltip: { text: 'Italic' }
}, {
  kind: 'mark' as const,
  mark: 'underline',
  icon: 'i-lucide-underline',
  tooltip: { text: 'Underline' }
}, {
  kind: 'mark' as const,
  mark: 'strike',
  icon: 'i-lucide-strikethrough',
  tooltip: { text: 'Strike' }
}, {
  kind: 'mark' as const,
  mark: 'code',
  icon: 'i-lucide-code',
  tooltip: { text: 'Code' }
}], [{
  kind: 'link' as const,
  icon: 'i-lucide-link',
  tooltip: { text: 'Link' }
}, {
  kind: 'custom' as const,
  icon: uploading.value ? 'i-lucide-loader-circle' : 'i-lucide-image',
  tooltip: { text: uploading.value ? 'Uploading...' : 'Upload Image' },
  onClick: () => handleImageUpload(editor),
  disabled: uploading.value
}, {
  kind: 'image' as const,
  icon: 'i-lucide-link',
  tooltip: { text: 'Image URL' }
}, {
  kind: 'horizontalRule' as const,
  icon: 'i-lucide-minus',
  tooltip: { text: 'Horizontal Rule' }
}]] as EditorToolbarItem[][]
</script>

<template>
  <div>
    <UEditor
      ref="editorRef"
      v-slot="{ editor }"
      v-model="content"
      content-type="html"
      :placeholder="placeholder"
      class="w-full"
    >
      <UEditorToolbar :editor="editor" :items="toolbarItems(editor)" class="border-b border-default px-2 py-2" />
    </UEditor>

  </div>
</template>

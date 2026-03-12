```html
<script setup lang="ts">
import { markRaw, onMounted, ref } from 'vue'
import type { EditorToolbarItem } from '@nuxt/ui'
import TextAlign from '@tiptap/extension-text-align'

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

const mounted = ref(false)
const uploading = ref(false)

// markRaw is essential for TipTap extensions in Vue 3.4/3.5+
const extensions = markRaw([
  TextAlign.configure({
    types: ['heading', 'paragraph']
  })
])

onMounted(() => {
  mounted.value = true
})

const content = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const toast = useToast()

async function handleImageUpload(editor: any) {
  if (!editor) return

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

      const { authState } = useAuth()
      const token = authState.value?.token

      const response = await $fetch<any>('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      if (response.success && response.data?.url) {
        const { getImageUrl } = useImageUrl()
        const fullUrl = getImageUrl(response.data.url)
        editor.chain().focus().setImage({ src: fullUrl }).run()

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

const getToolbarItems = (editor: any) => [[{
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
  icon: 'i-lucide-align-left',
  tooltip: { text: 'Alignment' },
  items: [{
    kind: 'textAlign' as const,
    align: 'left',
    icon: 'i-lucide-align-left',
    label: 'Left'
  }, {
    kind: 'textAlign' as const,
    align: 'center',
    icon: 'i-lucide-align-center',
    label: 'Center'
  }, {
    kind: 'textAlign' as const,
    align: 'right',
    icon: 'i-lucide-align-right',
    label: 'Right'
  }, {
    kind: 'textAlign' as const,
    align: 'justify',
    icon: 'i-lucide-align-justify',
    label: 'Justify'
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
  <div class="tip-tap-editor-wrapper min-h-[300px]">
    <template v-if="mounted">
      <UEditor
        v-model="content"
        content-type="html"
        :placeholder="placeholder"
        :extensions="extensions"
        class="w-full"
      >
        <template #default="{ editor }">
          <UEditorToolbar
            :editor="editor"
            :items="getToolbarItems(editor)"
            class="border-b border-default px-2 py-2"
          />
        </template>
      </UEditor>
    </template>
    <div v-else class="w-full h-[300px] flex items-center justify-center bg-gray-50 border border-gray-100 rounded">
      <UIcon name="i-lucide-loader-2" class="animate-spin w-8 h-8 text-primary-500" />
    </div>
  </div>
</template>
```

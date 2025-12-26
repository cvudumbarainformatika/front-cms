# Markdown Rendering

## Status Saat Ini:
- UMarkdown dari Nuxt UI menimbulkan warning SSR
- Sementara diganti dengan whitespace-pre-wrap (plain text)

## Solusi untuk Markdown Rendering:
Jika ingin render markdown yang proper, gunakan salah satu:

### Opsi 1: marked.js (Simple)
```bash
pnpm add marked
```

```vue
<script setup>
import { marked } from 'marked'
const renderedBody = computed(() => marked(dyn.value?.body || ''))
</script>

<template>
  <div v-html="renderedBody"></div>
</template>
```

### Opsi 2: markdown-it (Powerful)
```bash
pnpm add markdown-it
```

### Opsi 3: Nuxt Content (Built-in)
Jika sudah install @nuxt/content, bisa pakai ContentRenderer dengan body markdown.

## Rekomendasi:
- Untuk CMS ini, **lebih baik gunakan mode WYSIWYG** (html) saja
- Mode Markdown hanya sebagai fallback/alternatif
- User edit dengan UEditor → simpan sebagai html → render langsung tanpa konversi

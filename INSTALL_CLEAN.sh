#!/bin/bash
echo "🧹 Membersihkan instalasi Tiptap manual..."
echo ""
echo "Langkah 1: Hapus node_modules dan cache"
rm -rf node_modules pnpm-lock.yaml .nuxt node_modules/.cache 2>/dev/null
echo "✅ Cache dibersihkan"
echo ""
echo "Langkah 2: Install ulang (hanya dependencies dari @nuxt/ui)"
pnpm install
echo ""
echo "Langkah 3: Restart dev server"
echo "Jalankan: pnpm dev"
echo ""
echo "✨ Setelah ini, UEditor akan menggunakan Tiptap dari @nuxt/ui internal"
echo "   Tidak akan ada lagi konflik 'Adding different instances of a keyed plugin'"

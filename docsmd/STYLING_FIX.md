# Styling Fix untuk Halaman Publik

## Masalah:
Elemen HTML dari editor tidak ter-styling dengan baik di halaman publik.

## Solusi:
Tambahkan Tailwind Typography utilities untuk memastikan semua elemen ter-styling:

### Headings:
- `prose-headings:font-bold` - Semua heading bold
- `prose-h1:text-4xl` - H1 ukuran besar
- `prose-h2:text-3xl` - H2 sedang
- `prose-h3:text-2xl` - H3 
- `prose-h4:text-xl` - H4

### Lists:
- `prose-ul:list-disc` - Bullet points
- `prose-ol:list-decimal` - Numbering
- `prose-li:ml-4` - Indentasi list items

### Code:
- `prose-code:bg-gray-100` - Background untuk inline code
- `prose-code:px-1 prose-code:py-0.5` - Padding
- `prose-code:rounded` - Rounded corners
- `prose-pre:bg-gray-900` - Background code block
- `prose-pre:text-gray-100` - Text color code block

### Others:
- `prose-hr:border-primary` - Horizontal rule warna primary
- `prose-blockquote:border-l-4` - Blockquote left border
- `prose-blockquote:border-primary` - Border warna primary
- `prose-blockquote:pl-4` - Padding left
- `prose-blockquote:italic` - Italic text

## Testing:
1. Edit konten dengan semua elemen (H1-4, bullet, numbering, code, code block, horizontal rule, blockquote)
2. Simpan
3. Buka halaman publik
4. Semua elemen harus ter-styling dengan baik

## Customization:
Jika mau custom lebih lanjut, edit class prose-* di app/pages/[...slug].vue

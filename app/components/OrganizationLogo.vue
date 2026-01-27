<script setup lang="ts">
/**
 * OrganizationLogo Component
 * Logo organisasi dengan fallback ke text jika gambar belum ada
 * Modular dan reusable
 */

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showText?: boolean
  variant?: 'full' | 'icon'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showText: true,
  variant: 'full'
})

const sizeClasses = {
  'sm': 'h-6',
  'md': 'h-8',
  'lg': 'h-10',
  'xl': 'h-12',
  '2xl': 'h-14'
}

const textSizeClasses = {
  'sm': 'text-sm',
  'md': 'text-base',
  'lg': 'text-lg',
  'xl': 'text-xl',
  '2xl': 'text-2xl'
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Logo Icon/Image -->
    <!-- Logo Icon/Image -->
    <div
      :class="[
        sizeClasses[props.size],
        'aspect-square flex items-center justify-center'
      ]"
    >
      <img
        src="/logo_pdpi_official.png"
        alt="Logo PDPI"
        class="w-full h-full object-contain"
      />
    </div>

    <!-- Organization Name -->
    <div
      v-if="showText && variant === 'full'"
      class="flex flex-col"
    >
      <span
        :class="[
          textSizeClasses[size],
          'font-bold text-highlighted leading-tight text-primary-600'
        ]"
      >
        PDPI
      </span>
      <span
        v-if="size !== 'sm'"
        class="text-xs text-muted leading-tight"
      >
        Perhimpunan Dokter Paru Indonesia
      </span>
    </div>
  </div>
</template>

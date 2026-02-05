<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  reason: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <UModal v-model:open="isOpen" title="Alasan Penolakan">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500" />
        <span class="font-semibold text-lg text-gray-900 dark:text-white">Alasan Penolakan</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <div class="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
          <p class="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ reason }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton color="neutral" variant="outline" label="Tutup" @click="isOpen = false" />
      </div>
    </template>
  </UModal>
</template>

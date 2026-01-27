<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [mode: 'test' | 'warmup' | 'all']
}>()

// Computed for v-model binding
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedMode = ref<'test' | 'warmup'>('test')

const modes = [
  {
    value: 'test',
    label: 'Test Mode',
    description: 'Kirim ke 7 email testing',
    icon: 'i-lucide-test-tube',
    color: 'blue'
  },
  {
    value: 'warmup',
    label: 'Warm-up Mode',
    description: 'Kirim ke 50 member + 7 test (57 total)',
    icon: 'i-lucide-zap',
    color: 'orange'
  }
  // Full Blast hidden - uncomment when IP reputation is established
  // {
  //   value: 'all',
  //   label: 'Full Blast',
  //   description: 'Kirim ke semua member (1800+)',
  //   icon: 'i-lucide-rocket',
  //   color: 'green'
  // }
]

function handleClose() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  emit('confirm', selectedMode.value as 'test' | 'warmup' | 'all')
}
</script>

<template>
  <UModal v-model:open="isOpen" description="" title="">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-send" class="w-5 h-5 text-primary-600" />
        <span class="font-semibold text-lg">Pilih Mode Broadcast</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-muted">
          Pilih mode pengiriman email broadcast berdasarkan strategi yang Anda inginkan.
        </p>

        <div class="space-y-3">
          <div
            v-for="mode in modes"
            :key="mode.value"
            class="border rounded-lg p-4 cursor-pointer transition-all"
            :class="[
              selectedMode === mode.value 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
            @click="selectedMode = mode.value as 'test' | 'warmup'"
          >
            <div class="flex items-start gap-3">
              <UIcon
                :name="mode.icon"
                class="w-5 h-5 mt-0.5"
                :class="selectedMode === mode.value ? 'text-primary-600' : 'text-gray-400'"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium" :class="selectedMode === mode.value ? 'text-primary-600' : ''">
                    {{ mode.label }}
                  </h4>
                  <UIcon
                    v-if="selectedMode === mode.value"
                    name="i-lucide-check-circle"
                    class="w-5 h-5 text-primary-600"
                  />
                </div>
                <p class="text-sm text-muted mt-1">
                  {{ mode.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Batal" @click="close" />
        <UButton label="Kirim Email" icon="i-lucide-send" @click="handleConfirm" />
      </div>
    </template>
  </UModal>
</template>

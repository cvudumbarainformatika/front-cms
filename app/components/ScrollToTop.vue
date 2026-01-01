<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
const showButton = computed(() => y.value > 500)

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-10 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-10 opacity-0"
  >
    <button
      v-if="showButton"
      @click="scrollToTop"
      class="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-600/40 hover:-translate-y-1 active:translate-y-0 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label="Scroll to top"
    >
      <UIcon name="i-lucide-arrow-up" class="w-6 h-6" />
    </button>
  </Transition>
</template>

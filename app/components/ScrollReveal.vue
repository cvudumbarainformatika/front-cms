<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom'
  delay?: number
  duration?: number
  once?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  animation: 'fade',
  delay: 0,
  duration: 700,
  once: true
})

const target = ref(null)
const isVisible = ref(false)

useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true
    } else if (!props.once) {
      isVisible.value = false
    }
  },
  { threshold: 0.1 }
)

const animationClasses = computed(() => {
  // Base classes with duration
  let classes = `transition-all duration-[${props.duration}ms] ease-out`
  
  if (!isVisible.value) {
    if (props.animation === 'fade') classes += ' opacity-0'
    else if (props.animation === 'slide-up') classes += ' opacity-0 translate-y-10'
    else if (props.animation === 'slide-left') classes += ' opacity-0 translate-x-10'
    else if (props.animation === 'slide-right') classes += ' opacity-0 -translate-x-10'
    else if (props.animation === 'zoom') classes += ' opacity-0 scale-95'
  } else {
    classes += ' opacity-100 translate-y-0 translate-x-0 scale-100'
  }
  
  return classes
})
</script>

<template>
  <div 
    ref="target"
    :class="animationClasses"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <slot />
  </div>
</template>

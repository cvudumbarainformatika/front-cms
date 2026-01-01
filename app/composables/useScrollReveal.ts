/**
 * Scroll Reveal Composable
 * Menambahkan fade-in animation saat element masuk viewport
 */

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true
  } = options

  const observer = ref<IntersectionObserver | null>(null)

  const observe = (element: HTMLElement) => {
    if (!element) return

    if (!observer.value) {
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible')
              if (once) {
                observer.value?.unobserve(entry.target)
              }
            } else if (!once) {
              entry.target.classList.remove('reveal-visible')
            }
          })
        },
        {
          threshold,
          rootMargin
        }
      )
    }

    element.classList.add('reveal-hidden')
    observer.value.observe(element)
  }

  const unobserve = (element: HTMLElement) => {
    if (observer.value && element) {
      observer.value.unobserve(element)
    }
  }

  const disconnect = () => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    observe,
    unobserve,
    disconnect
  }
}

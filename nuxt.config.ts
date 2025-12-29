// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image'
  ],
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Prefix backend Go yang akan di-proxy di dev dan diproxy oleh Nginx di prod
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/backend'
    }
  },

  build: {
    transpile: ['@tiptap/vue-3']
  },

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false },
    // Proxy ke backend Go saat development: /backend/** -> http://localhost:8080/api/v1/**
    '/backend/**': { proxy: 'http://localhost:8080/api/v1/**' }
  },
  compatibilityDate: '2024-07-11',
  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },
  vite: {
    resolve: {
      dedupe: [
        'prosemirror-state',
        'prosemirror-view',
        'prosemirror-model',
        'prosemirror-transform',
        'prosemirror-commands',
        'prosemirror-history',
        'prosemirror-dropcursor',
        'prosemirror-gapcursor',
        'prosemirror-keymap',
        'prosemirror-inputrules'
      ]
    },
    build: {
      target: 'es2022'
    },
    optimizeDeps: {
      include: []
    },
    ssr: {
      noExternal: ['@tiptap/*', 'prosemirror-*']
    }
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})

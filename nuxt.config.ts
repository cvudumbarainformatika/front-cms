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

  sourcemap: {
    client: false,
    server: false
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Private keys (Server Side Only)
    // Dapat di-override saat runtime via env var: NUXT_API_SECRET_TARGET
    apiSecretTarget: 'http://localhost:8080', 

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
    '/dashboard/**': { ssr: false }
  },
  compatibilityDate: '2024-07-11',
  nitro: {
    prerender: {
      routes: [],
      crawlLinks: false,
      failOnError: false
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

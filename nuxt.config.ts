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

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },

  compatibilityDate: '2024-07-11',

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

  build: {
    transpile: ['@tiptap/vue-3']
  },

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
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

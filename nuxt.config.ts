import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  ssr: false,
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0'
  },
  css: ['~/app.css'],
  modules: [
    ['@nuxt/ui', {
      fonts: false
    }],
    ['@nuxt/eslint', {
      config: {
        standalone: false
      }
    }]
  ],
  runtimeConfig: {
    public: {
      emailDomain: process.env.NUXT_PUBIC_EMAIL_DOMAIN || '',
    }
  }
})
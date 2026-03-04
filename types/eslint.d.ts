import type { ModuleOptions } from '@nuxt/eslint'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    eslint?: ModuleOptions
  }
  interface NuxtOptions {
    eslint?: ModuleOptions
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    eslint?: ModuleOptions
  }
  interface NuxtOptions {
    eslint?: ModuleOptions
  }
}

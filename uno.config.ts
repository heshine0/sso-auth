// uno.config.ts
import { defineConfig } from 'unocss'
import { presetWind3 } from '@unocss/preset-wind3'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import { transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify({ prefix: 'u-' }),
    presetIcons({ scale: 1.1 }),
  ],
  shortcuts: [
    ['page', 'p-4 md:p-6'],
    ['card', 'bg-white dark:bg-dark-800 rounded-lg shadow-sm p-4'],
    ['text-muted', 'text-gray-500 dark:text-gray-400'],
    ['btn', 'h-8 px-3 rounded text-sm inline-flex items-center gap-1'],
  ],
  transformers: [transformerVariantGroup()],
})

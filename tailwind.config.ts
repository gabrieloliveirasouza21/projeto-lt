// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}', // Garante que ele olhe dentro da pasta app
    './composables/**/*.{js,ts}',
    './utils/**/*.{js,ts}'
  ]
}
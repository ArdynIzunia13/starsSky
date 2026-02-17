import { defineConfig } from 'vite'

export default defineConfig({
  base: '/starsSky/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
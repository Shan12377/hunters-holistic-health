import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt', not 'autoUpdate'. autoUpdate uses skipWaiting, which means
      // needRefresh never fires and the "Update available" toast in App.tsx can
      // never appear. Home screen users then had no way to pull a fresh version.
      registerType: 'prompt',
      includeAssets: ['logo.png', 'logo-mark.png', 'favicon-64.png'],
      manifest: {
        name: "Hunter's Holistic Health",
        short_name: 'HHH',
        description: 'Functional Medicine Education',
        theme_color: '#0B9E8E',
        background_color: '#0e1c1b',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Push + notification click handlers live in public/push-sw.js.
        importScripts: ['push-sw.js'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true,
  },
})

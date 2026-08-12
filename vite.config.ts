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
        // PNGs are deliberately NOT precached. They were 1.46 MB of the install
        // download, and a photo that has not downloaded yet degrades to a blank
        // image rather than breaking the app. They are cached on first view
        // instead, by the runtimeCaching rule below.
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
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

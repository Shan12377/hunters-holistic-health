// Push notification handlers, imported into the generated service worker via
// workbox importScripts (see vite.config.ts). Without this file, sent pushes
// arrive at the device but never display.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Hunter's Holistic Health", {
      body: data.body || '',
      icon: data.icon || '/pwa-192.png',
      badge: data.badge || '/logo-mark.png',
      tag: data.tag || 'hhh',
      data: { url: data.url || '/app/dashboard' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/app/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})

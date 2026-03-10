// Kariah — Push Notification Service Worker

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const {
    title = 'Kariah',
    body  = 'Anda mempunyai pemberitahuan baru.',
    url   = '/',
    icon  = '/icons/icon.svg',
  } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/icons/icon.svg',
      data:  { url },
      vibrate: [200, 100, 200],
      requireInteraction: false,
      tag: 'kariah-notification',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        if (clients.openWindow) return clients.openWindow(url)
      })
  )
})

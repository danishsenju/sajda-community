// Kariah — Push Notification Service Worker

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const {
    title = 'Kariah',
    body  = 'Anda mempunyai pemberitahuan baru.',
    url   = '/',
    icon  = '/icons/icon-192.png',
    badge = '/icons/icon-192.png',
    tag,
    requireInteraction = false,
    userId,
    actions,
  } = data

  const options = {
    body,
    icon,
    badge,
    data:  { url, userId },
    vibrate: [200, 100, 200],
    requireInteraction,
    tag: tag || 'kariah-notification',
    renotify: true,
  }

  // Action buttons (Android Chrome only — iOS silently ignores)
  if (actions) options.actions = actions

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action = event.action          // 'snooze' | 'off' | '' (body tap)
  const { url = '/', userId } = event.notification.data || {}

  // Snooze: set snoozed_until = now + 10 min, no app open
  if (action === 'snooze' && userId) {
    event.waitUntil(
      fetch('/api/alarm/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    )
    return
  }

  // Off: turn alarm off entirely, no app open
  if (action === 'off' && userId) {
    event.waitUntil(
      fetch('/api/alarm/off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    )
    return
  }

  // Default (body tap): open/focus app
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

'use client'

import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export type PushState = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

export function usePushNotification() {
  const [state, setState] = useState<PushState>('loading')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported'); return
    }
    if (Notification.permission === 'denied') {
      setState('denied'); return
    }

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setSubscription(sub)
      setState(sub ? 'subscribed' : 'unsubscribed')
    })
  }, [])

  async function subscribe() {
    if (!('serviceWorker' in navigator)) return
    setState('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) throw new Error('VAPID key not configured')

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      setSubscription(sub)
      setState('subscribed')
    } catch {
      setState(Notification.permission === 'denied' ? 'denied' : 'unsubscribed')
    }
  }

  async function unsubscribe() {
    if (!subscription) return
    setState('loading')
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })
    await subscription.unsubscribe()
    setSubscription(null)
    setState('unsubscribed')
  }

  return { state, subscribe, unsubscribe }
}

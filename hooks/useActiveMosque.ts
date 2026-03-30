'use client'

import { useState, useEffect } from 'react'

export interface ActiveMosque {
  id:    string
  name:  string
  slug:  string
  state: string | null
}

const KEY = 'active_mosque'

export function getActiveMosque(): ActiveMosque | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ActiveMosque) : null
  } catch {
    return null
  }
}

export function setActiveMosqueStore(mosque: ActiveMosque) {
  localStorage.setItem(KEY, JSON.stringify(mosque))
  window.dispatchEvent(new CustomEvent('active-mosque-change', { detail: mosque }))
}

export function clearActiveMosque() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent('active-mosque-change', { detail: null }))
}

export function useActiveMosque() {
  const [active, setActive] = useState<ActiveMosque | null>(null)

  useEffect(() => {
    setActive(getActiveMosque())

    const handler = (e: Event) => {
      setActive((e as CustomEvent<ActiveMosque | null>).detail)
    }
    window.addEventListener('active-mosque-change', handler)
    return () => window.removeEventListener('active-mosque-change', handler)
  }, [])

  function setMosque(mosque: ActiveMosque) {
    setActiveMosqueStore(mosque)
    setActive(mosque)
  }

  return { active, setMosque }
}

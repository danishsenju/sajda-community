'use client'

import { useEffect, useState } from 'react'

export type TextSize = 'small' | 'regular' | 'large'

const SIZES: Record<TextSize, number> = {
  small:   0.88,
  regular: 1,
  large:   1.16,
}

export function useTextSize() {
  const [size, setSize] = useState<TextSize>('regular')

  useEffect(() => {
    const stored = (localStorage.getItem('text-size') as TextSize) || 'regular'
    setSize(stored)
    applyZoom(stored)
  }, [])

  function applyZoom(s: TextSize) {
    document.documentElement.style.zoom = String(SIZES[s])
  }

  function changeSize(s: TextSize) {
    setSize(s)
    localStorage.setItem('text-size', s)
    applyZoom(s)
  }

  return { size, changeSize }
}

'use client'

import React, { useEffect, useRef, useState, useId } from 'react'

export interface GlassSurfaceProps {
  children?: React.ReactNode
  width?: number | string
  height?: number | string
  borderRadius?: number
  borderWidth?: number
  brightness?: number
  opacity?: number
  blur?: number
  displace?: number
  backgroundOpacity?: number
  saturation?: number
  distortionScale?: number
  redOffset?: number
  greenOffset?: number
  blueOffset?: number
  xChannel?: 'R' | 'G' | 'B'
  yChannel?: 'R' | 'G' | 'B'
  mixBlendMode?: React.CSSProperties['mixBlendMode']
  className?: string
  style?: React.CSSProperties
}

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDark
}

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  className = '',
  style = {},
}) => {
  const uniqueId = useId().replace(/:/g, '-')
  const filterId   = `glass-filter-${uniqueId}`
  const redGradId  = `red-grad-${uniqueId}`
  const blueGradId = `blue-grad-${uniqueId}`

  const [svgSupported, setSvgSupported] = useState(false)
  const containerRef    = useRef<HTMLDivElement>(null)
  const feImageRef      = useRef<SVGFEImageElement>(null)
  const redChannelRef   = useRef<SVGFEDisplacementMapElement>(null)
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null)
  const blueChannelRef  = useRef<SVGFEDisplacementMapElement>(null)
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null)

  const isDark = useDarkMode()

  const generateMap = () => {
    const rect  = containerRef.current?.getBoundingClientRect()
    const w     = rect?.width  || 400
    const h     = rect?.height || 200
    const edge  = Math.min(w, h) * (borderWidth * 0.5)
    const svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${redGradId}"  x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="black"/>
      <rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${redGradId})"/>
      <rect width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode:${mixBlendMode}"/>
      <rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${borderRadius}"
        fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)"/>
    </svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }

  const update = () => {
    feImageRef.current?.setAttribute('href', generateMap())
    ;[
      { ref: redChannelRef,   offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef,  offset: blueOffset },
    ].forEach(({ ref, offset }) => {
      if (!ref.current) return
      ref.current.setAttribute('scale', (distortionScale + offset).toString())
      ref.current.setAttribute('xChannelSelector', xChannel)
      ref.current.setAttribute('yChannelSelector', yChannel)
    })
    gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString())
  }

  useEffect(update, [width, height, borderRadius, borderWidth, brightness, opacity, blur, displace, distortionScale, redOffset, greenOffset, blueOffset, xChannel, yChannel, mixBlendMode])

  useEffect(() => {
    const supportsSVG = () => {
      if (typeof window === 'undefined') return false
      if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) return false
      if (/Firefox/.test(navigator.userAgent)) return false
      const el = document.createElement('div')
      el.style.backdropFilter = `url(#${filterId})`
      return el.style.backdropFilter !== ''
    }
    setSvgSupported(supportsSVG())
  }, [filterId])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(() => setTimeout(update, 0))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const supportsBackdrop = () =>
    typeof window !== 'undefined' && CSS.supports('backdrop-filter', 'blur(10px)')

  const containerStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      ...style,
      width:        typeof width  === 'number' ? `${width}px`  : width,
      height:       typeof height === 'number' ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
    }

    if (svgSupported) {
      return {
        ...base,
        background:     isDark ? `hsl(0 0% 0% / ${backgroundOpacity})` : `hsl(0 0% 100% / ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation})`,
        boxShadow: isDark
          ? `0 0 2px 1px color-mix(in oklch,white,transparent 65%) inset,0 0 10px 4px color-mix(in oklch,white,transparent 85%) inset,0 4px 16px rgba(17,17,26,.05),0 8px 24px rgba(17,17,26,.05),0 16px 56px rgba(17,17,26,.05)`
          : `0 0 2px 1px color-mix(in oklch,black,transparent 85%) inset,0 0 10px 4px color-mix(in oklch,black,transparent 90%) inset,0 4px 16px rgba(17,17,26,.05),0 8px 24px rgba(17,17,26,.05),0 16px 56px rgba(17,17,26,.05)`,
      }
    }

    const bd = supportsBackdrop()
    if (isDark) {
      return {
        ...base,
        background:           bd ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.4)',
        backdropFilter:       bd ? `blur(12px) saturate(${saturation * 1.8}) brightness(1.2)` : undefined,
        WebkitBackdropFilter: bd ? `blur(12px) saturate(${saturation * 1.8}) brightness(1.2)` : undefined,
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.2),inset 0 -1px 0 0 rgba(255,255,255,0.1)',
      }
    }
    return {
      ...base,
      background:           bd ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.4)',
      backdropFilter:       bd ? `blur(12px) saturate(${saturation * 1.8}) brightness(1.1)` : undefined,
      WebkitBackdropFilter: bd ? `blur(12px) saturate(${saturation * 1.8}) brightness(1.1)` : undefined,
      border: '1px solid rgba(255,255,255,0.3)',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15),0 2px 16px 0 rgba(31,38,135,0.08),inset 0 1px 0 0 rgba(255,255,255,0.45),inset 0 -1px 0 0 rgba(255,255,255,0.2)',
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out ${className}`}
      style={containerStyle()}
    >
      <svg className="w-full h-full pointer-events-none absolute inset-0 opacity-0 -z-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" result="dispRed" />
            <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
            <feDisplacementMap ref={greenChannelRef} in="SourceGraphic" in2="map" result="dispGreen" />
            <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
            <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" result="dispBlue" />
            <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg"  in2="blue"  mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>
      <div className="w-full h-full flex items-center justify-center p-2 rounded-[inherit] relative z-10">
        {children}
      </div>
    </div>
  )
}

export default GlassSurface

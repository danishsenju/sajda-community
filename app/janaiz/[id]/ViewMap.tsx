'use client'

import { useEffect, useRef } from 'react'

type Props = { lat: number; lng: number; label: string }

export default function ViewMap({ lat, lng, label }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  useEffect(() => {
    if (!mapRef.current || initRef.current) return
    initRef.current = true

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      L.marker([lat, lng]).addTo(map)
        .bindPopup(label, { autoClose: false, closeOnClick: false })
        .openPopup()
    })
  }, [lat, lng, label])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: '220px', width: '100%' }} />
    </>
  )
}

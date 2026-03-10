'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'

type LatLng = { lat: number; lng: number }

type Props = {
  value?: LatLng | null
  onChange: (pos: LatLng, label: string) => void
  defaultCenter?: LatLng
}

const DEFAULT_CENTER: LatLng = { lat: 3.1716, lng: 101.5344 } // Masjid Saujana Utama

export function LocationPicker({ value, onChange, defaultCenter = DEFAULT_CENTER }: Props) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<{
    map: ReturnType<typeof import('leaflet')['map']>
    marker: ReturnType<typeof import('leaflet')['marker']> | null
    L: typeof import('leaflet')
  } | null>(null)

  const [query,       setQuery]       = useState('')
  const [searching,   setSearching]   = useState(false)
  const [searchError, setSearchError] = useState('')
  const [address,     setAddress]     = useState('')

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return

    import('leaflet').then((L) => {
      // Fix default icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = value ?? defaultCenter
      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng],
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      let marker: ReturnType<typeof L.marker> | null = null

      if (value) {
        marker = L.marker([value.lat, value.lng], { draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const pos = marker!.getLatLng()
          reverseGeocode(pos.lat, pos.lng, L, marker!, onChange, setAddress)
        })
      }

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng
        if (marker) {
          marker.setLatLng([lat, lng])
        } else {
          marker = L.marker([lat, lng], { draggable: true }).addTo(map)
          marker.on('dragend', () => {
            const pos = marker!.getLatLng()
            reverseGeocode(pos.lat, pos.lng, L, marker!, onChange, setAddress)
          })
          leafletRef.current!.marker = marker
        }
        reverseGeocode(lat, lng, L, marker, onChange, setAddress)
      })

      leafletRef.current = { map, marker, L }
    })

    return () => {
      leafletRef.current?.map.remove()
      leafletRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function reverseGeocode(
    lat: number,
    lng: number,
    L: typeof import('leaflet'),
    marker: ReturnType<typeof import('leaflet')['marker']>,
    cb: (pos: LatLng, label: string) => void,
    setAddr: (s: string) => void,
  ) {
    cb({ lat, lng }, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { 'Accept-Language': 'ms,en' } }
      )
      const data = await res.json()
      const label = data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddr(label)
      cb({ lat, lng }, label)
      marker.bindPopup(label.split(',').slice(0, 3).join(', ')).openPopup()
    } catch {
      // use coords as fallback
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || !leafletRef.current) return
    setSearching(true)
    setSearchError('')

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=my&limit=1`,
        { headers: { 'Accept-Language': 'ms,en' } }
      )
      const results = await res.json()
      if (!results.length) { setSearchError('Lokasi tidak dijumpai. Cuba carian lain.'); return }

      const { lat, lon, display_name } = results[0]
      const { map, L } = leafletRef.current
      const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) }
      map.setView([newPos.lat, newPos.lng], 16, { animate: true })

      let { marker } = leafletRef.current
      if (marker) {
        marker.setLatLng([newPos.lat, newPos.lng])
      } else {
        marker = L.marker([newPos.lat, newPos.lng], { draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const pos = marker!.getLatLng()
          reverseGeocode(pos.lat, pos.lng, L, marker!, onChange, setAddress)
        })
        leafletRef.current.marker = marker
      }
      marker.bindPopup(display_name.split(',').slice(0, 3).join(', ')).openPopup()
      setAddress(display_name)
      onChange(newPos, display_name)
    } catch {
      setSearchError('Ralat carian. Sila cuba lagi.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari lokasi (cth: Masjid Saujana Utama)..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--elevated)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <Search style={{
            position: 'absolute', left: '11px', top: '50%',
            transform: 'translateY(-50%)',
            width: '14px', height: '14px', color: 'var(--text-dim)',
            pointerEvents: 'none',
          }} />
        </div>
        <button
          type="submit"
          disabled={searching}
          style={{
            padding: '10px 16px', borderRadius: '10px',
            background: 'var(--primary)', color: '#08090E',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            opacity: searching ? 0.7 : 1,
          }}
        >
          {searching ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 0.8s linear infinite' }} /> : 'Cari'}
        </button>
      </form>

      {searchError && (
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#EF4444', marginBottom: '8px' }}>
          {searchError}
        </p>
      )}

      {/* Map */}
      <div
        ref={mapRef}
        style={{
          height: '300px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      />

      {/* Selected address */}
      {address && (
        <div style={{
          marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px',
          padding: '10px 12px', borderRadius: '8px',
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
        }}>
          <MapPin style={{ width: '12px', height: '12px', color: '#22C55E', flexShrink: 0, marginTop: '2px' }} />
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
            color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5,
          }}>
            {address.split(',').slice(0, 4).join(', ')}
          </p>
        </div>
      )}

      <p style={{
        fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
        color: 'var(--text-dim)', marginTop: '6px',
      }}>
        Klik pada peta atau cari untuk pin lokasi pengkebumian
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

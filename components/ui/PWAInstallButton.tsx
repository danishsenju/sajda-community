'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  if (installed || !showBanner) return null

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 999, width: 'calc(100% - 32px)', maxWidth: '420px',
      background: 'rgba(12,30,20,0.96)', backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(82,201,122,0.3)',
      boxShadow: '0 1.5px 0 rgba(82,201,122,0.4) inset, 0 8px 32px rgba(0,0,0,0.4)',
      borderRadius: '14px', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: '12px',
      animation: 'slideUp 0.4s cubic-bezier(0.34,1.2,0.64,1)',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
        background: 'rgba(82,201,122,0.12)', border: '1px solid rgba(82,201,122,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Smartphone style={{ width: '18px', height: '18px', color: '#52c97a' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
          color: 'rgba(255,255,255,0.88)', marginBottom: '1px',
        }}>
          Pasang Sajda di telefon
        </p>
        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>
          Akses pantas tanpa buka pelayar
        </p>
      </div>
      <button onClick={handleInstall} style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '8px 14px', borderRadius: '8px',
        background: '#52c97a', color: '#04080A',
        fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
        border: 'none', cursor: 'pointer', flexShrink: 0,
      }}>
        <Download style={{ width: '13px', height: '13px' }} />
        Pasang
      </button>
      <button onClick={() => setShowBanner(false)} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.3)', padding: '4px', flexShrink: 0,
      }}>
        <X style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  )
}

// Static inline version for the masjid page install section
export function PWAInstallInline() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
  }

  if (installed) {
    return (
      <div style={{
        padding: '16px 20px', borderRadius: '12px',
        background: 'rgba(82,201,122,0.07)', border: '1px solid rgba(82,201,122,0.2)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ fontSize: '18px' }}>✓</span>
        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600,
          color: '#52c97a',
        }}>
          Kariah sudah dipasang di peranti ini
        </p>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      background: 'rgba(82,201,122,0.06)',
      border: '1px solid rgba(82,201,122,0.2)',
      boxShadow: '0 1.5px 0 rgba(82,201,122,0.3) inset',
    }}>
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            background: 'rgba(82,201,122,0.12)', border: '1px solid rgba(82,201,122,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Smartphone style={{ width: '20px', height: '20px', color: '#52c97a' }} />
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 700,
              color: 'rgba(255,255,255,0.88)', marginBottom: '2px',
            }}>
              Pasang Sebagai App
            </p>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>
              Progressive Web App — percuma, ringan, tiada app store
            </p>
          </div>
        </div>

        {/* Feature list */}
        {['Akses pantas dari skrin utama', 'Notifikasi waktu solat & program', 'Berfungsi tanpa internet (offline mode)', 'Tiada perlu muat turun dari store'].map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#52c97a', flexShrink: 0 }} />
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
              {f}
            </p>
          </div>
        ))}

        {deferredPrompt ? (
          <button onClick={handleInstall} style={{
            marginTop: '16px', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px', borderRadius: '10px',
            background: '#52c97a', color: '#04080A',
            fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700,
            border: 'none', cursor: 'pointer',
          }}>
            <Download style={{ width: '16px', height: '16px' }} />
            Pasang Sajda Sekarang
          </button>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '12px',
              color: 'rgba(255,255,255,0.35)', marginBottom: '8px',
            }}>
              Cara memasang secara manual:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'iOS / Safari', steps: 'Ketik Share → Add to Home Screen' },
                { label: 'Android / Chrome', steps: 'Menu (⋮) → Add to Home Screen' },
              ].map((item) => (
                <div key={item.label} style={{
                  padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700, color: '#52c97a', marginBottom: '3px' }}>
                    {item.label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '10px', color: 'rgba(255,255,255,0.38)' }}>
                    {item.steps}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

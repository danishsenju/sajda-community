'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share, MoreVertical, Plus, Smartphone } from 'lucide-react'

type Platform = 'ios' | 'android' | 'other'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'other'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
  const [platform, setPlatform] = useState<Platform>('other')
  const [installed, setInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Check if already installed or dismissed
    if (isStandalone()) { setInstalled(true); return }
    if (localStorage.getItem('pwa-install-dismissed') === '1') { setDismissed(true); return }

    setPlatform(detectPlatform())

    // Capture Android install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Mark as installed if app was installed
    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
    setInstalling(false)
    setShowModal(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', '1')
    setDismissed(true)
    setShowModal(false)
  }

  // Don't show if installed, dismissed, or not a mobile platform
  if (installed || dismissed || platform === 'other') return null

  return (
    <>
      {/* ── Trigger button — small pill above bottom nav ── */}
      <div
        className="md:hidden fixed z-40"
        style={{
          bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
          right: '16px',
        }}
      >
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '100px',
            background: 'var(--primary)',
            color: '#08090E',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(34,197,94,0.40)',
            letterSpacing: '0.01em',
          }}
        >
          <Download style={{ width: '14px', height: '14px' }} />
          Pasang App
        </button>
      </div>

      {/* ── Modal overlay ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid var(--border-accent)',
              width: '100%',
              maxWidth: '480px',
              padding: '0 0 env(safe-area-inset-bottom, 20px)',
              animation: 'sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            {/* Green accent line */}
            <div style={{
              height: '3px',
              background: 'linear-gradient(90deg, transparent 0%, var(--primary) 40%, var(--primary) 60%, transparent 100%)',
              borderRadius: '3px 3px 0 0',
            }} />

            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '100px', background: 'var(--border-accent)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Smartphone style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                    Pasang Sajda
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: 1.3 }}>
                    Buka dari skrin utama dengan mudah
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--elevated)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <X style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
              </button>
            </div>

            {/* Content — platform-specific */}
            <div style={{ padding: '0 20px 20px' }}>
              {platform === 'android' && deferredPrompt ? (
                // Android — native install
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                    Tekan butang di bawah. Aplikasi akan dipasang dan ikon Sajda akan muncul di skrin utama telefon anda.
                  </p>
                  <button
                    onClick={handleAndroidInstall}
                    disabled={installing}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px',
                      background: 'var(--primary)', color: '#08090E',
                      fontFamily: 'var(--font-dm-sans)', fontSize: '15px', fontWeight: 700,
                      border: 'none', cursor: installing ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      opacity: installing ? 0.7 : 1,
                    }}
                  >
                    <Download style={{ width: '18px', height: '18px' }} />
                    {installing ? 'Memasang...' : 'Pasang Sekarang'}
                  </button>
                </div>
              ) : (
                // iOS — manual instructions
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                    Ikuti langkah mudah ini untuk simpan Sajda di skrin utama iPhone / iPad anda:
                  </p>

                  {/* Steps */}
                  {[
                    {
                      num: '1',
                      icon: <Share style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />,
                      title: 'Tekan ikon Kongsi',
                      desc: 'Di bahagian bawah pelayar Safari, tekan ikon anak panah ke atas (□↑)',
                    },
                    {
                      num: '2',
                      icon: <Plus style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />,
                      title: 'Pilih "Add to Home Screen"',
                      desc: 'Tatal ke bawah dan cari pilihan "Add to Home Screen" atau "Tambah ke Skrin Utama"',
                    },
                    {
                      num: '3',
                      icon: <Smartphone style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />,
                      title: 'Tekan "Add"',
                      desc: 'Tekan "Add" di sudut kanan atas. Ikon Sajda akan muncul di skrin utama anda!',
                    },
                  ].map((step) => (
                    <div
                      key={step.num}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '12px 14px', borderRadius: '14px',
                        background: 'var(--elevated)', border: '1px solid var(--border)',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {step.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                          Langkah {step.num}: {step.title}
                        </p>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* iOS tip */}
                  <div style={{
                    marginTop: '12px', padding: '10px 14px', borderRadius: '12px',
                    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
                  }}>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--primary)', margin: 0, lineHeight: 1.5 }}>
                      💡 <strong>Tip:</strong> Pastikan anda menggunakan pelayar <strong>Safari</strong> di iPhone/iPad. Ciri ini tidak tersedia di Chrome/Firefox untuk iOS.
                    </p>
                  </div>
                </div>
              )}

              {/* Android without prompt — show manual instructions */}
              {platform === 'android' && !deferredPrompt && (
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                    Untuk pasang Sajda di Android:
                  </p>
                  {[
                    {
                      icon: <MoreVertical style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />,
                      title: 'Tekan menu ⋮ di Chrome',
                      desc: 'Tekan tiga titik di sudut kanan atas pelayar Chrome',
                    },
                    {
                      icon: <Plus style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />,
                      title: 'Pilih "Add to Home screen"',
                      desc: 'Cari pilihan "Add to Home screen" atau "Tambah ke skrin utama"',
                    },
                    {
                      icon: <Smartphone style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />,
                      title: 'Tekan "Add"',
                      desc: 'Sahkan untuk memasang. Ikon Sajda akan muncul di skrin utama!',
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '12px 14px', borderRadius: '14px',
                        background: 'var(--elevated)', border: '1px solid var(--border)',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {step.icon}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                          Langkah {i + 1}: {step.title}
                        </p>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                style={{
                  width: '100%', marginTop: '12px', padding: '12px',
                  borderRadius: '12px', background: 'transparent',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                  color: 'var(--text-dim)', fontWeight: 500,
                }}
              >
                Jangan tunjuk lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

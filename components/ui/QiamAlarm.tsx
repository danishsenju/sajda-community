'use client'

import { useState, useEffect } from 'react'
import { Moon, BellRing, Bell, Clock, Loader2 } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

export function QiamAlarm() {
  const { state: pushState, subscribe } = usePushNotification()

  const [alarmTime, setAlarmTime] = useState('03:30')
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load existing alarm setting
  useEffect(() => {
    fetch('/api/alarm/qiam')
      .then(r => r.json())
      .then(({ alarm }) => {
        if (alarm) {
          // Convert HH:MM:SS → HH:MM for <input type="time">
          setAlarmTime(alarm.alarm_time?.slice(0, 5) ?? '03:30')
          setIsActive(alarm.is_active ?? false)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function save(newActive: boolean, newTime: string) {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/alarm/qiam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarm_time: newTime, is_active: newActive }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  async function handleToggle() {
    // If enabling and push not subscribed — subscribe first
    if (!isActive && pushState === 'unsubscribed') {
      await subscribe()
    }
    const next = !isActive
    setIsActive(next)
    save(next, alarmTime)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAlarmTime(e.target.value)
    if (isActive) save(true, e.target.value)
  }

  if (loading) {
    return <div className="skeleton h-28 rounded-2xl w-full" />
  }

  const pushBlocked = pushState === 'denied'
  const pushNeeded = pushState === 'unsubscribed' && !isActive

  return (
    <div style={{
      borderRadius: '16px',
      background: isActive ? 'rgba(167,139,250,0.06)' : 'var(--surface)',
      border: `1px solid ${isActive ? 'rgba(167,139,250,0.25)' : 'var(--border)'}`,
      overflow: 'hidden',
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      {/* Active glow bar */}
      {isActive && (
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #A78BFA 40%, #A78BFA 60%, transparent 100%)',
        }} />
      )}

      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: isActive ? 'rgba(167,139,250,0.15)' : 'var(--elevated)',
              border: `1px solid ${isActive ? 'rgba(167,139,250,0.3)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <Moon style={{ width: '16px', height: '16px', color: isActive ? '#A78BFA' : 'var(--text-dim)' }} />
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700,
                color: 'var(--text-primary)', margin: 0, lineHeight: 1.2,
              }}>
                Alarm Qiam / Tahajud
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
                color: 'var(--text-dim)', margin: '2px 0 0',
              }}>
                {isActive ? '🔔 Aktif — notifikasi akan dihantar' : 'Nyalakan untuk diingatkan'}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            disabled={pushBlocked || saving}
            aria-label={isActive ? 'Matikan alarm' : 'Aktifkan alarm'}
            style={{
              width: '46px', height: '26px', borderRadius: '100px', flexShrink: 0,
              background: isActive ? '#A78BFA' : 'var(--border)',
              border: 'none', cursor: pushBlocked ? 'not-allowed' : 'pointer',
              position: 'relative', transition: 'background 0.2s',
              opacity: pushBlocked ? 0.5 : 1,
            }}
          >
            <span style={{
              position: 'absolute',
              top: '3px',
              left: isActive ? '23px' : '3px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {saving && (
                <Loader2 style={{ width: '10px', height: '10px', color: '#A78BFA', animation: 'spin 0.8s linear infinite' }} />
              )}
            </span>
          </button>
        </div>

        {/* Time picker — only shown when active */}
        {isActive && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(167,139,250,0.06)',
            border: '1px solid rgba(167,139,250,0.15)',
          }}>
            <Clock style={{ width: '14px', height: '14px', color: '#A78BFA', flexShrink: 0 }} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, flex: 1 }}>
              Masa alarm
            </p>
            <input
              type="time"
              value={alarmTime}
              onChange={handleTimeChange}
              style={{
                background: 'var(--elevated)',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '15px',
                fontWeight: 600,
                color: '#A78BFA',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
        )}

        {/* Push not subscribed warning */}
        {pushNeeded && (
          <div style={{
            marginTop: '10px', padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Bell style={{ width: '12px', height: '12px', color: '#FBBF24', flexShrink: 0 }} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#FBBF24', margin: 0, lineHeight: 1.4 }}>
              Aktifkan notifikasi di atas dahulu supaya alarm berfungsi apabila telefon dikunci.
            </p>
          </div>
        )}

        {/* Push blocked */}
        {pushBlocked && (
          <div style={{
            marginTop: '10px', padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#EF4444', margin: 0 }}>
              Notifikasi disekat. Buka tetapan pelayar dan benarkan notifikasi untuk laman ini.
            </p>
          </div>
        )}

        {/* Saved confirmation */}
        {saved && (
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
            color: '#A78BFA', marginTop: '8px', textAlign: 'right',
          }}>
            ✓ Disimpan
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

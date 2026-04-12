'use client'

import { useState }    from 'react'
import { Loader2, X }  from 'lucide-react'
import type { PlanTier } from '@/lib/planFeatures'

interface Props {
  plan:        PlanTier
  mosqueId:    string
  mosqueName:  string
  email:       string
  label:       string
  highlight:   boolean
}

export default function BillingActions({ plan, mosqueId, mosqueName, email, label, highlight }: Props) {
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState<string | null>(null)

  async function handleSubscribe() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/billplz/create-bill', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan, mosque_name: mosqueName, email, mosque_id: mosqueId }),
      })
      const data = await res.json() as { ok: boolean; bill_url?: string; message?: string }

      if (!res.ok || !data.ok || !data.bill_url) {
        setError(data.message ?? 'Ralat sambungan. Cuba lagi.')
        return
      }

      window.location.href = data.bill_url
    } catch {
      setError('Ralat sambungan. Cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
          background: highlight ? 'var(--primary)' : 'transparent',
          color:      highlight ? 'var(--void)'    : 'var(--text-secondary)',
          border:     highlight ? 'none'            : '1px solid var(--border-lit)',
          fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-dm-sans)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: loading ? 0.7 : 1,
          transition: 'filter 0.15s, opacity 0.15s',
        }}
        onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none' }}
      >
        {loading ? (
          <>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Memproses...
          </>
        ) : label}
      </button>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 8, padding: '8px 12px', borderRadius: 8,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)',
        }}>
          <X size={12} color="var(--accent-red)" />
          <p style={{ fontSize: 12, color: 'var(--accent-red)', margin: 0 }}>{error}</p>
        </div>
      )}
    </div>
  )
}

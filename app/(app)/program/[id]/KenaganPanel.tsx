'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { BookHeart, X, MessageCircle, Copy, ExternalLink, Check } from 'lucide-react'

type Props = {
  programId: string
  userId: string | null
  programTitle: string
  programDate: string
  programCategory: string
  existingReflection: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  solat: 'Solat', kebajikan: 'Kebajikan',
  ramadan: 'Ramadan', gotong_royong: 'Gotong Royong', umum: 'Program',
}

function formatDateMY(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogs', 'Sep', 'Okt', 'Nov', 'Dis']
  const d = new Date(dateStr)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function KenaganPanel({ programId, userId, programTitle, programDate, programCategory, existingReflection }: Props) {
  const [open, setOpen] = useState(false)
  const [reflection, setReflection] = useState(existingReflection ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!userId) return null

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/program/${programId}/sijil/${userId}`
    : `/program/${programId}/sijil/${userId}`

  const shareText = `Saya telah menyertai "${programTitle}" di Masjid Saujana Utama! 🕌`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`

  async function saveReflection() {
    if (!userId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('program_memories').upsert(
      { program_id: programId, user_id: userId, reflection: reflection.trim() || null },
      { onConflict: 'program_id,user_id' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: shareText, url: shareUrl }) } catch { /* cancelled */ }
    }
  }

  const catLabel = CATEGORY_LABELS[programCategory] ?? 'Program'
  const dateLabel = formatDateMY(programDate)

  return (
    <>
      {/* Trigger button */}
      <div className="rounded-2xl border p-5 animate-slideUp"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', marginBottom: '20px' }}>
        <div className="flex items-center gap-3 mb-3">
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookHeart style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Kenangan Anda
            </p>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
              {existingReflection ? 'Anda telah meninggalkan kenangan' : 'Kongsi pengalaman dan dapatkan sijil'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%', padding: '11px', borderRadius: '12px',
            background: 'var(--primary)', border: 'none',
            fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
            color: '#04080A', cursor: 'pointer', transition: 'opacity 0.15s',
          }}
        >
          {existingReflection ? 'Kemaskini & Kongsi Kenangan' : 'Tulis & Kongsi Kenangan'}
        </button>
      </div>

      {/* Bottom sheet */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 70,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end',
            animation: 'fadeIn 0.18s ease',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: '560px', margin: '0 auto',
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -24px 60px rgba(0,0,0,0.5)',
              animation: 'sheetUp 0.25s cubic-bezier(0.16,1,0.3,1)',
              maxHeight: '90vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '100px', background: 'var(--border)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Kongsi Kenangan
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
              >
                <X style={{ width: '16px', height: '16px', color: 'var(--text-dim)' }} />
              </button>
            </div>

            <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Mini certificate preview */}
              <div style={{
                borderRadius: '14px', border: '1px solid rgba(34,197,94,0.2)',
                background: 'var(--void)', padding: '20px', textAlign: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.04), transparent 70%)' }} />
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '8px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '5px' }}>
                  Masjid Saujana Utama · Sijil Penyertaan
                </p>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Nama Anda
                </p>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  telah menyertai
                </p>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '14px', fontWeight: 600, color: 'var(--primary)', marginBottom: '10px', lineHeight: 1.3 }}>
                  {programTitle}
                </p>
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: '100px',
                  border: '1px solid var(--border)', fontFamily: 'var(--font-jakarta)',
                  fontSize: '13px', color: 'var(--text-dim)',
                }}>
                  {dateLabel} · {catLabel}
                </span>
              </div>

              {/* Reflection textarea */}
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  Catatan Peribadi <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(pilihan, max 300 huruf)</span>
                </label>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Pengalaman, perasaan, atau ucapan syukur..."
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '12px',
                    border: '1px solid var(--border)', background: 'var(--void)',
                    fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-primary)',
                    resize: 'none', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '4px' }}>
                  {reflection.length}/300
                </p>
              </div>

              {/* Save reflection */}
              <button
                onClick={saveReflection}
                disabled={saving}
                style={{
                  width: '100%', padding: '11px', borderRadius: '12px',
                  background: saved ? 'rgba(34,197,94,0.1)' : 'var(--primary-pale)',
                  border: `1px solid ${saved ? 'rgba(34,197,94,0.3)' : 'transparent'}`,
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                  color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                {saved ? <><Check style={{ width: '13px', height: '13px' }} /> Tersimpan</> : saving ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>

              <div style={{ height: '1px', background: 'var(--border)' }} />

              {/* WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '13px', borderRadius: '14px',
                  background: 'var(--primary)', color: '#04080A', textDecoration: 'none',
                  fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                }}
              >
                <MessageCircle style={{ width: '16px', height: '16px' }} />
                Kongsi ke WhatsApp
              </a>

              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Copy link */}
                <button
                  onClick={handleCopy}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '11px', borderRadius: '12px',
                    background: copied ? 'rgba(34,197,94,0.08)' : 'var(--surface)',
                    border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                    color: copied ? 'var(--primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {copied ? <><Check style={{ width: '13px', height: '13px' }} /> Tersalin</> : <><Copy style={{ width: '13px', height: '13px' }} /> Salin Pautan</>}
                </button>

                {/* Open certificate */}
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '11px', borderRadius: '12px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', textDecoration: 'none',
                    fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                  Lihat Sijil
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

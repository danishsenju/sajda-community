'use server'

export const dynamic = 'force-dynamic'


import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check, X, Eye, Clock } from 'lucide-react'

type Item = {
  id: string; title: string; description: string; category: string;
  urgency: string; status: string; created_at: string;
  profiles: { full_name: string | null } | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', open: 'Terbuka', in_progress: 'Dalam Proses', resolved: 'Selesai',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B', open: '#22c55e', in_progress: '#3B82F6', resolved: '#6B7280',
}

async function approveAction(id: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('keperluan').update({
    status: 'open',
    approved_by: user?.id,
    approved_at: new Date().toISOString(),
  }).eq('id', id)
  revalidatePath('/admin/keperluan')
}

async function rejectAction(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('keperluan').delete().eq('id', id)
  revalidatePath('/admin/keperluan')
}

async function resolveAction(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('keperluan').update({ status: 'resolved' }).eq('id', id)
  revalidatePath('/admin/keperluan')
}

export default async function AdminKeperluanPage({
  searchParams,
}: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = 'pending' } = await searchParams
  const supabase = await createClient()

  let q = supabase
    .from('keperluan')
    .select('*, profiles!posted_by(full_name)')
    .order('created_at', { ascending: false })

  if (filter !== 'all') q = q.eq('status', filter as 'pending' | 'open' | 'in_progress' | 'resolved')

  const { data, error } = await q
  const items = (data ?? []) as unknown as Item[]

  const FILTERS = [
    { key: 'pending', label: 'Menunggu Kelulusan' },
    { key: 'open',    label: 'Aktif' },
    { key: 'all',     label: 'Semua' },
  ]

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m lepas`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}j lepas`
    return `${Math.floor(h / 24)}h lepas`
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '4px', fontWeight: 700 }}>
          Admin
        </p>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Urus Keperluan
        </h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <Link key={f.key} href={`/admin/keperluan?filter=${f.key}`}
            style={{
              padding: '7px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
              fontFamily: 'var(--font-jakarta)', textDecoration: 'none',
              background: filter === f.key ? 'var(--primary)' : 'transparent',
              color: filter === f.key ? '#fff' : 'var(--text-dim)',
              border: `1px solid ${filter === f.key ? 'var(--primary)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
            {f.label}
            {f.key === 'pending' && items.length > 0 && filter === 'pending' && (
              <span style={{
                marginLeft: '8px', background: 'rgba(255,255,255,0.25)',
                borderRadius: '999px', padding: '1px 7px', fontSize: '11px',
              }}>{items.length}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Debug: show error if any */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: '#FCA5A5',
        }}>
          Error: {error.message}
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => (
          <div key={item.id}
            style={{
              borderRadius: '16px', padding: '18px',
              background: 'var(--surface)',
              border: `1px solid ${item.status === 'pending' ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
              borderLeft: `4px solid ${STATUS_COLORS[item.status] ?? 'var(--border)'}`,
            }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Status + urgency badges */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: STATUS_COLORS[item.status] ?? '#fff',
                    background: `${STATUS_COLORS[item.status] ?? '#fff'}18`,
                    padding: '3px 9px', borderRadius: '4px',
                  }}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>
                  {item.urgency === 'urgent' && (
                    <span style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: '#FCA5A5', padding: '3px 9px',
                      background: 'rgba(239,68,68,0.14)', borderRadius: '4px',
                    }}>MENDESAK</span>
                  )}
                </div>

                {/* Title */}
                <p style={{
                  fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: '5px',
                }}>
                  {item.title}
                </p>

                {/* Description */}
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '13px', lineHeight: 1.6,
                  color: 'var(--text-dim)', marginBottom: '10px',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {item.description}
                </p>

                {/* Meta */}
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                } as React.CSSProperties}>
                  <span style={{ fontWeight: 600 }}>{item.profiles?.full_name ?? 'Jemaah'}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <Clock style={{ width: '11px', height: '11px' }} />
                  {timeAgo(item.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <Link href={`/keperluan/${item.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'var(--elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-dim)',
                  }}>
                  <Eye style={{ width: '14px', height: '14px' }} />
                </Link>

                {item.status === 'pending' && (
                  <>
                    <form action={approveAction.bind(null, item.id)}>
                      <button type="submit" title="Luluskan"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                          color: '#22c55e', cursor: 'pointer',
                        }}>
                        <Check style={{ width: '14px', height: '14px' }} />
                      </button>
                    </form>
                    <form action={rejectAction.bind(null, item.id)}>
                      <button type="submit" title="Tolak"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                          color: '#f87171', cursor: 'pointer',
                        }}>
                        <X style={{ width: '14px', height: '14px' }} />
                      </button>
                    </form>
                  </>
                )}

                {item.status === 'open' && (
                  <form action={resolveAction.bind(null, item.id)}>
                    <button type="submit"
                      style={{
                        padding: '5px 10px', borderRadius: '8px',
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                        color: '#818cf8', cursor: 'pointer',
                        fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                      Selesai
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', color: 'var(--text-dim)' }}>
              Tiada item untuk ditunjukkan.
            </p>
            {filter === 'pending' && (
              <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px', opacity: 0.6 }}>
                Semua keperluan jemaah telah diluluskan atau belum ada permohonan baru.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { redirect }       from 'next/navigation'
import { createClient }   from '@/lib/supabase-server'
import { Check, Crown, Zap, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react'
import { PLAN_FEATURES, FEATURE_LABELS, PLAN_LABEL, getPlanFeatureList } from '@/lib/planFeatures'
import type { PlanTier } from '@/lib/planFeatures'
import BillingActions     from './BillingActions'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDateBM(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function planIcon(plan: PlanTier) {
  switch (plan) {
    case 'surau':    return Zap
    case 'kariah':   return ShieldCheck
    case 'komuniti': return Crown
  }
}

const PLAN_PRICES_RM: Record<PlanTier, number> = {
  surau:    49,
  kariah:   149,
  komuniti: 349,
}

// ── Plan card shown when no active sub, or for upgrade options ───────────────
function PlanCard({
  plan,
  currentPlan,
  mosqueId,
  mosqueName,
  email,
}: {
  plan:        PlanTier
  currentPlan: PlanTier | null
  mosqueId:    string
  mosqueName:  string
  email:       string
}) {
  const isCurrent   = plan === currentPlan
  const isHighlight = plan === 'kariah'
  const Icon        = planIcon(plan)
  const features    = getPlanFeatureList(plan)

  return (
    <div style={{
      background:   isHighlight ? 'var(--surface)'   : 'var(--base)',
      border:       `1px solid ${isHighlight ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 16,
      padding:      '28px 24px',
      position:     'relative',
      boxShadow:    isHighlight ? '0 0 40px var(--primary-glow)' : 'none',
    }}>
      {isHighlight && !isCurrent && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--primary)', color: 'var(--void)',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
          padding: '4px 14px', borderRadius: 999,
          fontFamily: 'var(--font-dm-sans)',
        }}>
          Paling Popular
        </div>
      )}
      {isCurrent && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--primary-dim)', color: 'var(--void)',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
          padding: '4px 14px', borderRadius: 999,
          fontFamily: 'var(--font-dm-sans)',
        }}>
          Pelan Semasa
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--primary-ghost)', border: '1px solid var(--border-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color="var(--primary)" />
        </div>
        <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {PLAN_LABEL[plan]}
        </h3>
      </div>

      <div style={{ marginBottom: 20 }}>
        <span style={{ fontFamily: 'var(--font-syne)', fontSize: 36, fontWeight: 800, color: isCurrent || isHighlight ? 'var(--primary)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          RM{PLAN_PRICES_RM[plan]}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 4 }}>/bulan</span>
      </div>

      {/* CTA — rendered client-side so it can POST */}
      {!isCurrent ? (
        <BillingActions
          plan={plan}
          mosqueId={mosqueId}
          mosqueName={mosqueName}
          email={email}
          label={currentPlan ? 'Naik Taraf' : 'Langgan Sekarang'}
          highlight={isHighlight}
        />
      ) : (
        <div style={{
          width: '100%', padding: '10px 16px', borderRadius: 10, textAlign: 'center',
          background: 'var(--primary-ghost)', border: '1px solid var(--border-glow)',
          fontSize: 13, fontWeight: 600, color: 'var(--primary)',
          fontFamily: 'var(--font-dm-sans)',
        }}>
          Aktif
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {features.slice(0, 6).map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: 'var(--primary-ghost)', border: '1px solid var(--border-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={9} color="var(--primary)" strokeWidth={3} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {FEATURE_LABELS[f] ?? f}
            </span>
          </div>
        ))}
        {features.length > 6 && (
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
            + {features.length - 6} ciri lagi
          </p>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams
  const justPaid = params.status === 'success'

  // Step 1: get the mosque_id this user administers
  const { data: ajkRow } = await supabase
    .from('mosque_ajk')
    .select('mosque_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  // Step 2: fetch the mosque record
  const { data: mosque } = ajkRow?.mosque_id
    ? await supabase
        .from('mosques')
        .select('id, name, slug, is_active')
        .eq('id', ajkRow.mosque_id)
        .single()
    : { data: null }

  // Get subscription for this mosque
  const { data: sub } = mosque
    ? await supabase
        .from('subscriptions')
        .select('*')
        .eq('mosque_id', mosque.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null }

  const isActive  = sub?.status === 'active' && sub?.expires_at && new Date(sub.expires_at) > new Date()
  const currentPlan = isActive ? (sub!.plan as PlanTier) : null

  const allPlans: PlanTier[] = ['surau', 'kariah', 'komuniti']

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 16px 64px', minHeight: '100vh' }}>

      {/* ── Success banner ─────────────────────────────────────────────── */}
      {justPaid && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: 'var(--primary-ghost)', border: '1px solid var(--border-glow)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 32,
        }}>
          <Check size={18} color="var(--primary)" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
            <strong>Pembayaran berjaya!</strong>{' '}
            Selamat datang ke SAJDA {currentPlan ? PLAN_LABEL[currentPlan] : ''}. Platform masjid anda kini aktif.
          </p>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Bil & Langganan
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          Urus pelan SAJDA untuk {mosque?.name ?? 'masjid anda'}.
        </p>
      </div>

      {/* ── No mosque found ────────────────────────────────────────────── */}
      {!mosque && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 40,
        }}>
          <AlertCircle size={18} color="var(--amber)" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Tiada masjid dikaitkan
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Daftar masjid anda terlebih dahulu sebelum memilih pelan.{' '}
              <a href="/daftar" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Daftar sekarang</a>
            </p>
          </div>
        </div>
      )}

      {/* ── Current plan summary ────────────────────────────────────────── */}
      {isActive && currentPlan && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-lit)',
          borderRadius: 16, padding: '24px', marginBottom: 48,
          display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: 'var(--primary-ghost)', border: '1px solid var(--border-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {(() => { const Icon = planIcon(currentPlan); return <Icon size={20} color="var(--primary)" /> })()}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 4, fontFamily: 'var(--font-dm-sans)' }}>
                Pelan Semasa
              </p>
              <p style={{ fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                SAJDA {PLAN_LABEL[currentPlan]}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Status</p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: 'var(--primary)',
                background: 'var(--primary-ghost)', border: '1px solid var(--border-glow)',
                borderRadius: 999, padding: '3px 12px',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
                Aktif
              </span>
            </div>
            {sub?.expires_at && (
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tamat Pada</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatDateBM(sub.expires_at)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Expired / inactive notice ───────────────────────────────────── */}
      {sub && !isActive && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 32,
        }}>
          <AlertCircle size={18} color="var(--amber)" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Langganan anda <strong style={{ color: 'var(--amber)' }}>telah tamat</strong>.
            {sub.expires_at && ` Ia tamat pada ${formatDateBM(sub.expires_at)}.`}{' '}
            Langgan semula di bawah untuk teruskan akses.
          </p>
        </div>
      )}

      {/* ── Plan grid ──────────────────────────────────────────────────── */}
      {mosque && (
        <>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
            {isActive ? 'Naik Taraf Pelan' : 'Pilih Pelan'}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {allPlans.map(p => (
              <PlanCard
                key={p}
                plan={p}
                currentPlan={currentPlan}
                mosqueId={mosque.id}
                mosqueName={mosque.name}
                email={user.email ?? ''}
              />
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', marginTop: 24 }}>
            Tanpa kontrak · Batalkan bila-bila masa · Percubaan percuma 14 hari
          </p>
        </>
      )}
    </main>
  )
}

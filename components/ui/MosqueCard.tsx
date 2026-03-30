'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users, Building2 } from 'lucide-react'
import type { Mosque } from '@/lib/mosque'
import type { PlanTier } from '@/lib/planFeatures'
import { PLAN_LABEL } from '@/lib/planFeatures'

interface MosqueCardProps {
  mosque:         Mosque
  followerCount?: number
  plan?:          PlanTier | null
  isFollowing?:   boolean
  onFollow?:      (mosqueId: string) => void
  showFollowBtn?: boolean
}

const CATEGORY_LABEL: Record<string, string> = {
  masjid: 'Masjid', surau: 'Surau', musolla: 'Musolla',
}

const PLAN_COLOR: Record<string, { bg: string; text: string }> = {
  surau:    { bg: 'rgba(234,179,8,0.12)',   text: '#D97706' },
  kariah:   { bg: 'rgba(34,197,94,0.10)',   text: '#16A34A' },
  komuniti: { bg: 'rgba(168,85,247,0.10)',  text: '#7C3AED' },
}

export function MosqueCard({
  mosque,
  followerCount = 0,
  plan,
  isFollowing = false,
  onFollow,
  showFollowBtn = true,
}: MosqueCardProps) {
  const planStyle = plan ? PLAN_COLOR[plan] : null

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      {/* Header band */}
      <div style={{
        height: '72px',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.07) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {mosque.logo_url ? (
          <Image
            src={mosque.logo_url}
            alt={mosque.name}
            width={48}
            height={48}
            style={{ objectFit: 'contain', borderRadius: '10px' }}
          />
        ) : (
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 style={{ width: '22px', height: '22px', color: 'var(--primary)' }} />
          </div>
        )}

        {/* Plan badge */}
        {plan && planStyle && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            padding: '3px 8px', borderRadius: '6px',
            background: planStyle.bg,
            fontSize: '10px', fontWeight: 700,
            fontFamily: 'var(--font-dm-sans)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: planStyle.text,
          }}>
            {PLAN_LABEL[plan]}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div>
          <span style={{
            fontSize: '10px', fontWeight: 600,
            fontFamily: 'var(--font-dm-sans)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--primary)', display: 'block', marginBottom: '4px',
          }}>
            {CATEGORY_LABEL[mosque.category] ?? mosque.category}
          </span>
          <Link
            href={`/${mosque.slug}`}
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '15px', fontWeight: 700,
              color: 'var(--text-primary)',
              textDecoration: 'none', lineHeight: 1.3, display: 'block',
            }}
          >
            {mosque.name}
          </Link>
        </div>

        {(mosque.address || mosque.state) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <MapPin style={{ width: '12px', height: '12px', color: 'var(--text-dim)', marginTop: '2px', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
              color: 'var(--text-dim)', lineHeight: 1.4,
            }}>
              {mosque.state ?? mosque.address}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Users style={{ width: '12px', height: '12px', color: 'var(--text-dim)' }} />
          <span style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-dim)',
          }}>
            {followerCount.toLocaleString()} pengikut
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
          <Link
            href={`/${mosque.slug}`}
            style={{
              flex: 1, textAlign: 'center',
              padding: '9px 8px', borderRadius: '9px',
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              fontSize: '12px', fontWeight: 600,
              fontFamily: 'var(--font-dm-sans)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            Lihat
          </Link>

          {showFollowBtn && onFollow && (
            <button
              onClick={() => onFollow(mosque.id)}
              style={{
                flex: 1, padding: '9px 8px', borderRadius: '9px',
                background: isFollowing ? 'rgba(34,197,94,0.1)' : 'var(--primary)',
                border: isFollowing ? '1px solid rgba(34,197,94,0.25)' : 'none',
                fontSize: '12px', fontWeight: 700,
                fontFamily: 'var(--font-dm-sans)',
                color: isFollowing ? 'var(--primary)' : '#04080A',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {isFollowing ? 'Diikuti ✓' : 'Ikut'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

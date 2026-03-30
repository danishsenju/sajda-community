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
  masjid:  'Masjid',
  surau:   'Surau',
  musolla: 'Musolla',
}

const PLAN_COLOR: Record<string, string> = {
  surau:    'rgba(234,179,8,0.15)',
  kariah:   'rgba(34,197,94,0.12)',
  komuniti: 'rgba(168,85,247,0.12)',
}
const PLAN_TEXT: Record<string, string> = {
  surau:    '#EAB308',
  kariah:   '#22C55E',
  komuniti: '#A855F7',
}

export function MosqueCard({
  mosque,
  followerCount = 0,
  plan,
  isFollowing = false,
  onFollow,
  showFollowBtn = true,
}: MosqueCardProps) {
  return (
    <div style={{
      background: 'rgba(15,16,22,0.85)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.2s',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo / header band */}
      <div style={{
        height: '72px',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(15,16,22,0) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
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
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 style={{ width: '22px', height: '22px', color: 'rgba(34,197,94,0.7)' }} />
          </div>
        )}

        {/* Plan badge */}
        {plan && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '3px 8px',
            borderRadius: '6px',
            background: PLAN_COLOR[plan] ?? 'rgba(255,255,255,0.08)',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'var(--font-dm-sans)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: PLAN_TEXT[plan] ?? '#F0FDF4',
          }}>
            {PLAN_LABEL[plan]}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(34,197,94,0.7)',
            }}>
              {CATEGORY_LABEL[mosque.category] ?? mosque.category}
            </span>
          </div>
          <Link
            href={`/${mosque.slug}`}
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '15px',
              fontWeight: 700,
              color: '#F0FDF4',
              textDecoration: 'none',
              lineHeight: 1.3,
              display: 'block',
            }}
          >
            {mosque.name}
          </Link>
        </div>

        {(mosque.address || mosque.state) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <MapPin style={{ width: '12px', height: '12px', color: 'rgba(186,230,200,0.4)', marginTop: '2px', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '12px',
              color: 'rgba(186,230,200,0.5)',
              lineHeight: 1.4,
            }}>
              {mosque.state ?? mosque.address}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Users style={{ width: '12px', height: '12px', color: 'rgba(186,230,200,0.4)' }} />
          <span style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            color: 'rgba(186,230,200,0.5)',
          }}>
            {followerCount.toLocaleString()} pengikut
          </span>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
          <Link
            href={`/${mosque.slug}`}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-sans)',
              color: '#F0FDF4',
              textDecoration: 'none',
            }}
          >
            Lihat
          </Link>

          {showFollowBtn && onFollow && (
            <button
              onClick={() => onFollow(mosque.id)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                background: isFollowing ? 'rgba(34,197,94,0.12)' : '#22C55E',
                border: isFollowing ? '1px solid rgba(34,197,94,0.3)' : 'none',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'var(--font-dm-sans)',
                color: isFollowing ? '#22C55E' : '#08090E',
                cursor: 'pointer',
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

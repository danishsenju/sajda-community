// UX RATIONALE: Prayer times are the #1 daily use case across ALL 3 archetypes.
// Design principles for this component:
// 1. Active prayer: pill wrap with accent glow — unmissable at a glance
// 2. Past prayers: 40% opacity — clear visual hierarchy, not deleted
// 3. Oswald for times — condensed font allows larger sizes without crowding
// 4. No left border strip — top-category pattern is more visible in horizontal scroll
// 5. Live pulse dot — confirms data is real-time, not stale
// 6. Malay prayer names only — Subuh not Fajr, per language brief

interface PrayerCardProps {
  name: string         // e.g. "Subuh", "Zohor"
  time: string         // e.g. "5:42 PG"
  nextPrayerName: string
  countdown?: string   // e.g. "1:23:45" — only shown on active card
}

export function PrayerCard({ name, time, nextPrayerName, countdown }: PrayerCardProps) {
  const isNext = name === nextPrayerName
  // UX RATIONALE: Past prayer detection — if time has passed or is marked with '—'
  const isPast = time === '—'

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        // UX RATIONALE: Active prayer wrapped in accent pill — pre-attentive visual grouping
        // vs inactive prayers which have minimal chrome to reduce visual noise
        padding: isNext ? '10px 12px' : '10px 10px',
        borderRadius: '14px',
        border: isNext
          ? '1px solid rgba(45,215,113,0.35)'
          : '1px solid rgba(45,215,113,0.08)',
        background: isNext
          ? 'rgba(45,215,113,0.10)'
          : 'rgba(255,255,255,0.03)',
        // Past prayers dimmed — not removed, user still wants time reference
        opacity: isPast && !isNext ? 0.38 : 1,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease',
        // Glow on active — draws eye even in peripheral vision
        boxShadow: isNext
          ? '0 0 20px rgba(45,215,113,0.12), 0 4px 16px rgba(0,0,0,0.20)'
          : '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: '60px',
        textAlign: 'center',
      }}
    >
      {/* Prayer name — Malay names only */}
      <p
        style={{
          fontFamily: 'var(--font-nunito, var(--font-dm-sans, "Nunito", sans-serif))',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: isNext ? 'var(--accent, #2DD771)' : 'var(--text-muted)',
          margin: 0,
          lineHeight: 1,
        }}
      >
        {name}
      </p>

      {/* Time — Oswald condensed for premium feel + allows larger size in small space */}
      <p
        style={{
          fontFamily: 'var(--font-oswald, var(--font-jetbrains, "Oswald", monospace))',
          fontSize: isNext ? '20px' : '17px',
          fontWeight: isNext ? 600 : 500,
          color: isNext ? 'var(--text-primary)' : 'var(--text-secondary)',
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: '0.01em',
        }}
      >
        {time}
      </p>

      {/* Countdown — only on next prayer, smaller text to not compete with time */}
      {isNext && countdown && (
        <p
          style={{
            fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
            fontSize: '10px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: 1,
            marginTop: '1px',
          }}
        >
          {countdown} lagi
        </p>
      )}

      {/* UX RATIONALE: Live pulse — two-layer animation (ping outer + solid inner)
          signals real-time data without being obtrusive */}
      {isNext && (
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '6px',
            height: '6px',
          }}
        >
          <span
            className="animate-ping"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'var(--accent, #2DD771)',
              opacity: 0.5,
            }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'var(--accent, #2DD771)',
            }}
          />
        </span>
      )}
    </div>
  )
}

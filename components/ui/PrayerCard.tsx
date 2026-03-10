interface PrayerCardProps {
  name: string
  time: string
  nextPrayerName: string
}

export function PrayerCard({ name, time, nextPrayerName }: PrayerCardProps) {
  const isNext = name === nextPrayerName

  return (
    <div
      className="relative flex flex-col items-center px-2 py-4 rounded-2xl border text-center transition-all"
      style={{
        background: isNext ? 'var(--primary)' : 'var(--surface)',
        borderColor: isNext ? 'transparent' : 'var(--border)',
        boxShadow: isNext ? '0 4px 20px rgba(45,106,79,0.2)' : undefined,
        opacity: (!isNext && time === '—') ? 0.4 : 1,
      }}
    >
      {/* Prayer name */}
      <p
        className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1"
        style={{
          fontFamily: 'var(--font-jakarta)',
          color: isNext ? 'rgba(255,255,255,0.8)' : 'var(--text-dim)',
        }}
      >
        {name}
      </p>

      {/* Time */}
      <p
        className="text-sm font-bold"
        style={{
          fontFamily: 'var(--font-jetbrains)',
          color: isNext ? '#fff' : 'var(--text-primary)',
        }}
      >
        {time}
      </p>

      {/* Live dot */}
      {isNext && (
        <div className="flex justify-center mt-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
        </div>
      )}
    </div>
  )
}

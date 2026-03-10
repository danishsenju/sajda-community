export function IslamicMesh() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="islamic-grid"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 8 L44 28 L64 24 L50 38 L60 56 L40 46 L20 56 L30 38 L16 24 L36 28 Z"
              fill="none"
              stroke="#2D6A4F"
              strokeWidth="0.4"
              opacity="0.55"
            />
            <rect
              x="28"
              y="28"
              width="24"
              height="24"
              fill="none"
              stroke="#2D6A4F"
              strokeWidth="0.3"
              opacity="0.35"
              transform="rotate(45 40 40)"
            />
            <circle cx="40" cy="40" r="1.2" fill="#2D6A4F" opacity="0.25" />
            <line x1="0"  y1="0"  x2="16" y2="24" stroke="#2D6A4F" strokeWidth="0.2" opacity="0.25" />
            <line x1="80" y1="0"  x2="64" y2="24" stroke="#2D6A4F" strokeWidth="0.2" opacity="0.25" />
            <line x1="0"  y1="80" x2="16" y2="56" stroke="#2D6A4F" strokeWidth="0.2" opacity="0.25" />
            <line x1="80" y1="80" x2="64" y2="56" stroke="#2D6A4F" strokeWidth="0.2" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-grid)" opacity="0.035" />
      </svg>
    </div>
  )
}

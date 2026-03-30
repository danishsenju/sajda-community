import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { ShareButton } from './ShareButton'

/* ─────────────────────────────────────────────
   DAILY VERSE ROTATION — curated selection
───────────────────────────────────────────────*/
const DAILY_VERSES = [
  '1:1','2:2','2:45','2:152','2:155','2:177','2:255','2:286',
  '3:102','3:103','3:133','3:159','3:185',
  '4:36','5:8','6:162','7:204',
  '9:51','9:119','10:62','13:11','13:28','14:7',
  '16:90','16:97','17:23','17:36','18:46',
  '21:87','22:77','23:1','25:63',
  '29:45','29:69','30:21','31:12',
  '33:41','33:56','39:53','40:60',
  '49:10','49:13','51:56','55:13',
  '57:20','59:18','62:9','65:3',
  '67:2','73:20','89:27','93:11',
  '94:5','95:4','97:1','103:3',
  '112:1',
]

/* ─────────────────────────────────────────────
   SURAH NAME MAP
───────────────────────────────────────────────*/
const SURAH_NAMES: Record<number, string> = {
  1:   'Al-Fatihah',
  2:   'Al-Baqarah',
  3:   'Ali Imran',
  4:   "An-Nisa'",
  5:   'Al-Maidah',
  6:   "Al-An'am",
  7:   "Al-A'raf",
  9:   'At-Tawbah',
  10:  'Yunus',
  13:  "Ar-Ra'd",
  14:  'Ibrahim',
  16:  'An-Nahl',
  17:  "Al-Isra'",
  18:  'Al-Kahf',
  21:  "Al-Anbiya'",
  22:  'Al-Hajj',
  23:  'Al-Mu\'minun',
  25:  'Al-Furqan',
  29:  "Al-'Ankabut",
  30:  'Ar-Rum',
  31:  'Luqman',
  33:  'Al-Ahzab',
  39:  'Az-Zumar',
  40:  'Ghafir',
  49:  'Al-Hujurat',
  51:  'Adh-Dhariyat',
  55:  'Ar-Rahman',
  57:  'Al-Hadid',
  59:  'Al-Hashr',
  62:  "Al-Jumu'ah",
  65:  'At-Talaq',
  67:  'Al-Mulk',
  73:  'Al-Muzzammil',
  89:  'Al-Fajr',
  93:  'Ad-Duha',
  94:  'Al-Inshirah',
  95:  'At-Tin',
  97:  'Al-Qadr',
  103: "Al-'Asr",
  112: 'Al-Ikhlas',
}

/* ─────────────────────────────────────────────
   FALLBACK — shown when API is offline
───────────────────────────────────────────────*/
const FALLBACK = {
  arabic: 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا',
  translation: 'Dan sesiapa yang bertaqwa kepada Allah, nescaya Dia akan mengadakan baginya jalan keluar (dari segala perkara yang menyusahkannya).',
  surahName: 'At-Talaq',
  verseKey: '65:2',
  verseNumber: 2,
}

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────*/
type ApiResponse = {
  verse: {
    verse_number: number
    verse_key: string
    text_uthmani: string
    translations: Array<{ resource_id: number; text: string }>
  }
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────*/
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86400000)
}

function stripHtml(raw: string): string {
  return raw.replace(/<[^>]*>/g, '').trim()
}

/* ─────────────────────────────────────────────
   DATA FETCH
───────────────────────────────────────────────*/
async function fetchVerse(verseKey: string): Promise<{
  arabic: string
  translation: string
  surahName: string
  verseKey: string
  verseNumber: number
} | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 7000)
  try {
    const url = `https://api.quran.com/api/v4/verses/by_key/${verseKey}?translations=39&fields=text_uthmani`
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null

    const data: ApiResponse = await res.json()
    const verse = data.verse
    if (!verse) return null

    const arabic = verse.text_uthmani?.trim()
    const rawTranslation = verse.translations?.[0]?.text ?? ''
    const translation = stripHtml(rawTranslation)

    if (!arabic || !translation) return null

    const [surahNum] = verseKey.split(':').map(Number)
    const surahName = SURAH_NAMES[surahNum] ?? `Surah ${surahNum}`

    return {
      arabic,
      translation,
      surahName,
      verseKey,
      verseNumber: verse.verse_number,
    }
  } catch {
    clearTimeout(timer)
    return null
  }
}

/* ─────────────────────────────────────────────
   GEOMETRIC DIAMOND DIVIDER (inline SVG)
───────────────────────────────────────────────*/
function DiamondDivider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        margin: '0',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'rgba(34,197,94,0.15)' }} />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <polygon
          points="8,1 15,8 8,15 1,8"
          fill="rgba(34,197,94,0.15)"
          stroke="rgba(34,197,94,0.35)"
          strokeWidth="1"
        />
        <circle cx="8" cy="8" r="2" fill="#22C55E" fillOpacity="0.6" />
      </svg>
      <div style={{ flex: 1, height: '1px', background: 'rgba(34,197,94,0.15)' }} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────*/
export default async function TazkirahPage() {
  const dayOfYear = getDayOfYear(new Date())
  const verseKey = DAILY_VERSES[dayOfYear % DAILY_VERSES.length]

  const apiVerse = await fetchVerse(verseKey)
  const verse = apiVerse ?? FALLBACK

  const [surahNum] = verseKey.split(':').map(Number)
  const surahName = verse.surahName
  const verseNumber = verse.verseNumber

  const today = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shareText = `${verse.arabic}\n\n"${verse.translation}"\n\n— Surah ${surahName}, Ayat ${verseNumber} (Terjemahan Basmeih)\n\nSajda — Masjid Saujana Utama`

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '40px 24px 36px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Top row: back + date */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
          }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              <ChevronLeft style={{ width: '14px', height: '14px' }} />
              Utama
            </Link>

            <span style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              {today}
            </span>
          </div>

          {/* Label row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(34,197,94,0.10)',
              border: '1px solid rgba(34,197,94,0.20)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <BookOpen style={{ width: '15px', height: '15px', color: '#22C55E' }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#22C55E',
              margin: 0,
            }}>
              Tazkirah Harian
            </p>
          </div>

          {/* Page title */}
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            Ayat Al-Quran
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '10px',
            lineHeight: 1.6,
          }}>
            Terjemahan Basmeih &mdash; Rujukan Rasmi Malaysia
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* ── VERSE CARD ── */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>

          {/* Top gradient stripe */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, #22C55E 0%, transparent 100%)',
          }} />

          {/* Card inner padding */}
          <div style={{ padding: 'clamp(32px, 5vw, 40px) clamp(24px, 5vw, 36px)' }}>

            {/* Surah reference pill */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '100px',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.18)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '13px',
                fontWeight: 600,
                color: '#22C55E',
                letterSpacing: '0.04em',
              }}>
                Surah {surahName} &middot; Ayat {verseNumber}
              </span>
            </div>

            {/* Arabic text */}
            <p style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              color: 'var(--text-primary)',
              direction: 'rtl',
              textAlign: 'center',
              lineHeight: 2.4,
              marginTop: '24px',
              marginBottom: '32px',
            }}>
              {verse.arabic}
            </p>

            {/* Geometric divider */}
            <DiamondDivider />

            {/* BM Translation */}
            <div style={{ marginTop: '28px', marginBottom: '24px', position: 'relative' }}>
              {/* Leading large quote mark */}
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '72px',
                lineHeight: 0.8,
                color: 'rgba(34,197,94,0.12)',
                userSelect: 'none',
                pointerEvents: 'none',
                marginBottom: '8px',
              }}>
                &ldquo;
              </div>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                color: 'var(--text-primary)',
                lineHeight: 1.9,
                margin: 0,
              }}>
                {verse.translation}
              </p>
            </div>

            {/* Card bottom bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              {/* Source left */}
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                margin: 0,
              }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Sumber: </span>
                <span style={{ color: '#22C55E', fontWeight: 600 }}>
                  {surahName} {verseKey.split(':')[0]}:{verseNumber}
                </span>
              </p>

              {/* Brand right */}
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '13px',
                color: 'var(--text-dim)',
                margin: 0,
                letterSpacing: '0.04em',
              }}>
                Sajda
              </p>
            </div>

            {/* Share buttons — card footer */}
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
            }}>
              <ShareButton text={shareText} />
            </div>

          </div>
        </div>

        {/* ── ATTRIBUTION NOTE ── */}
        <div style={{
          padding: '18px 20px',
          borderRadius: '12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#22C55E',
            flexShrink: 0,
            marginTop: '5px',
          }} />
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            Ayat dikemaskini setiap hari. Terjemahan oleh{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              Abdullah Muhammad Basmeih
            </span>
            , rujukan rasmi JAKIM. Sumber data:{' '}
            <a
              href="https://quran.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#22C55E', textDecoration: 'none', fontWeight: 500 }}
            >
              Quran.com
            </a>
          </p>
        </div>

        {/* Offline indicator when API fails */}
        {!apiVerse && (
          <div style={{
            marginTop: '12px',
            padding: '14px 18px',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.18)',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            color: 'rgba(245,158,11,0.85)',
          }}>
            Paparan ayat sandaran — sambungan API tidak tersedia buat masa ini.
          </div>
        )}

      </div>
    </div>
  )
}

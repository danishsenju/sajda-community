'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, AlertCircle, Volume2 } from 'lucide-react'

type Verse = {
  numberInSurah: number
  text: string
  translation: string
}

type SurahMeta = {
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

const SURAH_BENEFITS: Record<number, string> = {
  1:   'Pembuka Al-Quran — dibaca dalam setiap rakaat solat.',
  18:  'Sesiapa yang membacanya pada hari Jumaat, Allah akan meneranginya dengan cahaya hingga Jumaat berikutnya.',
  36:  'Jantung Al-Quran. Dibaca untuk arwah dan pada masa kesusahan.',
  56:  'Sesiapa yang membacanya setiap malam tidak akan ditimpa kemiskinan.',
  67:  'Ia akan memberi syafaat kepada pembacanya dan memeliharanya daripada azab kubur.',
  112: 'Pahalanya bersamaan dengan membaca sepertiga Al-Quran.',
  113: 'Perlindungan daripada kejahatan makhluk, kegelapan, sihir dan hasad.',
  114: 'Perlindungan daripada bisikan syaitan dan was-was dalam dada.',
}

export default function SurahPage() {
  const { id } = useParams<{ id: string }>()
  const [verses,  setVerses]  = useState<Verse[]>([])
  const [meta,    setMeta]    = useState<SurahMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [fontSize, setFontSize] = useState(22)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(false)

    // Fetch Arabic + Malay translation in one call
    fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,ms.basmeih`)
      .then(r => r.json())
      .then(data => {
        if (data.code !== 200) throw new Error()
        const arabic: { ayahs: { numberInSurah: number; text: string }[]; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number; revelationType: string } = data.data[0]
        const malay:  { ayahs: { text: string }[] } = data.data[1]

        setMeta({
          name: arabic.name,
          englishName: arabic.englishName,
          englishNameTranslation: arabic.englishNameTranslation,
          numberOfAyahs: arabic.numberOfAyahs,
          revelationType: arabic.revelationType,
        })

        setVerses(arabic.ayahs.map((a, i) => ({
          numberInSurah: a.numberInSurah,
          text: a.text,
          translation: malay.ayahs[i]?.text ?? '',
        })))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const surahNum = parseInt(id ?? '0')
  const benefit  = SURAH_BENEFITS[surahNum]
  const revealLabel = meta?.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 28px',
        background: 'var(--surface)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <Link href="/wirid" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '16px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            Surah Pilihan
          </Link>

          {meta && (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{
                    fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                    fontWeight: 700, color: 'var(--text-primary)', margin: 0,
                  }}>
                    {meta.englishName}
                  </h1>
                  <span style={{
                    fontFamily: 'var(--font-amiri)', fontSize: '20px',
                    color: 'var(--text-secondary)', direction: 'rtl',
                  }}>
                    {meta.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)' }}>
                    {meta.numberOfAyahs} ayat · {revealLabel} · Surah {surahNum}
                  </span>
                </div>
              </div>

              {/* Font size control */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
                <button
                  onClick={() => setFontSize(s => Math.max(16, s - 2))}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'var(--elevated)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize(s => Math.min(34, s + 2))}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'var(--elevated)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '20px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  A
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 style={{ width: '16px', height: '16px', color: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Memuatkan surah...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Benefit banner */}
        {benefit && !loading && (
          <div style={{
            marginBottom: '24px', padding: '14px 16px', borderRadius: '12px',
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
            display: 'flex', gap: '10px',
          }}>
            <Volume2 style={{ width: '14px', height: '14px', color: '#22C55E', flexShrink: 0, marginTop: '2px' }} />
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
              color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6,
            }}>
              {benefit}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            padding: '40px 24px', textAlign: 'center',
            background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)',
          }}>
            <AlertCircle style={{ width: '24px', height: '24px', color: 'var(--text-dim)', margin: '0 auto 10px' }} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Gagal memuatkan surah. Sila semak sambungan internet.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 18px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'var(--elevated)',
                fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              Cuba Semula
            </button>
          </div>
        )}

        {/* Bismillah (not for Al-Fatihah and At-Tawbah) */}
        {!loading && !error && verses.length > 0 && surahNum !== 9 && (
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <p style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: `${fontSize + 4}px`,
              color: 'var(--text-primary)',
              direction: 'rtl', lineHeight: 2.2, margin: 0,
            }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* Verses */}
        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {verses.map((verse) => (
              <div
                key={verse.numberInSurah}
                style={{
                  padding: '20px', borderRadius: '14px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                {/* Verse number */}
                <div style={{
                  position: 'absolute', top: '14px', left: '14px',
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'var(--elevated)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-jetbrains)', fontSize: '12px',
                  color: 'var(--text-dim)',
                }}>
                  {verse.numberInSurah}
                </div>

                {/* Arabic text */}
                <p style={{
                  fontFamily: 'var(--font-amiri)',
                  fontSize: `${fontSize}px`,
                  color: 'var(--text-primary)',
                  direction: 'rtl', textAlign: 'right',
                  lineHeight: 2.2, margin: '0 0 14px',
                  paddingTop: '4px',
                }}>
                  {verse.text}
                </p>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '12px' }} />

                {/* Translation */}
                <p style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                  color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0,
                }}>
                  {verse.translation}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                height: '120px', borderRadius: '14px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                animation: 'shimmer 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  )
}

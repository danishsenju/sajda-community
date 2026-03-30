import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'

/* ─────────────────────────────────────────────
   FALLBACK HADITHS — shown when API is offline
   Sourced from Riyadus Salihin & Sahih collections
───────────────────────────────────────────────*/
const FALLBACK_HADITHS = [
  { number: 1,    text: 'Actions are judged by intentions. Every person will be rewarded only for what they intended. Whoever migrates for the sake of Allah and His Messenger, their migration is for Allah and His Messenger. But whoever migrates for worldly gain or to marry a woman, their migration is for whatever reason they migrated.', book: 'Sahih al-Bukhari & Muslim' },
  { number: 56,   text: 'None of you truly believes until he loves for his brother what he loves for himself.', book: 'Sahih al-Bukhari & Muslim' },
  { number: 75,   text: 'The best of people are those who are most beneficial to people.', book: "Al-Mu'jam al-Awsat, al-Tabarani" },
  { number: 100,  text: 'He who does not thank people has not thanked Allah.', book: 'Sunan Abu Dawud' },
  { number: 150,  text: 'Speak good or remain silent.', book: 'Sahih al-Bukhari & Muslim' },
  { number: 200,  text: 'The strong man is not the one who can wrestle another to the ground. The strong man is the one who controls himself when he is angry.', book: 'Sahih al-Bukhari & Muslim' },
  { number: 250,  text: "Part of the perfection of a person's Islam is that he leaves what does not concern him.", book: 'Sunan al-Tirmidhi — Hasan' },
  { number: 300,  text: 'A Muslim is one from whose tongue and hand other Muslims are safe. And a Muhajir is one who abandons what Allah has prohibited.', book: 'Sahih al-Bukhari' },
  { number: 350,  text: 'Feed the hungry, visit the sick, and free the captives.', book: 'Sahih al-Bukhari' },
  { number: 400,  text: 'Do not consider any good deed as insignificant, even if it is meeting your brother with a cheerful face.', book: 'Sahih Muslim' },
  { number: 450,  text: 'The world is a prison for the believer and a paradise for the unbeliever.', book: 'Sahih Muslim' },
  { number: 500,  text: 'Be mindful of Allah, and Allah will protect you. Be mindful of Allah, and you will find Him in front of you.', book: 'Sunan al-Tirmidhi' },
  { number: 550,  text: 'Modesty is part of faith, and faith leads to Paradise. Shamelessness is part of hardness of heart, and hardness of heart leads to Fire.', book: 'Sunan al-Tirmidhi' },
  { number: 600,  text: 'Whoever relieves a Muslim of a burden from the burdens of the world, Allah will relieve him of a burden from the burdens of the Hereafter.', book: 'Sahih Muslim' },
  { number: 650,  text: 'The best charity is that given by one who has little. Start with those you are responsible for.', book: 'Sunan Abu Dawud' },
  { number: 700,  text: 'Smiling at your brother is charity. Commanding what is good and forbidding what is evil is charity. Guiding someone who is lost is charity.', book: 'Sunan al-Tirmidhi' },
  { number: 750,  text: 'Have mercy on those who are on earth, and the One in the heavens will have mercy on you.', book: 'Sunan al-Tirmidhi' },
  { number: 800,  text: 'The most beloved of deeds to Allah are those done consistently, even if they are small.', book: 'Sahih al-Bukhari & Muslim' },
  { number: 850,  text: 'Make things easy and do not make them difficult. Give glad tidings and do not make people turn away.', book: 'Sahih al-Bukhari' },
  { number: 900,  text: 'Cleanliness is half of faith. Alhamdulillah fills the scale. SubhanAllah and Alhamdulillah together fill what is between the heavens and earth.', book: 'Sahih Muslim' },
  { number: 950,  text: 'The signs of a hypocrite are three: when he speaks, he lies; when he makes a promise, he breaks it; and when he is trusted, he betrays.', book: 'Sahih al-Bukhari & Muslim' },
  { number: 1000, text: 'Whoever believes in Allah and the Last Day should say something good or remain silent. Whoever believes in Allah and the Last Day should honour his neighbour. Whoever believes in Allah and the Last Day should honour his guest.', book: 'Sahih al-Bukhari & Muslim' },
  { number: 1050, text: 'The deen is sincerity — sincerity to Allah, to His Book, to His Messenger, to the leaders of the Muslims, and to the common people.', book: 'Sahih Muslim' },
  { number: 1100, text: 'Allah does not look at your forms and your wealth, but He looks at your hearts and your deeds.', book: 'Sahih Muslim' },
  { number: 1250, text: 'Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before you become busy, and your life before your death.', book: "Shu'ab al-Iman, al-Bayhaqi" },
  { number: 1350, text: 'Whoever of you sees evil, let him change it with his hand. If he is unable, then with his tongue. If he is unable, then with his heart — and that is the weakest of faith.', book: 'Sahih Muslim' },
  { number: 1400, text: 'Patience is illumination. Charity is a proof. Prayer is a light. The Quran is either a proof for you or against you.', book: 'Sahih Muslim' },
]

const TOTAL_HADITHS = 1896

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86400000)
}

type ApiHadith = {
  hadithnumber?: number
  text?: string
  book?: { bookname?: string; booknameen?: string }
}

async function fetchHadith(num: number): Promise<{ text: string; number: number; book: string } | null> {
  const urls = [
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-riyadussalihin/${num}.min.json`,
    `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-riyadussalihin/${num}.json`,
    `https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/eng-riyadussalihin/${num}.min.json`,
  ]

  for (const url of urls) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    try {
      const res = await fetch(url, {
        next: { revalidate: 86400 },
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (!res.ok) continue
      const data: ApiHadith = await res.json()
      const text = (data.text ?? '').trim()
      if (!text || text.length < 10) continue
      return {
        text,
        number: data.hadithnumber ?? num,
        book: data.book?.booknameen ?? 'Riyadus Salihin',
      }
    } catch {
      clearTimeout(timer)
      continue
    }
  }
  return null
}

export default async function HadisPage() {
  const dayOfYear = getDayOfYear(new Date())
  const hadithNum = (dayOfYear % TOTAL_HADITHS) + 1

  const apiHadith = await fetchHadith(hadithNum)
  const fallback = FALLBACK_HADITHS[dayOfYear % FALLBACK_HADITHS.length]
  const hadith = apiHadith ?? fallback

  const today = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 36px',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

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

          {/* Label */}
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
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
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
            }}>
              1 Hari 1 Hadis
            </p>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Hadis Harian
          </h1>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Source badge row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '36px',
        }}>
          <span style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: '20px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.18)',
            color: '#22C55E',
          }}>
            Hadis #{hadith.number}
          </span>
          {!apiHadith && (
            <span style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}>
              Koleksi Pilihan
            </span>
          )}
          <span style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginLeft: 'auto',
          }}>
            {hadith.book}
          </span>
        </div>

        {/* ── BISMILLAH ── */}
        <p style={{
          fontFamily: 'var(--font-amiri)',
          fontSize: '26px',
          color: '#22C55E',
          direction: 'rtl',
          lineHeight: 2.2,
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </p>

        {/* ── MAIN HADITH CARD ── */}
        <div style={{
          position: 'relative',
          padding: '36px 40px',
          borderRadius: '16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          marginBottom: '24px',
        }}>
          {/* Large opening quote */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '24px',
            fontFamily: 'var(--font-playfair)',
            fontSize: '80px',
            lineHeight: 1,
            color: 'rgba(34,197,94,0.12)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}>
            &ldquo;
          </div>

          {/* Hadith text */}
          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
            lineHeight: 1.85,
            color: 'var(--text-primary)',
            position: 'relative',
            zIndex: 1,
            marginBottom: '28px',
          }}>
            {hadith.text}
          </p>

          {/* Closing quote + source */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '3px',
                height: '32px',
                borderRadius: '2px',
                background: '#22C55E',
                flexShrink: 0,
              }} />
              <div>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#22C55E',
                  marginBottom: '3px',
                }}>
                  Sumber
                </p>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}>
                  {hadith.book}
                </p>
              </div>
            </div>

            {/* Closing quote mark */}
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '48px',
              lineHeight: 1,
              color: 'rgba(34,197,94,0.10)',
              userSelect: 'none',
            }}>
              &rdquo;
            </div>
          </div>
        </div>

        {/* ── SHARE NUDGE ── */}
        <div style={{
          padding: '18px 20px',
          borderRadius: '12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '44px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22C55E',
            flexShrink: 0,
          }} />
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            Hadis ini dikemaskini setiap hari secara automatik.{' '}
            <span style={{ color: 'var(--text-primary)' }}>
              Menyebarkan ilmu adalah sedekah yang berterusan.
            </span>
          </p>
        </div>

        {/* ── CLOSING VERSE ── */}
        <div style={{
          padding: '28px 28px',
          borderRadius: '14px',
          borderLeft: '3px solid #22C55E',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeftWidth: '3px',
          borderLeftColor: '#22C55E',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: '22px',
            color: 'var(--text-primary)',
            direction: 'rtl',
            lineHeight: 2.2,
            marginBottom: '10px',
          }}>
            وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: '6px',
          }}>
            &quot;Dan barangsiapa yang bertakwa kepada Allah, nescaya Dia akan memberinya jalan keluar.&quot;
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            color: '#22C55E',
            fontWeight: 600,
          }}>
            — Surah al-Talaq (65:2)
          </p>
        </div>

      </div>
    </div>
  )
}

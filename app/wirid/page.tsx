'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sun, Moon, BookOpen, Hand, RotateCcw, CheckCircle2, Circle, Sparkles, ChevronRight } from 'lucide-react'

/* ── WIRID PAGI ─────────────────────────────────────────────────────── */
const WIRID_PAGI = [
  { id: 'p1', count: 1,   ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ', bm: 'Kami berpagi-pagi dan kerajaan itu milik Allah, dan segala puji bagi Allah.' },
  { id: 'p2', count: 3,   ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', bm: 'Dengan nama Allah yang apabila disebut, tiada sesuatu pun yang memberi mudarat di bumi mahupun di langit. Dialah Yang Maha Mendengar lagi Maha Mengetahui.' },
  { id: 'p3', count: 1,   ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', bm: 'Ya Allah, dengan kekuasaan-Mu kami berpagi-pagi, dengan kekuasaan-Mu kami berpetang, dengan kekuasaan-Mu kami hidup, dengan kekuasaan-Mu kami mati, dan kepada-Mu tempat kebangkitan.' },
  { id: 'p4', count: 7,   ar: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', bm: 'Cukuplah Allah bagiku, tiada Tuhan selain-Nya, kepada-Nya aku bertawakkal dan Dialah Tuhan Arasy yang agung.' },
  { id: 'p5', count: 100, ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', bm: 'Maha Suci Allah dan segala puji bagi-Nya.' },
  { id: 'p6', count: 10,  ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', bm: 'Ya Allah, selawat dan salam ke atas Nabi kami Muhammad ﷺ.' },
  { id: 'p7', count: 3,   ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', bm: 'Aku berlindung dengan Allah daripada syaitan yang direjam.' },
  { id: 'p8', count: 1,   ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', bm: 'Tiada Tuhan selain Allah, Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pula segala puji dan Dia Maha Berkuasa atas segala sesuatu.' },
]

/* ── WIRID PETANG ───────────────────────────────────────────────────── */
const WIRID_PETANG = [
  { id: 'e1', count: 1,   ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ', bm: 'Kami berpetang dan kerajaan itu milik Allah, dan segala puji bagi Allah.' },
  { id: 'e2', count: 3,   ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ', bm: 'Dengan nama Allah yang apabila disebut, tiada sesuatu pun yang memberi mudarat di bumi mahupun di langit.' },
  { id: 'e3', count: 1,   ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', bm: 'Ya Allah, dengan kekuasaan-Mu kami berpetang, dengan kekuasaan-Mu kami berpagi, dengan kekuasaan-Mu kami hidup, dengan kekuasaan-Mu kami mati dan kepada-Mu tempat kembali.' },
  { id: 'e4', count: 7,   ar: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', bm: 'Cukuplah Allah bagiku, tiada Tuhan selain-Nya, kepada-Nya aku bertawakkal dan Dialah Tuhan Arasy yang agung.' },
  { id: 'e5', count: 100, ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', bm: 'Maha Suci Allah dan segala puji bagi-Nya.' },
  { id: 'e6', count: 10,  ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', bm: 'Ya Allah, selawat dan salam ke atas Nabi kami Muhammad ﷺ.' },
  { id: 'e7', count: 1,   ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', bm: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu daripada kerisauan dan kesedihan.' },
  { id: 'e8', count: 3,   ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', bm: 'Aku berlindung dengan kalimah-kalimah Allah yang sempurna daripada kejahatan makhluk yang Dia ciptakan.' },
]

/* ── DOA SELEPAS SOLAT ──────────────────────────────────────────────── */
const DOA_SOLAT = [
  { id: 'd1', count: 3,  ar: 'أَسْتَغْفِرُ اللَّهَ', bm: 'Aku memohon keampunan daripada Allah.' },
  { id: 'd2', count: 1,  ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ', bm: 'Ya Allah, Engkau As-Salam dan dari-Mu datangnya kesejahteraan. Maha Berkat Engkau wahai Yang Maha Agung lagi Maha Mulia.' },
  { id: 'd3', count: 33, ar: 'سُبْحَانَ اللَّهِ', bm: 'Maha Suci Allah.' },
  { id: 'd4', count: 33, ar: 'اَلْحَمْدُ لِلَّهِ', bm: 'Segala puji bagi Allah.' },
  { id: 'd5', count: 33, ar: 'اللَّهُ أَكْبَرُ', bm: 'Allah Maha Besar.' },
  { id: 'd6', count: 1,  ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', bm: 'Tiada Tuhan selain Allah, Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji, dan Dia Maha Berkuasa atas segala sesuatu.' },
  { id: 'd7', count: 1,  ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ', bm: 'Ayat Kursi — Allah, tiada Tuhan melainkan Dia, Yang Hidup Kekal lagi terus-menerus mengurus makhluk-Nya. Tidak mengantuk dan tidak tidur...' },
  { id: 'd8', count: 1,  ar: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', bm: 'Ya Allah, bantulah aku untuk berzikir kepada-Mu, bersyukur kepada-Mu dan beribadah kepada-Mu dengan sebaik-baiknya.' },
  { id: 'd9', count: 1,  ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبُخْلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ، وَأَعُوذُ بِكَ مِنْ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ', bm: 'Ya Allah, aku berlindung kepada-Mu daripada sifat kikir, penakut, dan daripada dikembalikan ke usia tua yang lemah.' },
]

/* ── SURAH PILIHAN ──────────────────────────────────────────────────── */
const SURAH_PILIHAN = [
  { number: 1,   name: 'Al-Fatihah',  ar: 'الفاتحة',  verses: 7,   benefit: 'Pembuka — Rukun setiap solat',         tag: 'Harian' },
  { number: 112, name: 'Al-Ikhlas',   ar: 'الإخلاص', verses: 4,   benefit: 'Bersamaan 1/3 Al-Quran pahalanya',     tag: 'Harian' },
  { number: 113, name: 'Al-Falaq',    ar: 'الفلق',    verses: 5,   benefit: 'Perlindungan daripada kejahatan luar', tag: 'Harian' },
  { number: 114, name: 'An-Nas',      ar: 'الناس',    verses: 6,   benefit: 'Perlindungan daripada was-was hati',   tag: 'Harian' },
  { number: 67,  name: 'Al-Mulk',     ar: 'الملك',    verses: 30,  benefit: 'Perlindungan daripada azab kubur',     tag: 'Malam' },
  { number: 56,  name: 'Al-Waqiah',   ar: 'الواقعة',  verses: 96,  benefit: 'Surah kekayaan & keberkatan rezeki',  tag: 'Malam' },
  { number: 36,  name: 'Yasin',       ar: 'يس',       verses: 83,  benefit: 'Jantung Al-Quran — dibaca untuk arwah', tag: 'Khusus' },
  { number: 18,  name: 'Al-Kahf',     ar: 'الكهف',    verses: 110, benefit: 'Dibaca setiap hari Jumaat',            tag: 'Jumaat' },
]

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  'Harian':  { color: '#22C55E', bg: 'rgba(34,197,94,0.10)'  },
  'Malam':   { color: '#A78BFA', bg: 'rgba(167,139,250,0.10)' },
  'Khusus':  { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
  'Jumaat':  { color: '#38BDF8', bg: 'rgba(56,189,248,0.10)' },
}

/* ── helpers ─────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'sajda_wirid_log'
type Tab = 'pagi' | 'petang' | 'doa' | 'surah'
type DailyEntry = { pagi: string[]; petang: string[]; doa: string[] }
type WiridLog = Record<string, DailyEntry>

function getMalaysiaDate(): string {
  const now = new Date()
  const myt = new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000)
  return myt.toISOString().split('T')[0]
}
function safeLoad(): WiridLog {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}
function safeSave(log: WiridLog) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)) } catch { /* silent */ }
}

/* ── COMPONENT ──────────────────────────────────────────────────────── */
export default function WiridPage() {
  const today = getMalaysiaDate()
  const [tab,     setTab]     = useState<Tab>('pagi')
  const [done,    setDone]    = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  const checkableTabs: Tab[] = ['pagi', 'petang', 'doa']
  const activeList = tab === 'pagi' ? WIRID_PAGI : tab === 'petang' ? WIRID_PETANG : tab === 'doa' ? DOA_SOLAT : []

  useEffect(() => {
    const log = safeLoad()
    const entry = log[today] ?? { pagi: [], petang: [], doa: [] }
    setDone(
      tab === 'pagi' ? entry.pagi :
      tab === 'petang' ? entry.petang :
      tab === 'doa' ? (entry.doa ?? []) : []
    )
    setMounted(true)
  }, [today, tab])

  function toggleItem(id: string) {
    if (!checkableTabs.includes(tab)) return
    navigator.vibrate?.(20)
    setDone(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      const log = safeLoad()
      if (!log[today]) log[today] = { pagi: [], petang: [], doa: [] }
      log[today][tab as 'pagi' | 'petang' | 'doa'] = next
      safeSave(log)
      return next
    })
  }

  function resetTab() {
    setDone([])
    const log = safeLoad()
    if (!log[today]) log[today] = { pagi: [], petang: [], doa: [] }
    log[today][tab as 'pagi' | 'petang' | 'doa'] = []
    safeSave(log)
  }

  const isCheckable = checkableTabs.includes(tab)
  const isComplete  = isCheckable && mounted && done.length === activeList.length && activeList.length > 0
  const progress    = mounted ? done.length : 0

  const TABS = [
    { key: 'pagi'   as Tab, label: 'Pagi',       Icon: Sun      },
    { key: 'petang' as Tab, label: 'Petang',      Icon: Moon     },
    { key: 'doa'    as Tab, label: 'Doa Solat',   Icon: Hand     },
    { key: 'surah'  as Tab, label: 'Surah',       Icon: BookOpen },
  ]

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 0',
        background: 'var(--surface)',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '20px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            Utama
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.6rem, 4vw, 2rem)',
                fontWeight: 700, color: 'var(--text-primary)', margin: 0,
              }}>
                Wirid & Surah
              </h1>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Amalan harian, doa solat & surah pilihan
              </p>
            </div>

            {isCheckable && (
              <div style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: '100px',
                background: isComplete ? 'rgba(34,197,94,0.10)' : 'var(--elevated)',
                border: `1px solid ${isComplete ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
              }}>
                <p style={{
                  fontFamily: 'var(--font-jetbrains)', fontSize: '16px', fontWeight: 700,
                  color: isComplete ? '#22C55E' : 'var(--text-secondary)',
                  margin: 0, textAlign: 'center',
                }}>
                  {progress}/{activeList.length}
                </p>
              </div>
            )}
          </div>

          {/* Tab bar — 4 tabs */}
          <div style={{
            display: 'flex', gap: '2px', padding: '3px',
            background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: '14px',
          }}>
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  padding: '8px 4px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: tab === key ? 'var(--surface)' : 'transparent',
                  color: tab === key ? 'var(--text-primary)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                  boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>
          <div style={{ height: '20px' }} />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Complete banner */}
        {isComplete && (
          <div style={{
            marginBottom: '20px', padding: '16px 20px', borderRadius: '14px',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#22C55E', flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '14px', fontWeight: 700, color: '#22C55E', margin: '0 0 2px' }}>
                MasyaAllah! {tab === 'pagi' ? 'Wirid pagi' : tab === 'petang' ? 'Wirid petang' : 'Doa solat'} selesai ✓
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(34,197,94,0.7)', margin: 0 }}>
                Semoga amalan ini diterima Allah SWT
              </p>
            </div>
          </div>
        )}

        {/* ── SURAH PILIHAN ── */}
        {tab === 'surah' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
              color: 'var(--text-dim)', marginBottom: '4px',
            }}>
              Ketik mana-mana surah untuk membaca teks penuh dengan terjemahan Bahasa Malaysia.
            </p>
            {SURAH_PILIHAN.map((s) => {
              const tagStyle = TAG_COLORS[s.tag] ?? TAG_COLORS['Harian']
              return (
                <Link
                  key={s.number}
                  href={`/wirid/surah/${s.number}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px', borderRadius: '14px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    transition: 'border-color 0.15s',
                    cursor: 'pointer',
                  }}>
                    {/* Number */}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      background: 'var(--elevated)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-jetbrains)', fontSize: '13px', fontWeight: 700,
                      color: 'var(--text-dim)',
                    }}>
                      {s.number}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{
                          fontFamily: 'var(--font-playfair)', fontSize: '15px',
                          fontWeight: 700, color: 'var(--text-primary)',
                        }}>
                          {s.name}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-amiri)', fontSize: '14px',
                          color: 'var(--text-secondary)', direction: 'rtl',
                        }}>
                          {s.ar}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                        color: 'var(--text-dim)', margin: 0,
                      }}>
                        {s.benefit}
                      </p>
                    </div>

                    {/* Right */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '100px',
                        background: tagStyle.bg, color: tagStyle.color,
                        fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                      }}>
                        {s.tag}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                        color: 'var(--text-dim)',
                      }}>
                        {s.verses} ayat
                      </span>
                    </div>

                    <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-dim)', flexShrink: 0 }} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── WIRID / DOA LIST ── */}
        {tab !== 'surah' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeList.map((item, i) => {
                const ticked = mounted && done.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                      display: 'flex', alignItems: 'flex-start', gap: '14px',
                      padding: '16px', borderRadius: '14px',
                      background: ticked ? 'rgba(34,197,94,0.05)' : 'var(--surface)',
                      border: `1px solid ${ticked ? 'rgba(34,197,94,0.18)' : 'var(--border)'}`,
                      opacity: ticked ? 0.65 : 1,
                      transition: 'all 0.2s ease',
                      animationDelay: `${i * 0.04}s`,
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: '2px', color: ticked ? 'var(--primary)' : 'var(--border-lit)' }}>
                      {ticked
                        ? <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                        : <Circle      style={{ width: '18px', height: '18px' }} />
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-amiri)',
                        fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                        color: ticked ? 'var(--text-dim)' : 'var(--text-primary)',
                        direction: 'rtl', textAlign: 'right',
                        lineHeight: 2, margin: '0 0 8px',
                        textDecoration: ticked ? 'line-through' : 'none',
                      }}>
                        {item.ar}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                        color: ticked ? 'var(--text-dim)' : 'var(--text-secondary)',
                        lineHeight: 1.6, margin: 0,
                      }}>
                        {item.bm}
                      </p>
                      {item.count > 1 && (
                        <span style={{
                          display: 'inline-block', marginTop: '6px',
                          padding: '2px 8px', borderRadius: '100px',
                          background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)',
                          fontFamily: 'var(--font-jetbrains)', fontSize: '12px',
                          color: 'rgba(245,158,11,0.8)',
                        }}>
                          ×{item.count}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={resetTab}
              style={{
                marginTop: '20px', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '11px', borderRadius: '12px',
                background: 'transparent', border: '1px solid var(--border)',
                cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
                fontSize: '13px', color: 'var(--text-secondary)',
              }}
            >
              <RotateCcw style={{ width: '13px', height: '13px' }} />
              Buat Semula
            </button>
          </>
        )}

        {/* Attribution */}
        <div style={{
          marginTop: '24px', padding: '12px 16px', borderRadius: '10px',
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>
            {tab === 'surah'
              ? 'Teks Al-Quran dari al-quran.cloud. Terjemahan Bahasa Malaysia: Tafsir Pimpinan Ar-Rahman.'
              : 'Wirid dari Kitab Al-Mathurat (Hassan Al-Banna) & hadis-hadis sahih. Rekod disimpan di peranti ini sahaja.'}
          </p>
        </div>
      </div>
    </div>
  )
}

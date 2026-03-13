'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, RefreshCw, LocateFixed, Loader2 } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { createClient } from '@/lib/supabase'

/* ── Default zone: SGR01 = Gombak, Selangor ─────────────────────────────── */
const DEFAULT_ZONE  = 'SGR01'
const DEFAULT_LABEL = 'Zon Gombak · Selangor'

/* ── JAKIM zone lookup by daerah (district) ──────────────────────────────── */
type ZoneInfo = { code: string; label: string }

/** Comprehensive daerah → JAKIM zone. Keys are lowercase substrings to match against. */
const DISTRICT_ZONES: Record<string, ZoneInfo> = {
  // ── WILAYAH PERSEKUTUAN ─────────────────────────────────────────────────
  'kuala lumpur':          { code: 'WLY01', label: 'W.P. Kuala Lumpur' },
  'putrajaya':             { code: 'WLY01', label: 'W.P. Putrajaya' },
  'labuan':                { code: 'WLY02', label: 'W.P. Labuan' },

  // ── SELANGOR ────────────────────────────────────────────────────────────
  'gombak':                { code: 'SGR01', label: 'Zon Gombak' },
  'rawang':                { code: 'SGR01', label: 'Zon Gombak (Rawang)' },
  'selayang':              { code: 'SGR01', label: 'Zon Gombak (Selayang)' },
  'kuala selangor':        { code: 'SGR02', label: 'Zon Kuala Selangor' },
  'sabak bernam':          { code: 'SGR02', label: 'Zon Sabak Bernam' },
  'sungai besar':          { code: 'SGR02', label: 'Zon Sabak Bernam' },
  'hulu langat':           { code: 'SGR03', label: 'Zon Hulu Langat' },
  'hulu selangor':         { code: 'SGR03', label: 'Zon Hulu Selangor' },
  'batang kali':           { code: 'SGR03', label: 'Zon Hulu Selangor' },
  'petaling':              { code: 'SGR04', label: 'Zon Petaling' },
  'shah alam':             { code: 'SGR04', label: 'Zon Petaling (Shah Alam)' },
  'subang':                { code: 'SGR04', label: 'Zon Petaling (Subang)' },
  'puchong':               { code: 'SGR04', label: 'Zon Petaling (Puchong)' },
  'klang':                 { code: 'SGR04', label: 'Zon Klang' },
  'port klang':            { code: 'SGR04', label: 'Zon Klang' },
  'kuala langat':          { code: 'SGR04', label: 'Zon Kuala Langat' },
  'sepang':                { code: 'SGR04', label: 'Zon Sepang' },
  'cyberjaya':             { code: 'SGR04', label: 'Zon Sepang (Cyberjaya)' },
  'dengkil':               { code: 'SGR04', label: 'Zon Sepang' },

  // ── JOHOR ───────────────────────────────────────────────────────────────
  'johor bahru':           { code: 'JHR02', label: 'Zon Johor Bahru' },
  'iskandar puteri':       { code: 'JHR02', label: 'Zon Johor Bahru' },
  'skudai':                { code: 'JHR02', label: 'Zon Johor Bahru' },
  'pontian':               { code: 'JHR02', label: 'Zon Pontian' },
  'batu pahat':            { code: 'JHR03', label: 'Zon Batu Pahat' },
  'muar':                  { code: 'JHR03', label: 'Zon Muar' },
  'kluang':                { code: 'JHR03', label: 'Zon Kluang' },
  'segamat':               { code: 'JHR03', label: 'Zon Segamat' },
  'mersing':               { code: 'JHR03', label: 'Zon Mersing' },
  'kota tinggi':           { code: 'JHR03', label: 'Zon Kota Tinggi' },
  'kulai':                 { code: 'JHR03', label: 'Zon Kulai' },

  // ── KEDAH ───────────────────────────────────────────────────────────────
  'kota setar':            { code: 'KDH01', label: 'Zon Kota Setar' },
  'alor setar':            { code: 'KDH01', label: 'Zon Kota Setar (Alor Setar)' },
  'kubang pasu':           { code: 'KDH01', label: 'Zon Kubang Pasu' },
  'jitra':                 { code: 'KDH01', label: 'Zon Kubang Pasu (Jitra)' },
  'pokok sena':            { code: 'KDH01', label: 'Zon Pokok Sena' },
  'kuala muda':            { code: 'KDH02', label: 'Zon Kuala Muda' },
  'sungai petani':         { code: 'KDH02', label: 'Zon Kuala Muda (Sg Petani)' },
  'yan':                   { code: 'KDH02', label: 'Zon Yan' },
  'padang terap':          { code: 'KDH03', label: 'Zon Padang Terap' },
  'sik':                   { code: 'KDH03', label: 'Zon Sik' },
  'baling':                { code: 'KDH04', label: 'Zon Baling' },
  'bandar baharu':         { code: 'KDH05', label: 'Zon Bandar Baharu' },
  'kulim':                 { code: 'KDH05', label: 'Zon Kulim' },
  'langkawi':              { code: 'KDH06', label: 'Zon Langkawi' },

  // ── KELANTAN ────────────────────────────────────────────────────────────
  'bachok':                { code: 'KTN01', label: 'Zon Bachok' },
  'kota bharu':            { code: 'KTN01', label: 'Zon Kota Bharu' },
  'machang':               { code: 'KTN01', label: 'Zon Machang' },
  'pasir mas':             { code: 'KTN01', label: 'Zon Pasir Mas' },
  'pasir puteh':           { code: 'KTN01', label: 'Zon Pasir Puteh' },
  'tanah merah':           { code: 'KTN01', label: 'Zon Tanah Merah' },
  'tumpat':                { code: 'KTN01', label: 'Zon Tumpat' },
  'kuala krai':            { code: 'KTN01', label: 'Zon Kuala Krai' },
  'gua musang':            { code: 'KTN03', label: 'Zon Gua Musang' },
  'jeli':                  { code: 'KTN03', label: 'Zon Jeli' },

  // ── MELAKA ──────────────────────────────────────────────────────────────
  'melaka tengah':         { code: 'MLK01', label: 'Zon Melaka' },
  'alor gajah':            { code: 'MLK01', label: 'Zon Alor Gajah' },
  'jasin':                 { code: 'MLK01', label: 'Zon Jasin' },

  // ── NEGERI SEMBILAN ─────────────────────────────────────────────────────
  'seremban':              { code: 'NGS01', label: 'Zon Seremban' },
  'nilai':                 { code: 'NGS01', label: 'Zon Seremban (Nilai)' },
  'jelebu':                { code: 'NGS01', label: 'Zon Jelebu' },
  'kuala pilah':           { code: 'NGS01', label: 'Zon Kuala Pilah' },
  'port dickson':          { code: 'NGS01', label: 'Zon Port Dickson' },
  'rembau':                { code: 'NGS01', label: 'Zon Rembau' },
  'tampin':                { code: 'NGS01', label: 'Zon Tampin' },
  'jempol':                { code: 'NGS02', label: 'Zon Jempol' },
  'bahau':                 { code: 'NGS02', label: 'Zon Jempol (Bahau)' },

  // ── PAHANG ──────────────────────────────────────────────────────────────
  'kuantan':               { code: 'PHG02', label: 'Zon Kuantan' },
  'pekan':                 { code: 'PHG02', label: 'Zon Pekan' },
  'rompin':                { code: 'PHG02', label: 'Zon Rompin' },
  'maran':                 { code: 'PHG02', label: 'Zon Maran' },
  'bentong':               { code: 'PHG03', label: 'Zon Bentong' },
  'cameron highlands':     { code: 'PHG03', label: 'Zon Cameron Highlands' },
  'raub':                  { code: 'PHG03', label: 'Zon Raub' },
  'temerloh':              { code: 'PHG04', label: 'Zon Temerloh' },
  'jerantut':              { code: 'PHG04', label: 'Zon Jerantut' },
  'bera':                  { code: 'PHG05', label: 'Zon Bera' },
  'lipis':                 { code: 'PHG06', label: 'Zon Lipis' },
  'fraser':                { code: 'PHG03', label: 'Zon Fraser\'s Hill' },

  // ── PERAK ───────────────────────────────────────────────────────────────
  'tapah':                 { code: 'PRK01', label: 'Zon Tapah' },
  'slim river':            { code: 'PRK01', label: 'Zon Slim River' },
  'tanjung malim':         { code: 'PRK01', label: 'Zon Tanjung Malim' },
  'kuala kangsar':         { code: 'PRK02', label: 'Zon Kuala Kangsar' },
  'sungai siput':          { code: 'PRK02', label: 'Zon Sungai Siput' },
  'ipoh':                  { code: 'PRK03', label: 'Zon Ipoh' },
  'batu gajah':            { code: 'PRK03', label: 'Zon Batu Gajah' },
  'kampar':                { code: 'PRK03', label: 'Zon Kampar' },
  'kinta':                 { code: 'PRK03', label: 'Zon Kinta' },
  'gopeng':                { code: 'PRK03', label: 'Zon Gopeng' },
  'pengkalan hulu':        { code: 'PRK04', label: 'Zon Pengkalan Hulu' },
  'grik':                  { code: 'PRK04', label: 'Zon Grik' },
  'lenggong':              { code: 'PRK04', label: 'Zon Lenggong' },
  'teluk intan':           { code: 'PRK06', label: 'Zon Teluk Intan' },
  'bagan datuk':           { code: 'PRK06', label: 'Zon Bagan Datuk' },
  'seri manjung':          { code: 'PRK06', label: 'Zon Seri Manjung' },
  'manjung':               { code: 'PRK06', label: 'Zon Manjung' },
  'sitiawan':              { code: 'PRK06', label: 'Zon Sitiawan' },

  // ── PERLIS ──────────────────────────────────────────────────────────────
  'kangar':                { code: 'PLS01', label: 'Zon Kangar' },
  'arau':                  { code: 'PLS01', label: 'Zon Arau' },
  'padang besar':          { code: 'PLS01', label: 'Zon Perlis' },

  // ── PULAU PINANG ────────────────────────────────────────────────────────
  'timur laut':            { code: 'PNG01', label: 'Zon Pulau Pinang' },
  'barat daya':            { code: 'PNG01', label: 'Zon Pulau Pinang' },
  'seberang perai utara':  { code: 'PNG01', label: 'Zon S. Perai Utara' },
  'seberang perai tengah': { code: 'PNG01', label: 'Zon S. Perai Tengah' },
  'seberang perai selatan':{ code: 'PNG01', label: 'Zon S. Perai Selatan' },
  'george town':           { code: 'PNG01', label: 'Zon George Town' },
  'butterworth':           { code: 'PNG01', label: 'Zon Butterworth' },
  'penang hill':           { code: 'PNG01', label: 'Zon Pulau Pinang' },

  // ── SABAH ───────────────────────────────────────────────────────────────
  'kudat':                 { code: 'SBH02', label: 'Zon Kudat' },
  'kota marudu':           { code: 'SBH02', label: 'Zon Kota Marudu' },
  'pitas':                 { code: 'SBH02', label: 'Zon Pitas' },
  'kota kinabalu':         { code: 'SBH03', label: 'Zon Kota Kinabalu' },
  'penampang':             { code: 'SBH03', label: 'Zon Penampang' },
  'tuaran':                { code: 'SBH03', label: 'Zon Tuaran' },
  'ranau':                 { code: 'SBH03', label: 'Zon Ranau' },
  'putatan':               { code: 'SBH03', label: 'Zon Putatan' },
  'sandakan':              { code: 'SBH04', label: 'Zon Sandakan' },
  'kinabatangan':          { code: 'SBH04', label: 'Zon Kinabatangan' },
  'beluran':               { code: 'SBH04', label: 'Zon Beluran' },
  'tawau':                 { code: 'SBH05', label: 'Zon Tawau' },
  'lahad datu':            { code: 'SBH05', label: 'Zon Lahad Datu' },
  'semporna':              { code: 'SBH05', label: 'Zon Semporna' },
  'kunak':                 { code: 'SBH05', label: 'Zon Kunak' },
  'keningau':              { code: 'SBH01', label: 'Zon Pedalaman' },
  'tenom':                 { code: 'SBH01', label: 'Zon Pedalaman' },
  'beaufort':              { code: 'SBH01', label: 'Zon Pantai Barat' },
  'papar':                 { code: 'SBH01', label: 'Zon Papar' },

  // ── SARAWAK ─────────────────────────────────────────────────────────────
  'limbang':               { code: 'SWK01', label: 'Zon Limbang' },
  'lawas':                 { code: 'SWK01', label: 'Zon Lawas' },
  'miri':                  { code: 'SWK02', label: 'Zon Miri' },
  'marudi':                { code: 'SWK02', label: 'Zon Marudi' },
  'bintulu':               { code: 'SWK02', label: 'Zon Bintulu' },
  'kuching':               { code: 'SWK03', label: 'Zon Kuching' },
  'samarahan':             { code: 'SWK03', label: 'Zon Samarahan' },
  'serian':                { code: 'SWK03', label: 'Zon Serian' },
  'sri aman':              { code: 'SWK03', label: 'Zon Sri Aman' },
  'lubok antu':            { code: 'SWK03', label: 'Zon Lubok Antu' },
  'kapit':                 { code: 'SWK04', label: 'Zon Kapit' },
  'belaga':                { code: 'SWK04', label: 'Zon Belaga' },
  'sibu':                  { code: 'SWK05', label: 'Zon Sibu' },
  'mukah':                 { code: 'SWK05', label: 'Zon Mukah' },
  'kanowit':               { code: 'SWK05', label: 'Zon Kanowit' },

  // ── TERENGGANU ──────────────────────────────────────────────────────────
  'besut':                 { code: 'TRG01', label: 'Zon Besut' },
  'setiu':                 { code: 'TRG01', label: 'Zon Setiu' },
  'kemaman':               { code: 'TRG02', label: 'Zon Kemaman' },
  'dungun':                { code: 'TRG03', label: 'Zon Dungun' },
  'kuala terengganu':      { code: 'TRG04', label: 'Zon Kuala Terengganu' },
  'marang':                { code: 'TRG04', label: 'Zon Marang' },
  'hulu terengganu':       { code: 'TRG04', label: 'Zon Hulu Terengganu' },
  'kuala berang':          { code: 'TRG04', label: 'Zon Kuala Berang' },
}

/** State-level fallback when no daerah match found */
const STATE_FALLBACK: Record<string, ZoneInfo> = {
  'federal territory of kuala lumpur': { code: 'WLY01', label: 'W.P. Kuala Lumpur' },
  'federal territory of putrajaya':    { code: 'WLY01', label: 'W.P. Putrajaya' },
  'federal territory of labuan':       { code: 'WLY02', label: 'W.P. Labuan' },
  'selangor':       { code: 'SGR01', label: 'Zon Selangor' },
  'johor':          { code: 'JHR02', label: 'Zon Johor Bahru' },
  'kedah':          { code: 'KDH01', label: 'Zon Kedah' },
  'kelantan':       { code: 'KTN01', label: 'Zon Kelantan' },
  'melaka':         { code: 'MLK01', label: 'Zon Melaka' },
  'negeri sembilan':{ code: 'NGS01', label: 'Zon Negeri Sembilan' },
  'pahang':         { code: 'PHG02', label: 'Zon Pahang' },
  'perak':          { code: 'PRK03', label: 'Zon Perak' },
  'perlis':         { code: 'PLS01', label: 'Zon Perlis' },
  'pulau pinang':   { code: 'PNG01', label: 'Zon Pulau Pinang' },
  'penang':         { code: 'PNG01', label: 'Zon Pulau Pinang' },
  'sabah':          { code: 'SBH03', label: 'Zon Sabah' },
  'sarawak':        { code: 'SWK03', label: 'Zon Sarawak' },
  'terengganu':     { code: 'TRG04', label: 'Zon Terengganu' },
}

function resolveZone(addr: {
  state?: string; county?: string; city?: string
  town?: string; village?: string; suburb?: string
}): ZoneInfo {
  // Build candidates from most specific to least specific
  const candidates = [
    addr.suburb, addr.village, addr.town, addr.city, addr.county,
  ].filter(Boolean).map(s => s!.toLowerCase())

  // Try each candidate against district keys (substring match)
  for (const candidate of candidates) {
    for (const [key, zone] of Object.entries(DISTRICT_ZONES)) {
      if (candidate.includes(key) || key.includes(candidate)) return zone
    }
  }

  // State-level fallback
  const state = (addr.state ?? '').toLowerCase()
  for (const [key, zone] of Object.entries(STATE_FALLBACK)) {
    if (state.includes(key)) return zone
  }

  return { code: DEFAULT_ZONE, label: DEFAULT_LABEL }
}

// Display order: Imsak is shown but not treated as a "next prayer" trigger
const PRAYER_NAMES   = ['Imsak', 'Subuh', 'Syuruk', 'Zohor', 'Asr', 'Maghrib', 'Isyak'] as const
// Maps PrayerNames index → JAKIM JSON key
const JAKIM_KEY      = ['imsak', 'fajr', 'syuruk', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
// Only these are "call to prayer" entries for next-prayer calculation (skip Imsak & Syuruk)
const IS_SOLAT_WAKTU = [false, true, false, true, true, true, true] as const
// Maps index → imam_schedule DB key (null = no imam entry for that prayer)
const IMAM_DB_KEY    = [null, 'fajr', null, 'dhuhr', 'asr', 'maghrib', 'isha'] as const

type PrayerState = {
  times:    string[]   // length 7, matching PRAYER_NAMES
  nextIdx:  number     // index of the next solat waktu
  hijri:    string
}

/* ── JAKIM e-Solat API ────────────────────────────────────────────────────── */
async function fetchFromJAKIM(zone: string): Promise<{ times: string[]; hijri: string }> {
  const url = `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`
  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 8000)
  try {
    const res  = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.status !== 'OK!') throw new Error('JAKIM API error')
    const pt   = json.prayerTime?.[0]
    if (!pt) throw new Error('No prayerTime data')
    const times = JAKIM_KEY.map(k => (typeof pt[k] === 'string' ? (pt[k] as string).slice(0, 5) : '—'))
    return { times, hijri: pt.hijri ?? '' }
  } finally {
    clearTimeout(timeout)
  }
}

/* ── Aladhan fallback (same coordinates as masjid) ───────────────────────── */
async function fetchFromAladhan(): Promise<{ times: string[]; hijri: string }> {
  const d   = new Date()
  const url = `https://api.aladhan.com/v1/timings/${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}?latitude=3.1716&longitude=101.5344&method=11`
  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 8000)
  try {
    const res  = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const t    = json?.data?.timings
    if (!t) throw new Error('No timings')
    // Aladhan doesn't provide Imsak separately; approximate as Fajr − 10 min
    const fajrMin = parseInt(t.Fajr?.slice(0, 2)) * 60 + parseInt(t.Fajr?.slice(3, 5))
    const imsakMin = fajrMin - 10
    const imsak = `${String(Math.floor(imsakMin / 60)).padStart(2, '0')}:${String(imsakMin % 60).padStart(2, '0')}`
    const times: string[] = [
      imsak,
      t.Fajr?.slice(0, 5)    ?? '—',
      t.Sunrise?.slice(0, 5) ?? '—',
      t.Dhuhr?.slice(0, 5)   ?? '—',
      t.Asr?.slice(0, 5)     ?? '—',
      t.Maghrib?.slice(0, 5) ?? '—',
      t.Isha?.slice(0, 5)    ?? '—',
    ]
    return { times, hijri: json?.data?.date?.hijri?.date ?? '' }
  } finally {
    clearTimeout(timeout)
  }
}

function calcNextIdx(times: string[]): number {
  const now  = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  // Find the next solat waktu (skip Imsak index 0 and Syuruk index 2)
  for (let i = 0; i < times.length; i++) {
    if (IS_SOLAT_WAKTU[i] && times[i] !== '—' && times[i] > hhmm) return i
  }
  return 1 // default to Subuh
}

async function fetchTodayImams(): Promise<Record<string, string>> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('imam_schedule')
    .select('prayer, imams(name, title)')
    .eq('date', today)
  const map: Record<string, string> = {}
  for (const row of (data ?? [])) {
    const imam = row.imams as unknown as { name: string; title: string | null } | null
    if (imam) map[row.prayer] = imam.title ? `${imam.title} ${imam.name}` : imam.name
  }
  return map
}

type LocState = 'idle' | 'detecting' | 'done' | 'error'
type DetectedZone = ZoneInfo & { city: string }

export function PrayerTimesSection() {
  const [state,        setState]        = useState<PrayerState | null>(null)
  const [source,       setSource]       = useState<'jakim' | 'fallback' | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(false)
  const [imamMap,      setImamMap]      = useState<Record<string, string>>({})
  const [locState,     setLocState]     = useState<LocState>('idle')
  const [detected,     setDetected]     = useState<DetectedZone | null>(null)
  const fetched = useRef(false)

  const activeZone  = detected?.code  ?? DEFAULT_ZONE
  const activeLabel = detected?.label ?? DEFAULT_LABEL

  async function load(zone = activeZone) {
    setLoading(true)
    setError(false)
    try {
      let result: { times: string[]; hijri: string }
      try {
        result = await fetchFromJAKIM(zone)
        setSource('jakim')
      } catch {
        result = await fetchFromAladhan()
        setSource('fallback')
      }
      setState({ times: result.times, nextIdx: calcNextIdx(result.times), hijri: result.hijri })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function detectLocation() {
    if (!navigator.geolocation) { setLocState('error'); return }
    setLocState('detecting')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const addr = data.address ?? {}
          const zone = resolveZone({
            state:   addr.state,
            county:  addr.county,
            city:    addr.city,
            town:    addr.town,
            village: addr.village,
            suburb:  addr.suburb,
          })
          const city = addr.city || addr.town || addr.village || addr.county || addr.state || ''
          const det: DetectedZone = { ...zone, city }
          setDetected(det)
          setLocState('done')
          load(zone.code)
        } catch {
          setLocState('error')
        }
      },
      () => setLocState('error'),
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetchTodayImams().then(setImamMap)
    load()
  }, [])

  const panelStyle: React.CSSProperties = {
    background:   '#0C1E14',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  }

  /* ── SKELETON ── */
  if (loading) {
    return (
      <div style={panelStyle}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 16px' }}>
            <div className="skeleton h-3 w-52 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="skeleton h-8 w-28 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {PRAYER_NAMES.map(name => (
                <div key={name} style={{ padding: '16px 8px', borderRight: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                  <div className="skeleton h-2 w-10 rounded mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <div className="skeleton h-5 w-14 rounded mx-auto"      style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── ERROR ── */
  if (error || !state) {
    return (
      <div style={{ ...panelStyle, padding: '20px' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-4">
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'rgba(255,255,255,0.40)' }}>
            Gagal memuatkan waktu solat
          </p>
          <button
            onClick={() => { fetched.current = false; load() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '100px',
              border: '1px solid rgba(45,106,79,0.40)',
              background: 'transparent', color: '#52c97a', cursor: 'pointer',
              fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 500,
            }}
          >
            <RefreshCw className="w-3 h-3" /> Cuba Semula
          </button>
        </div>
      </div>
    )
  }

  const now    = new Date()
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  /* ── MAIN ── */
  return (
    <div style={panelStyle}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">

        {/* Top row: official zone label + next prayer countdown */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', padding: '16px 0 14px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
              <MapPin style={{ width: '11px', height: '11px', color: '#52c97a', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                fontWeight: 700, color: 'rgba(255,255,255,0.75)',
                letterSpacing: '0.04em',
              }}>
                {activeLabel}
                {detected?.city && ` · ${detected.city}`}
              </span>
              <span style={{
                fontFamily: 'var(--font-jetbrains)', fontSize: '9px',
                color: '#52c97a', background: 'rgba(82,201,122,0.12)',
                border: '1px solid rgba(82,201,122,0.25)',
                padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.10em',
              }}>
                {activeZone}
              </span>
              {source === 'jakim' && (
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '9px',
                  color: 'rgba(82,201,122,0.55)', letterSpacing: '0.08em',
                }}>
                  JAKIM e-Solat
                </span>
              )}

              {/* ── Location detect button ── */}
              <button
                onClick={detectLocation}
                disabled={locState === 'detecting'}
                title={locState === 'done' ? 'Lokasi dikesan' : 'Kesan lokasi semasa'}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  border: `1px solid ${locState === 'done' ? 'rgba(82,201,122,0.4)' : locState === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.10)'}`,
                  background: locState === 'done' ? 'rgba(82,201,122,0.10)' : 'rgba(255,255,255,0.04)',
                  cursor: locState === 'detecting' ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {locState === 'detecting'
                  ? <Loader2 style={{ width: '11px', height: '11px', color: '#52c97a', animation: 'spin 1s linear infinite' }} />
                  : <LocateFixed style={{ width: '11px', height: '11px', color: locState === 'done' ? '#52c97a' : locState === 'error' ? '#EF4444' : 'rgba(255,255,255,0.35)' }} />
                }
              </button>
            </div>
            {state.hijri && (
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px',
                color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em',
              }}>
                {state.hijri}
              </p>
            )}
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '10px',
              color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em',
              textTransform: 'uppercase', marginBottom: '3px',
            }}>
              {PRAYER_NAMES[state.nextIdx]}
            </p>
            <CountdownTimer targetTime={state.times[state.nextIdx]} />
          </div>
        </div>
      </div>

      {/* Prayer grid — 7 columns (includes Imsak) */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }} className="scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(64px, 1fr))', minWidth: '448px' }}>
            {PRAYER_NAMES.map((name, i) => {
              const isNext = i === state.nextIdx
              // Imsak and Syuruk are informational — show them dimmed
              const isInfo = !IS_SOLAT_WAKTU[i]
              const isPast = !isInfo && !isNext && state.times[i] !== '—' && state.times[i] < nowHHMM
              return (
                <div
                  key={name}
                  style={{
                    padding: '14px 6px',
                    borderRight:  i < 6 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    borderBottom: isNext ? '2px solid #52c97a' : '2px solid transparent',
                    background:   isNext ? 'rgba(45,106,79,0.16)' : 'transparent',
                    opacity:      (isPast || isInfo) ? (isInfo ? 0.45 : 0.28) : 1,
                    textAlign:    'center',
                    transition:   'background 0.2s',
                  }}
                >
                  <p style={{
                    fontFamily:    'var(--font-jakarta)',
                    fontSize:      '9px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color:         isNext ? '#52c97a' : 'rgba(255,255,255,0.32)',
                    fontWeight:    600,
                    marginBottom:  '6px',
                  }}>
                    {name}
                  </p>
                  <p style={{
                    fontFamily:    'var(--font-jetbrains)',
                    fontSize:      isNext ? '17px' : '13px',
                    fontWeight:    isNext ? 600 : 400,
                    color:         isNext ? '#fff' : 'rgba(255,255,255,0.60)',
                    letterSpacing: '-0.02em',
                    transition:    'font-size 0.2s',
                  }}>
                    {state.times[i]}
                  </p>
                  {isNext && (
                    <div style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: '#52c97a', margin: '5px auto 0',
                      animation: 'breathe 2s ease-in-out infinite',
                    }} />
                  )}
                  {IMAM_DB_KEY[i] && imamMap[IMAM_DB_KEY[i]!] && (
                    <p style={{
                      fontFamily:   'var(--font-jakarta)',
                      fontSize:     '8px',
                      color:        isNext ? 'rgba(82,201,122,0.65)' : 'rgba(255,255,255,0.20)',
                      marginTop:    '4px',
                      lineHeight:   1.3,
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                      maxWidth:     '100%',
                    }}>
                      {imamMap[IMAM_DB_KEY[i]!]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

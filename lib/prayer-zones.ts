export type ZoneInfo = { code: string; label: string }

export const DEFAULT_ZONE  = 'SGR01'
export const DEFAULT_LABEL = 'Zon Gombak · Selangor'

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
  'fraser':                { code: 'PHG03', label: "Zon Fraser's Hill" },

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

const STATE_FALLBACK: Record<string, ZoneInfo> = {
  'federal territory of kuala lumpur': { code: 'WLY01', label: 'W.P. Kuala Lumpur' },
  'federal territory of putrajaya':    { code: 'WLY01', label: 'W.P. Putrajaya' },
  'federal territory of labuan':       { code: 'WLY02', label: 'W.P. Labuan' },
  'selangor':        { code: 'SGR01', label: 'Zon Selangor' },
  'johor':           { code: 'JHR02', label: 'Zon Johor Bahru' },
  'kedah':           { code: 'KDH01', label: 'Zon Kedah' },
  'kelantan':        { code: 'KTN01', label: 'Zon Kelantan' },
  'melaka':          { code: 'MLK01', label: 'Zon Melaka' },
  'negeri sembilan': { code: 'NGS01', label: 'Zon Negeri Sembilan' },
  'pahang':          { code: 'PHG02', label: 'Zon Pahang' },
  'perak':           { code: 'PRK03', label: 'Zon Perak' },
  'perlis':          { code: 'PLS01', label: 'Zon Perlis' },
  'pulau pinang':    { code: 'PNG01', label: 'Zon Pulau Pinang' },
  'penang':          { code: 'PNG01', label: 'Zon Pulau Pinang' },
  'sabah':           { code: 'SBH03', label: 'Zon Sabah' },
  'sarawak':         { code: 'SWK03', label: 'Zon Sarawak' },
  'terengganu':      { code: 'TRG04', label: 'Zon Terengganu' },
}

// Canonical label per zone code — used by /api/prayer/zone when zone code is known directly
export const ZONE_LABELS: Record<string, string> = {
  WLY01: 'W.P. Kuala Lumpur & Putrajaya',
  WLY02: 'W.P. Labuan',
  SGR01: 'Zon Gombak · Selangor',
  SGR02: 'Zon Kuala Selangor · Selangor',
  SGR03: 'Zon Hulu Langat · Selangor',
  SGR04: 'Zon Petaling · Selangor',
  JHR01: 'Zon Johor',
  JHR02: 'Zon Johor Bahru',
  JHR03: 'Zon Johor',
  KDH01: 'Zon Kota Setar · Kedah',
  KDH02: 'Zon Kuala Muda · Kedah',
  KDH03: 'Zon Padang Terap · Kedah',
  KDH04: 'Zon Baling · Kedah',
  KDH05: 'Zon Kulim · Kedah',
  KDH06: 'Zon Langkawi · Kedah',
  KTN01: 'Zon Kota Bharu · Kelantan',
  KTN03: 'Zon Gua Musang · Kelantan',
  MLK01: 'Zon Melaka',
  NGS01: 'Zon Seremban · N. Sembilan',
  NGS02: 'Zon Jempol · N. Sembilan',
  PHG01: 'Zon Pulau Tioman · Pahang',
  PHG02: 'Zon Kuantan · Pahang',
  PHG03: 'Zon Bentong · Pahang',
  PHG04: 'Zon Temerloh · Pahang',
  PHG05: 'Zon Bera · Pahang',
  PHG06: 'Zon Lipis · Pahang',
  PRK01: 'Zon Tapah · Perak',
  PRK02: 'Zon Kuala Kangsar · Perak',
  PRK03: 'Zon Ipoh · Perak',
  PRK04: 'Zon Pengkalan Hulu · Perak',
  PRK05: 'Zon Perak',
  PRK06: 'Zon Teluk Intan · Perak',
  PLS01: 'Zon Perlis',
  PNG01: 'Zon Pulau Pinang',
  SBH01: 'Zon Pedalaman · Sabah',
  SBH02: 'Zon Kudat · Sabah',
  SBH03: 'Zon Kota Kinabalu · Sabah',
  SBH04: 'Zon Sandakan · Sabah',
  SBH05: 'Zon Tawau · Sabah',
  SWK01: 'Zon Limbang · Sarawak',
  SWK02: 'Zon Miri · Sarawak',
  SWK03: 'Zon Kuching · Sarawak',
  SWK04: 'Zon Kapit · Sarawak',
  SWK05: 'Zon Sibu · Sarawak',
  TRG01: 'Zon Besut · Terengganu',
  TRG02: 'Zon Kemaman · Terengganu',
  TRG03: 'Zon Dungun · Terengganu',
  TRG04: 'Zon Kuala Terengganu',
}

export function resolveZone(addr: {
  state?: string; county?: string; city?: string
  town?: string; village?: string; suburb?: string
}): ZoneInfo {
  const candidates = [
    addr.suburb, addr.village, addr.town, addr.city, addr.county,
  ].filter(Boolean).map(s => s!.toLowerCase())

  for (const candidate of candidates) {
    for (const [key, zone] of Object.entries(DISTRICT_ZONES)) {
      if (candidate.includes(key) || key.includes(candidate)) return zone
    }
  }

  const state = (addr.state ?? '').toLowerCase()
  for (const [key, zone] of Object.entries(STATE_FALLBACK)) {
    if (state.includes(key)) return zone
  }

  return { code: DEFAULT_ZONE, label: DEFAULT_LABEL }
}

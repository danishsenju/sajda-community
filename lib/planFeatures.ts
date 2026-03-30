export type PlanTier = 'surau' | 'kariah' | 'komuniti'

export const PLAN_PRICE_RM: Record<PlanTier, number> = {
  surau:    59,
  kariah:   119,
  komuniti: 219,
}

export const PLAN_PRICE_ANNUAL_RM: Record<PlanTier, number> = {
  surau:    590,
  kariah:   1190,
  komuniti: 2190,
}

export const PLAN_LABEL: Record<PlanTier, string> = {
  surau:    'Surau',
  kariah:   'Kariah',
  komuniti: 'Komuniti',
}

/** Features included in each plan (cumulative — higher plans include lower plan features) */
export const PLAN_FEATURES: Record<PlanTier, string[]> = {
  surau: [
    'mosque_profile',
    'prayer_times',
    'announcements',
    'directory_listing',
    'mosque_follows',
    'solat_tracker',
    'tasbih',
    'wirid',
    'hadis',
    'qiblat',
    'hijri',
    'tazkirah',
  ],
  kariah: [
    'mosque_profile',
    'prayer_times',
    'announcements',
    'directory_listing',
    'mosque_follows',
    'solat_tracker',
    'tasbih',
    'wirid',
    'hadis',
    'qiblat',
    'hijri',
    'tazkirah',
    'programs',
    'volunteer',
    'keperluan',
    'kelas',
    'lost_found',
    'halaqah',
    'janaiz',
    'push_notifications',
  ],
  komuniti: [
    '*', // all features
  ],
}

/** Feature descriptions shown on pricing cards */
export const FEATURE_LABELS: Record<string, string> = {
  mosque_profile:     'Profil masjid & maklumat kemudahan',
  prayer_times:       'Waktu solat harian (auto-sync JAKIM)',
  announcements:      'Papan pengumuman komuniti',
  directory_listing:  'Tersenarai dalam direktori Sajda',
  mosque_follows:     'Jemaah boleh ikut masjid anda',
  solat_tracker:      'Jejak solat jemaah (peribadi)',
  tasbih:             'Tasbih & zikir digital',
  wirid:              'Wirid harian & surah pilihan',
  hadis:              'Hadis harian dari koleksi sahih',
  qiblat:             'Penunjuk arah kiblat',
  hijri:              'Kalendar Hijri & acara Islam',
  tazkirah:           'Tazkirah & peringatan harian',
  programs:           'Program & pendaftaran sukarelawan',
  volunteer:          'Pengurusan slot sukarelawan (realtime)',
  keperluan:          'Papan keperluan komuniti',
  kelas:              'Kelas agama & tempahan tempat',
  lost_found:         'Papan cari & jumpa barang',
  halaqah:            'Kumpulan halaqah digital',
  janaiz:             'Papan notis jenazah + peta lokasi',
  push_notifications: 'Notifikasi push ke telefon jemaah',
  live_stream:        'Siaran langsung solat Jumaat',
  bilal_imam:         'Roster & jadual bilal dan imam',
  derma:              'Pengurusan akaun derma masjid',
  sijil:              'Sijil penyertaan program (PDF auto)',
}

export function hasFeature(plan: PlanTier | null | undefined, feature: string): boolean {
  if (!plan) return false
  const features = PLAN_FEATURES[plan] ?? []
  return features.includes('*') || features.includes(feature)
}

/** Returns the ordered list of features for a plan's pricing card */
export function getPlanFeatureList(plan: PlanTier): string[] {
  const features = PLAN_FEATURES[plan]
  if (features.includes('*')) {
    return Object.keys(FEATURE_LABELS)
  }
  return features
}

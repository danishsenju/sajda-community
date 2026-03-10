'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
export type DayLog = Record<PrayerKey, boolean>
export type SolatLog = Record<string, DayLog>

const STORAGE_KEY = 'sajda_solat_log'
const PRAYERS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const EMPTY_DAY: DayLog = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }

function getMalaysiaDate(): string {
  const now = new Date()
  const myt = new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000)
  return myt.toISOString().split('T')[0]
}

function safeRead(): SolatLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function safeWrite(log: SolatLog): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)) } catch { /* Safari private */ }
}

function calcStreak(log: SolatLog, todayStr: string): number {
  let streak = 0
  // Clone date via string parse to stay in UTC and avoid timezone shifts
  let cursor = new Date(todayStr + 'T00:00:00Z')
  while (true) {
    const key = cursor.toISOString().split('T')[0]
    const dayLog = log[key]
    if (!dayLog || !PRAYERS.some(p => dayLog[p])) break
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

export function useSolatTracker() {
  const today = getMalaysiaDate()
  const [log,     setLog]     = useState<SolatLog>({})
  const [streak,  setStreak]  = useState(0)
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage on client
  useEffect(() => {
    const stored = safeRead()
    // Ensure today exists
    if (!stored[today]) stored[today] = { ...EMPTY_DAY }
    setLog(stored)
    setStreak(calcStreak(stored, today))
    setMounted(true)
  }, [today])

  const todayLog: DayLog = log[today] ?? { ...EMPTY_DAY }

  const togglePrayer = useCallback(async (prayer: PrayerKey) => {
    const stored = safeRead()
    if (!stored[today]) stored[today] = { ...EMPTY_DAY }
    const wasTrue = stored[today][prayer]
    stored[today][prayer] = !wasTrue
    safeWrite(stored)
    setLog({ ...stored })
    setStreak(calcStreak(stored, today))

    // Only increment community count when turning ON (never decrement)
    if (!wasTrue) {
      try {
        const supabase = createClient()
        // Fire-and-forget — don't block UI
        supabase.rpc('increment_solat_count', {
          p_date: today,
          p_prayer: prayer,
        }).then(() => { /* silent */ }, () => { /* silent */ })
      } catch { /* offline is fine */ }
    }
  }, [today])

  return { todayLog, streak, togglePrayer, mounted, today }
}

export { PRAYERS, calcStreak, getMalaysiaDate, safeRead }

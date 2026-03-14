'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, X, User, ChevronLeft, ChevronRight, Phone } from 'lucide-react'

type Bilal = {
  id: string
  name: string
  phone: string | null
  notes: string | null
  is_active: boolean
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type Prayer = typeof PRAYERS[number]

const PRAYER_LABELS: Record<Prayer, string> = {
  fajr: 'Subuh', dhuhr: 'Zohor', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isyak',
}

const DAY_LABELS = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad']

function dateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function AdminBilalPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<'jadual' | 'roster'>('jadual')
  const [bilals, setBilals] = useState<Bilal[]>([])
  const [schedule, setSchedule] = useState<Record<string, Record<string, string | null>>>({})
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  // Roster form state
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const weekDates = getWeekDates(weekStart)

  const loadBilals = useCallback(async () => {
    const { data } = await supabase.from('bilals').select('*').order('name')
    if (data) setBilals(data)
    setLoading(false)
  }, [supabase])

  const loadSchedule = useCallback(async () => {
    const from = dateStr(weekDates[0])
    const to = dateStr(weekDates[6])
    const { data } = await supabase
      .from('bilal_schedule')
      .select('date, prayer, bilal_id')
      .gte('date', from)
      .lte('date', to)

    const map: Record<string, Record<string, string | null>> = {}
    for (const row of (data ?? [])) {
      if (!map[row.date]) map[row.date] = {}
      map[row.date][row.prayer] = row.bilal_id
    }
    setSchedule(map)
  }, [supabase, weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadBilals() }, [loadBilals])
  useEffect(() => { loadSchedule() }, [loadSchedule])

  async function setSlot(date: string, prayer: string, bilalId: string | null) {
    const key = `${date}-${prayer}`
    setSaving(key)
    if (bilalId) {
      await supabase.from('bilal_schedule').upsert(
        { date, prayer, bilal_id: bilalId },
        { onConflict: 'date,prayer' }
      )
    } else {
      await supabase.from('bilal_schedule').delete().eq('date', date).eq('prayer', prayer)
    }
    setSchedule(prev => ({
      ...prev,
      [date]: { ...(prev[date] ?? {}), [prayer]: bilalId },
    }))
    setSaving(null)
  }

  async function addBilal() {
    if (!newName.trim()) return
    setAdding(true)
    const { data } = await supabase.from('bilals').insert({
      name: newName.trim(),
      phone: newPhone.trim() || null,
      notes: newNotes.trim() || null,
    }).select().single()
    if (data) setBilals(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName(''); setNewPhone(''); setNewNotes(''); setShowAdd(false); setAdding(false)
  }

  async function saveEdit(id: string) {
    await supabase.from('bilals').update({
      name: editName,
      phone: editPhone.trim() || null,
      notes: editNotes.trim() || null,
    }).eq('id', id)
    setBilals(prev => prev.map(b => b.id === id ? { ...b, name: editName, phone: editPhone || null, notes: editNotes || null } : b))
    setEditId(null)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('bilals').update({ is_active: !current }).eq('id', id)
    setBilals(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b))
  }

  const activeBilals = bilals.filter(b => b.is_active)
  const todayStr = dateStr(new Date())

  const navBtnStyle: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.09)', background: 'transparent',
    color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '10px', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '6px',
        }}>
          Admin · Bilal
        </p>
        <h1 style={{
          fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: 700,
          color: 'rgba(255,255,255,0.88)', marginBottom: '4px',
        }}>
          Jadual Bilal
        </h1>
        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Urus senarai bilal (muezzin) dan jadual azan mingguan
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '3px', marginBottom: '24px',
        background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
        padding: '3px', width: 'fit-content',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {([['jadual', 'Jadual Mingguan'], ['roster', 'Senarai Bilal']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '7px 18px', borderRadius: '7px',
            background: tab === id ? 'rgba(82,201,122,0.14)' : 'transparent',
            border: tab === id ? '1px solid rgba(82,201,122,0.22)' : '1px solid transparent',
            color: tab === id ? '#52c97a' : 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── JADUAL TAB ── */}
      {tab === 'jadual' && (
        <div>
          {/* Week navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button style={navBtnStyle} onClick={() => setWeekStart(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd })}>
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
            </button>
            <span style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600,
              color: 'rgba(255,255,255,0.75)', minWidth: '200px',
            }}>
              {weekDates[0].toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
              {' – '}
              {weekDates[6].toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button style={navBtnStyle} onClick={() => setWeekStart(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd })}>
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => setWeekStart(getMondayOf(new Date()))}
              style={{
                padding: '6px 14px', borderRadius: '8px',
                border: '1px solid rgba(82,201,122,0.28)',
                background: 'rgba(82,201,122,0.07)', color: '#52c97a',
                fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Minggu Ini
            </button>
          </div>

          {activeBilals.length === 0 && (
            <div style={{
              padding: '20px', borderRadius: '10px', marginBottom: '16px',
              border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)',
              fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'rgba(245,158,11,0.8)',
            }}>
              Tiada bilal aktif. Tambah bilal dalam tab &quot;Senarai Bilal&quot; dahulu.
            </div>
          )}

          {/* Schedule grid */}
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{
                    padding: '12px 16px', textAlign: 'left', width: '80px',
                    fontFamily: 'var(--font-jakarta)', fontSize: '10px',
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)', fontWeight: 600,
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    Solat
                  </th>
                  {weekDates.map((d, i) => {
                    const isToday = dateStr(d) === todayStr
                    return (
                      <th key={i} style={{
                        padding: '12px 8px', textAlign: 'center',
                        fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                        color: isToday ? '#52c97a' : 'rgba(255,255,255,0.45)',
                        fontWeight: isToday ? 700 : 500,
                        background: isToday ? 'rgba(82,201,122,0.06)' : 'rgba(255,255,255,0.02)',
                      }}>
                        <div>{DAY_LABELS[i]}</div>
                        <div style={{ fontSize: '10px', opacity: 0.65, marginTop: '2px' }}>
                          {d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {PRAYERS.map((prayer, pi) => (
                  <tr key={prayer} style={{ borderTop: pi > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{
                      padding: '10px 16px',
                      fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                      fontWeight: 600, color: 'rgba(255,255,255,0.55)',
                      letterSpacing: '0.05em', background: 'rgba(255,255,255,0.01)',
                    }}>
                      {PRAYER_LABELS[prayer]}
                    </td>
                    {weekDates.map((d, di) => {
                      const ds = dateStr(d)
                      const currentId = schedule[ds]?.[prayer] ?? null
                      const key = `${ds}-${prayer}`
                      const isSaving = saving === key
                      const isToday = ds === todayStr
                      return (
                        <td key={di} style={{
                          padding: '8px 6px', textAlign: 'center',
                          background: isToday ? 'rgba(82,201,122,0.025)' : 'transparent',
                        }}>
                          <select
                            value={currentId ?? ''}
                            onChange={e => setSlot(ds, prayer, e.target.value || null)}
                            disabled={isSaving}
                            style={{
                              width: '100%', padding: '6px 8px', borderRadius: '7px',
                              border: currentId
                                ? '1px solid rgba(82,201,122,0.28)'
                                : '1px solid rgba(255,255,255,0.07)',
                              background: currentId
                                ? 'rgba(82,201,122,0.09)'
                                : 'rgba(255,255,255,0.03)',
                              color: currentId ? '#52c97a' : 'rgba(255,255,255,0.28)',
                              fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 500,
                              cursor: 'pointer', outline: 'none',
                              opacity: isSaving ? 0.5 : 1,
                              transition: 'all 0.15s',
                            }}
                          >
                            <option value="" style={{ background: '#0C1E14', color: 'rgba(255,255,255,0.35)' }}>—</option>
                            {activeBilals.map(b => (
                              <option key={b.id} value={b.id} style={{ background: '#0C1E14', color: '#fff' }}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{
            marginTop: '12px', fontFamily: 'var(--font-jakarta)', fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
          }}>
            Perubahan disimpan secara automatik apabila anda memilih bilal.
          </p>
        </div>
      )}

      {/* ── ROSTER TAB ── */}
      {tab === 'roster' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
              {bilals.length} bilal · {activeBilals.length} aktif
            </p>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px',
                background: 'rgba(82,201,122,0.11)', border: '1px solid rgba(82,201,122,0.22)',
                color: '#52c97a', fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus style={{ width: '14px', height: '14px' }} /> Tambah Bilal
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div style={{
              marginBottom: '16px', padding: '16px 18px', borderRadius: '12px',
              border: '1px solid rgba(82,201,122,0.18)', background: 'rgba(82,201,122,0.04)',
            }}>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 600,
                color: '#52c97a', marginBottom: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Bilal Baru
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Nama Penuh <span style={{ color: '#ef4444' }}>*</span>
                  </p>
                  <input
                    value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Ahmad bin Abdullah"
                    onKeyDown={e => e.key === 'Enter' && addBilal()}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontFamily: 'var(--font-jakarta)', fontSize: '13px', outline: 'none', width: '210px' }}
                  />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    No. Tel <span style={{ opacity: 0.5 }}>(pilihan)</span>
                  </p>
                  <input
                    value={newPhone} onChange={e => setNewPhone(e.target.value)}
                    placeholder="012-3456789"
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontFamily: 'var(--font-jakarta)', fontSize: '13px', outline: 'none', width: '150px' }}
                  />
                </div>
                <button
                  onClick={addBilal}
                  disabled={!newName.trim() || adding}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#52c97a', color: '#04080A', fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: !newName.trim() ? 0.4 : 1 }}
                >
                  {adding ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button onClick={() => { setShowAdd(false); setNewName(''); setNewPhone(''); setNewNotes('') }} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          )}

          {/* Bilal list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: '60px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', animation: 'breathe 1.5s ease-in-out infinite' }} />
              ))
            ) : bilals.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-jakarta)', fontSize: '13px' }}>
                Belum ada bilal didaftarkan. Tambah bilal pertama anda.
              </div>
            ) : bilals.map(b => (
              <div
                key={b.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                  opacity: b.is_active ? 1 : 0.45,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: b.is_active ? 'rgba(82,201,122,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${b.is_active ? 'rgba(82,201,122,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User style={{ width: '16px', height: '16px', color: b.is_active ? '#52c97a' : 'rgba(255,255,255,0.2)' }} />
                </div>

                {editId === b.id ? (
                  <div style={{ flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nama penuh" style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontFamily: 'var(--font-jakarta)', fontSize: '12px', outline: 'none', width: '190px' }} onKeyDown={e => e.key === 'Enter' && saveEdit(b.id)} />
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="No. telefon" style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontFamily: 'var(--font-jakarta)', fontSize: '12px', outline: 'none', width: '140px' }} />
                    <button onClick={() => saveEdit(b.id)} style={{ padding: '5px 14px', borderRadius: '6px', background: '#52c97a', color: '#04080A', border: 'none', fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Simpan</button>
                    <button onClick={() => setEditId(null)} style={{ padding: '5px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X style={{ width: '14px', height: '14px' }} /></button>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>
                      {b.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      {b.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-jakarta)', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                          <Phone style={{ width: '10px', height: '10px' }} /> {b.phone}
                        </span>
                      )}
                      <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>
                        {b.is_active ? 'Aktif' : 'Tidak aktif'}
                      </span>
                    </div>
                  </div>
                )}

                {editId !== b.id && (
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => { setEditId(b.id); setEditName(b.name); setEditPhone(b.phone ?? ''); setEditNotes(b.notes ?? '') }}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jakarta)', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(b.id, b.is_active)}
                      style={{
                        padding: '5px 12px', borderRadius: '6px',
                        border: `1px solid ${b.is_active ? 'rgba(239,68,68,0.22)' : 'rgba(82,201,122,0.22)'}`,
                        background: 'transparent',
                        color: b.is_active ? 'rgba(239,68,68,0.65)' : 'rgba(82,201,122,0.65)',
                        fontFamily: 'var(--font-jakarta)', fontSize: '11px', cursor: 'pointer',
                      }}
                    >
                      {b.is_active ? 'Nyahaktif' : 'Aktifkan'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

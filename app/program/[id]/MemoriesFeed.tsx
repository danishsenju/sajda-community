import { createClient } from '@/lib/supabase-server'

type Memory = {
  id: string
  reflection: string | null
  created_at: string
  profiles: { full_name: string | null } | null
}

export async function MemoriesFeed({ programId }: { programId: string }) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('program_memories')
    .select('id, reflection, created_at, profiles(full_name)')
    .eq('program_id', programId)
    .not('reflection', 'is', null)
    .order('created_at', { ascending: false })
    .limit(8)

  const memories = (data ?? []) as unknown as Memory[]

  if (memories.length === 0) return null

  return (
    <div className="rounded-2xl border p-5"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p style={{
        fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--primary)', marginBottom: '16px',
      }}>
        Kenangan Jemaah · {memories.length} catatan
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {memories.map(m => (
          <div
            key={m.id}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              background: 'var(--void)', border: '1px solid var(--border)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '12px', lineHeight: 1.65,
              color: 'var(--text-secondary)', margin: '0 0 8px',
              fontStyle: 'italic',
            }}>
              &ldquo;{m.reflection}&rdquo;
            </p>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '10px',
              color: 'var(--text-dim)', margin: 0,
            }}>
              {m.profiles?.full_name ?? 'Jemaah'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

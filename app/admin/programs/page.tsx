export const dynamic = 'force-dynamic'

'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Trash2, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { AddProgramModal } from './AddProgramModal'
import type { Program } from '@/types/database.types'

const CATEGORY_LABELS: Record<string, string> = {
  solat: 'Solat', kebajikan: 'Kebajikan', ramadan: 'Ramadan',
  gotong_royong: 'Gotong Royong', umum: 'Umum',
}

async function addProgramAction(fd: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('programs').insert({
    title: fd.get('title') as string,
    description: (fd.get('description') as string) || null,
    category: (fd.get('category') as Program['category']) ?? 'umum',
    program_date: fd.get('program_date') as string,
    start_time: fd.get('start_time') as string,
    end_time: (fd.get('end_time') as string) || null,
    location: (fd.get('location') as string) || null,
    needs_volunteers: fd.get('needs_volunteers') === '1',
    volunteer_slots: parseInt(fd.get('volunteer_slots') as string) || 0,
    is_published: fd.get('is_published') === '1',
    image_url: (fd.get('image_url') as string) || null,
    created_by: user?.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/programs')
}

async function deleteAction(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('programs').delete().eq('id', id)
  revalidatePath('/admin/programs')
}

export default async function AdminProgramsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('program_date', { ascending: false })

  const items = (data ?? []) as Program[]

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '4px', fontWeight: 700,
          }}>Admin</p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Program
          </h1>
        </div>
        <AddProgramModal addAction={addProgramAction} />
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: '#FCA5A5',
        }}>
          Error: {error.message}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map((p) => (
          <div key={p.id}
            style={{
              borderRadius: '16px', padding: '16px',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="green">{CATEGORY_LABELS[p.category] ?? p.category}</Badge>
                  {!p.is_published && <Badge variant="dim">Draf</Badge>}
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
                    {formatDate(p.program_date)}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {p.title}
                </p>
                {p.needs_volunteers && (
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Sukarelawan: {p.volunteer_slots === 0 ? 'Tiada had' : `${p.volunteer_slots} slot`}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Link href={`/program/${p.id}`}>
                  <Button variant="ghost" size="sm" className="p-1.5"><Eye className="w-3.5 h-3.5" /></Button>
                </Link>
                <form action={deleteAction.bind(null, p.id)}>
                  <Button variant="danger" size="sm" type="submit" className="p-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '14px',
            color: 'var(--text-dim)', textAlign: 'center', padding: '48px 0',
          }}>
            Tiada program.
          </p>
        )}
      </div>
    </div>
  )
}

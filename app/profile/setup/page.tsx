'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { User as UserIcon, Phone, Home, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ProfileSetupPage() {
  return (
    <Suspense>
      <SetupForm />
    </Suspense>
  )
}

const steps = [
  {
    key: 'full_name',
    icon: UserIcon,
    label: 'Nama Penuh',
    placeholder: 'Ahmad bin Ali',
    hint: 'Nama anda akan dipaparkan kepada komuniti.',
    type: 'text',
    question: 'Siapa nama anda?',
  },
  {
    key: 'phone',
    icon: Phone,
    label: 'No. Telefon',
    placeholder: '01x-xxxxxxx',
    hint: 'Untuk AJK menghubungi anda jika perlu.',
    type: 'tel',
    question: 'No. telefon anda?',
  },
  {
    key: 'unit_blok',
    icon: Home,
    label: 'Unit / Blok',
    placeholder: 'Blok A, Unit 12-3',
    hint: 'Membantu AJK mengenali jemaah dalam komuniti.',
    type: 'text',
    question: 'Di mana unit anda?',
  },
]

function SetupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', unit_blok: '' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        const name = session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? ''
        if (name) setForm((f) => ({ ...f, full_name: name }))
      }
      setAuthChecked(true)
    })
  }, [router])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      unit_blok: form.unit_blok,
    }).eq('id', user.id)
    setSaving(false)
    setDone(true)
    setTimeout(() => router.push(next), 1600)
  }

  function handleNext() {
    if (step === steps.length - 1) handleSave()
    else setStep((s) => s + 1)
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--void)' }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--void)' }}>
        <div className="flex flex-col items-center gap-4 animate-slideUp text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'var(--primary-pale)' }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--primary)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
            Profil Disimpan
          </p>
          <p className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
            Selamat datang ke Kariah MSU
          </p>
        </div>
      </div>
    )
  }

  const currentStep = steps[step]
  const Icon = currentStep.icon
  const isLast = step === steps.length - 1
  const value = form[currentStep.key as keyof typeof form]
  const progress = ((step + 1) / steps.length) * 100
  const initials = (form.full_name || user?.email || 'K').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'var(--border)' }}>
        <div className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: 'var(--primary)' }} />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Step counter + skip */}
          <div className="flex items-center justify-between mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              {step + 1} / {steps.length}
            </p>
            <button type="button" onClick={() => router.push(next)}
              className="text-xs transition-colors hover:text-[var(--primary)]"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Langkau
            </button>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold"
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontFamily: 'var(--font-playfair)',
                }}>
                {initials}
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? '18px' : '5px',
                      height: '5px',
                      background: i <= step ? 'var(--primary)' : 'var(--border)',
                    }} />
                ))}
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>
              {currentStep.label}
            </p>
            <h1 className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
              {currentStep.question}
            </h1>
            <p className="text-sm"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              {currentStep.hint}
            </p>
          </div>

          {/* Input */}
          <div className="mb-5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--primary)' }}>
                <Icon className="w-4 h-4" />
              </div>
              <input
                key={currentStep.key}
                type={currentStep.type}
                placeholder={currentStep.placeholder}
                value={value}
                autoFocus
                suppressHydrationWarning
                onChange={(e) => setForm((p) => ({ ...p, [currentStep.key]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) handleNext() }}
                className="w-full pl-11 pr-4 py-4 rounded-2xl text-base outline-none transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  fontFamily: 'var(--font-jakarta)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-pale)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleNext}
            disabled={saving || !value.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}>
            {saving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <>
                {isLast ? 'Simpan Profil' : 'Seterusnya'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="w-full text-center text-xs transition-colors mt-3 py-2 hover:text-[var(--primary)]"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Kembali
            </button>
          )}
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-[10px] tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
          Kariah MSU
        </p>
      </div>
    </div>
  )
}

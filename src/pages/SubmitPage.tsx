import { useState } from 'react'
import { Link } from 'react-router'
import { DOMAINS, type Domain } from '@/data/problems'
import { useAuth } from '@/hooks/useAuth'
import { useI18n, domainLabel, pickLang } from '@/i18n'
import { trpc } from '@/providers/trpc'

const DOMAIN_KEYS = Object.keys(DOMAINS) as Domain[]

type FieldProps = {
  label: string
  hint?: string
  children: React.ReactNode
}
function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-2">{label}</span>
        {hint && <span className="text-[11px] text-ink-3">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const inputCls =
  'w-full bg-paper border border-line px-3 py-2 text-sm focus:outline-none focus:border-ink transition-colors'
const areaCls = `${inputCls} min-h-[110px] font-mono2 text-[13px] leading-relaxed`

export default function SubmitPage() {
  const { lang, t } = useI18n()
  const { isAuthenticated, isLoading } = useAuth()
  const utils = trpc.useUtils()
  const [form, setForm] = useState({
    title: '',
    titleZh: '',
    domain: 'mathematical-physics' as Domain,
    subdomain: '',
    statement: '',
    origin: '',
    obstacles: '',
    impactDomains: '',
    engineeringValue: '',
    references: '',
    note: '',
  })
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = trpc.submissions.submit.useMutation({
    onSuccess: async () => {
      setDone(true)
      await utils.submissions.mine.invalidate()
    },
    onError: (e) => setError(e.message),
  })
  const mine = trpc.submissions.mine.useQuery(undefined, { enabled: isAuthenticated })

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    submit.mutate({
      title: form.title.trim(),
      titleZh: form.titleZh.trim(),
      domain: form.domain,
      subdomain: form.subdomain.trim(),
      statement: form.statement.trim(),
      origin: form.origin.trim(),
      obstacles: form.obstacles.split('\n').map((s) => s.trim()).filter(Boolean),
      impactDomains: form.impactDomains.split(/[,，、]/).map((s) => s.trim()).filter(Boolean).slice(0, 6),
      engineeringValue: form.engineeringValue.trim(),
      references: form.references.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 12),
      note: form.note.trim(),
    })
  }

  if (isLoading) return <div className="mx-auto max-w-2xl px-5 py-24 text-ink-3 text-sm">…</div>

  if (!isAuthenticated)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <h1 className="font-statement text-3xl font-bold">{t('sb.title')}</h1>
        <p className="mt-6 text-ink-2 leading-relaxed">{t('sb.login.required')}</p>
        <Link
          to="/login"
          className="mt-6 inline-block border border-ink px-5 py-2 text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          {t('nav.login')} →
        </Link>
      </div>
    )

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3">
        {t('sb.guide')}
      </div>
      <h1 className="font-statement text-3xl font-bold mt-1">{t('sb.title')}</h1>
      <p className="mt-3 text-sm text-ink-3 leading-relaxed">
        {t('sb.subtitle')}
      </p>

      {done ? (
        <div className="mt-8 border border-line p-5">
          <div className="font-statement text-lg font-semibold">
            {t('sb.submitted')}
          </div>
          <button onClick={() => setDone(false)} className="mt-3 text-sm text-ink-3 underline underline-offset-4">
            {t('sb.submitAnother')}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={t('sb.titleEn')}>
              <input className={inputCls} value={form.title} onChange={(e) => set('title')(e.target.value)} required />
            </Field>
            <Field label={t('sb.titleZh')}>
              <input className={inputCls} value={form.titleZh} onChange={(e) => set('titleZh')(e.target.value)} required />
            </Field>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={t('sb.domain')}>
              <select
                className={inputCls}
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value as Domain }))}
              >
                {DOMAIN_KEYS.map((d) => (
                  <option key={d} value={d}>
                    {domainLabel(DOMAINS[d], lang)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('sb.subdomain')} hint={t('sb.subdomain.hint')}>
              <input className={inputCls} value={form.subdomain} onChange={(e) => set('subdomain')(e.target.value)} />
            </Field>
          </div>
          <Field label={t('sb.statement')} hint="LaTeX">
            <textarea className={areaCls} value={form.statement} onChange={(e) => set('statement')(e.target.value)} required />
          </Field>
          <Field label={t('sb.origin')}>
            <textarea className={areaCls} value={form.origin} onChange={(e) => set('origin')(e.target.value)} required />
          </Field>
          <Field label={t('sb.obstacles')}>
            <textarea className={areaCls} value={form.obstacles} onChange={(e) => set('obstacles')(e.target.value)} required />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={t('sb.impact')} hint={t('sb.impact.hint')}>
              <input className={inputCls} value={form.impactDomains} onChange={(e) => set('impactDomains')(e.target.value)} />
            </Field>
            <Field label={t('sb.refs')}>
              <textarea className={`${areaCls} min-h-[80px]`} value={form.references} onChange={(e) => set('references')(e.target.value)} />
            </Field>
          </div>
          <Field label={t('sb.engineer')}>
            <textarea className={areaCls} value={form.engineeringValue} onChange={(e) => set('engineeringValue')(e.target.value)} />
          </Field>
          <Field label={t('sb.note')} hint={t('sb.optional')}>
            <textarea className={`${areaCls} min-h-[60px]`} value={form.note} onChange={(e) => set('note')(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-me">{error}</p>}
          <button
            type="submit"
            disabled={submit.isPending}
            className="border border-ink px-6 py-2 text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-40"
          >
            {submit.isPending ? '…' : t('sb.submit')}
          </button>
        </form>
      )}

      {mine.data && mine.data.length > 0 && (
        <section className="mt-14">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3">
            {t('sb.mine')}
          </div>
          <div className="mt-3 divide-y divide-line border-t border-b border-line">
            {mine.data.map((s) => (
              <div key={s.id} className="py-3 flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{pickLang(s, lang)}</div>
                  <div className="font-mono2 text-[11px] text-ink-3 mt-0.5">
                    {new Date(s.createdAt).toISOString().slice(0, 10)}
                    {s.reviewerNote ? ` · ${s.reviewerNote}` : ''}
                  </div>
                </div>
                <span
                  className={`font-mono2 text-[11px] uppercase tracking-wider ${
                    s.status === 'approved'
                      ? 'text-mc'
                      : s.status === 'rejected'
                        ? 'text-me'
                        : 'text-ink-3'
                  }`}
                >
                  {s.status === 'approved' ? t('sb.status.approved') : s.status === 'rejected' ? t('sb.status.rejected') : t('sb.status.pending')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

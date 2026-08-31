import { useState } from 'react'
import { DOMAINS, type Domain } from '@/data/problems'
import { useI18n, domainLabel } from '@/i18n'
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
    authorName: '',
  })
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = trpc.submissions.submit.useMutation({
    onSuccess: async () => {
      setDone(true)
    },
    onError: (e) => setError(e.message),
  })

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
      authorName: form.authorName.trim() || undefined,
    })
  }

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
          <Field label={t('sb.authorName')}>
            <input className={inputCls} value={form.authorName} onChange={(e) => set('authorName')(e.target.value)} />
          </Field>
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
    </div>
  )
}

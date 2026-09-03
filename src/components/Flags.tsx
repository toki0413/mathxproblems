import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useI18n } from '@/i18n'

// 社区红旗（D1 托管，匿名即发即见）——对目录问题可信度的公开质疑。
// 与评论区同治理模型：公开可见本身即信号（任何读者都能看到质疑、也都能复核）。
// 防滥用（访客+IP 限流、可选人机验证）在服务端 writeAllowed 层执行。
export const FLAG_TYPES = ['statement', 'solved', 'attribution', 'rating', 'other'] as const
export type FlagType = (typeof FLAG_TYPES)[number]

const FLAG_COLOR: Record<FlagType, string> = {
  statement: 'text-me border-me/50',
  solved: 'text-[#9a5b13] border-[#9a5b13]/40',
  attribution: 'text-ink-3 border-line-strong',
  rating: 'text-ink-3 border-line-strong',
  other: 'text-ink-3 border-line-strong',
}

export function Flags({ problemId }: { problemId: string }) {
  const { t } = useI18n()
  const utils = trpc.useUtils()
  const [flagType, setFlagType] = useState<FlagType>('statement')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const list = trpc.flags.list.useQuery({ problemId })
  const submit = trpc.flags.submit.useMutation({
    onSuccess: () => {
      setContent('')
      setErr(null)
      utils.flags.list.invalidate({ problemId })
    },
    onError: (e) => setErr(e.message),
  })

  const onSend = () => {
    if (!content.trim()) return
    setErr(null)
    submit.mutate({
      problemId,
      flagType,
      content: content.trim(),
      authorName: author.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-me">
        {list.data?.length ?? 0} {t('fl.count')}
      </div>

      {/* 红旗列表（即发即见，公开可复核） */}
      <div className="space-y-3">
        {(list.data ?? []).length === 0 ? (
          <p className="border border-dashed border-line-strong p-5 text-sm text-ink-3 leading-relaxed">
            {t('fl.empty')}
          </p>
        ) : (
          list.data?.map((f) => (
            <article key={f.id} className="border border-me/30 bg-me/5 p-4" style={{ borderLeftWidth: 3 }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full border px-2 py-0.5 font-mono2 text-[10px] uppercase tracking-wider ${FLAG_COLOR[f.flagType]}`}>
                  {t(`fl.type.${f.flagType}`)}
                </span>
                <span className="font-mono2 text-[11px] text-ink-2">
                  {f.authorName || t('fl.anonymous')}
                </span>
                <span className="font-mono2 text-[10px] text-ink-3">
                  {new Date(f.createdAt).toISOString().slice(0, 10)}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{f.content}</p>
            </article>
          ))
        )}
      </div>

      {/* 提交框 */}
      <div className="border border-line p-4">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <div className="font-mono2 text-[11px] uppercase tracking-[0.15em] text-ink-3">
            {t('fl.type.label')}
          </div>
          {FLAG_TYPES.map((ft) => (
            <button
              key={ft}
              onClick={() => setFlagType(ft)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                flagType === ft ? 'bg-me text-paper border-me' : 'border-line-strong text-ink-2 hover:border-ink'
              }`}
            >
              {t(`fl.type.${ft}`)}
            </button>
          ))}
        </div>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={128}
          placeholder={t('fl.author')}
          className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink transition-colors mb-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder={t('fl.content')}
          className="w-full bg-paper border border-line px-3 py-2 text-sm focus:outline-none focus:border-ink transition-colors resize-y"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={onSend}
            disabled={submit.isPending || !content.trim()}
            className="border border-me px-5 py-1.5 text-sm text-me hover:bg-me hover:text-paper transition-colors disabled:opacity-40"
          >
            {submit.isPending ? '…' : t('fl.send')}
          </button>
          {err && <span className="text-sm text-me">{err}</span>}
        </div>
        <p className="mt-2 text-[11px] text-ink-3">{t('fl.note')}</p>
      </div>
    </div>
  )
}

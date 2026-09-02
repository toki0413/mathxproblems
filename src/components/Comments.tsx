import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useI18n } from '@/i18n'

// 自建评论区（D1 托管，匿名即发即见）——不再依赖 GitHub Discussions/Giscus。
// 防滥用（访客+IP 限流、可选人机验证）在服务端 writeAllowed 层执行。
export function Comments({ problemId }: { problemId: string }) {
  const { t } = useI18n()
  const utils = trpc.useUtils()
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const list = trpc.comments.list.useQuery({ problemId })
  const submit = trpc.comments.submit.useMutation({
    onSuccess: () => {
      setContent('')
      setErr(null)
      utils.comments.list.invalidate({ problemId })
    },
    onError: (e) => setErr(e.message),
  })

  const onSend = () => {
    if (!content.trim()) return
    setErr(null)
    submit.mutate({
      problemId,
      content: content.trim(),
      authorName: author.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3">
        {list.data?.length ?? 0} {t('cm.count')}
      </div>

      {/* 评论列表（即发即见，无需审核） */}
      <div className="space-y-3">
        {(list.data ?? []).length === 0 ? (
          <p className="border border-dashed border-line-strong p-5 text-sm text-ink-3 leading-relaxed">
            {t('cm.empty')}
          </p>
        ) : (
          list.data?.map((c) => (
            <article key={c.id} className="border border-line bg-white/50 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono2 text-[11px] text-ink-2">
                  {c.authorName || t('cm.anonymous')}
                </span>
                <span className="font-mono2 text-[10px] text-ink-3">
                  {new Date(c.createdAt).toISOString().slice(0, 10)}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{c.content}</p>
            </article>
          ))
        )}
      </div>

      {/* 发布框 */}
      <div className="border border-line p-4">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={128}
          placeholder={t('cm.author')}
          className="w-full bg-paper border border-line px-3 py-1.5 text-sm focus:outline-none focus:border-ink transition-colors mb-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder={t('cm.content')}
          className="w-full bg-paper border border-line px-3 py-2 text-sm focus:outline-none focus:border-ink transition-colors resize-y"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={onSend}
            disabled={submit.isPending || !content.trim()}
            className="border border-ink px-5 py-1.5 text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-40"
          >
            {submit.isPending ? '…' : t('cm.send')}
          </button>
          {err && <span className="text-sm text-me">{err}</span>}
        </div>
        <p className="mt-2 text-[11px] text-ink-3">{t('cm.note')}</p>
      </div>
    </div>
  )
}

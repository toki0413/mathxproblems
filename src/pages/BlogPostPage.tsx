import { Link, useParams } from 'react-router'
import rawEn from '../../blog/formalization-frontier.md?raw'
import rawCn from '../../blog/cn-audit-gate.md?raw'
import { Markdown } from '@/components/Markdown'
import { Reveal } from '@/components/Reveal'
import { useI18n } from '@/i18n'

// 传播锚点：数据驱动的技术博客（内容在 blog/*.md，
// 与仓库内可独立发布的源文件保持同源，避免站内副本漂移）。
const BLOG: Record<string, string> = {
  'formalization-frontier': rawEn,
  'cn-audit-gate': rawCn,
}

export default function BlogPostPage() {
  const { t } = useI18n()
  const { slug } = useParams()
  const raw = BLOG[slug ?? ''] ?? rawEn
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Reveal>
        <Link to="/" className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-ink-3 hover:text-ink">
          ← {t('bp.back')}
        </Link>
        <div className="mt-6">
          <Markdown>{raw}</Markdown>
        </div>
      </Reveal>
    </div>
  )
}

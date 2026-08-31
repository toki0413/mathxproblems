import { useMemo } from 'react'
import { parseBand } from '@contracts/band'
import { useI18n } from '@/i18n'

export interface BandStep {
  id: number
  newBand: string | null
  bits: number | null
  createdAt: string | Date
}

/**
 * 收窄历程区间尺：把同一问题的历代带证区间画在同一把尺上。
 * 每次验证是一段括号，后一代嵌在前一代之内——收敛一眼可见，
 * 比任何文字都直接地回答「人类在这题上走到哪了」。
 * 数字一律等宽 + tabular-nums，bits 标注每次的信息量增益。
 */
export function BandRuler({ steps }: { steps: BandStep[] }) {
  const { t } = useI18n()
  const parsed = useMemo(
    () =>
      steps
        .map((s) => ({ ...s, band: parseBand(s.newBand) }))
        .filter((s): s is BandStep & { band: { lo: number; hi: number } } => s.band !== null)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [steps],
  )

  const [min, max] = useMemo(() => {
    if (!parsed.length) return [0, 1]
    const lo = Math.min(...parsed.map((s) => s.band.lo))
    const hi = Math.max(...parsed.map((s) => s.band.hi))
    const pad = (hi - lo) * 0.06 || Math.abs(hi) * 0.02 || 1
    return [lo - pad, hi + pad]
  }, [parsed])

  if (parsed.length === 0) return null

  const W = 720
  const ROW = 34
  const ML = 8
  const MR = 150
  const H = parsed.length * ROW + 26
  const x = (v: number) => ML + ((v - min) / (max - min)) * (W - ML - MR)

  return (
    <div className="mb-4">
      <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
        {t('pd.bandruler')}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl select-none" role="img">
        {/* 轴线与端点刻度 */}
        <line x1={x(min)} y1={H - 12} x2={x(max)} y2={H - 12} stroke="#cfccc0" strokeWidth={1} />
        {[min, max].map((v) => (
          <text
            key={v}
            x={x(v)}
            y={H - 1}
            textAnchor="middle"
            fontSize={9}
            fill="#8b887c"
            fontFamily="ui-monospace, Menlo, monospace"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {v.toPrecision(4)}
          </text>
        ))}
        {parsed.map((s, i) => {
          const y = i * ROW + 14
          const x1 = x(s.band.lo)
          const x2 = x(s.band.hi)
          const last = i === parsed.length - 1
          const stroke = last ? '#1e7a5a' : '#8b887c'
          return (
            <g key={s.id} opacity={last ? 1 : 0.75}>
              {/* 区间括号 */}
              <path
                d={`M ${x1} ${y - 5} L ${x1} ${y + 5} M ${x1} ${y} L ${x2} ${y} M ${x2} ${y - 5} L ${x2} ${y + 5}`}
                stroke={stroke}
                strokeWidth={last ? 1.8 : 1.1}
                fill="none"
              />
              <text
                x={x2 + 8}
                y={y + 3}
                fontSize={10}
                fill={last ? '#16150f' : '#8b887c'}
                fontFamily="ui-monospace, Menlo, monospace"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {s.newBand}
              </text>
              {s.bits !== null && (
                <text
                  x={x2 + 8}
                  y={y + 14}
                  fontSize={9}
                  fill={s.bits >= 0 ? '#1e7a5a' : '#8a2f3c'}
                  fontFamily="ui-monospace, Menlo, monospace"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.bits >= 0 ? '+' : ''}
                  {s.bits.toFixed(2)} {t('pd.bits')}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

import { useMemo } from 'react'
import { trpc } from '@/providers/trpc'

export interface BitsInfo {
  /** 累计正向收窄信息量（比特） */
  bits: number
  /** 已通过验证收窄次数 */
  verifications: number
  /** 当前带证区间 */
  lastBand: string | null
}

/**
 * 全库逐题 bits 索引（problemId → BitsInfo）。把「这道题被推进了多少」
 * 前置到导航层：图谱节点大小编码、索引行徽标、监测摘要共用这一份数据。
 * 静态部署 / 后端不可达时静默为空 Map，各消费方自行降级（节点回原尺寸）。
 */
export function useBitsIndex(): ReadonlyMap<string, BitsInfo> {
  const { data } = trpc.attempts.bitsIndex.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  })
  return useMemo(() => {
    const m = new Map<string, BitsInfo>()
    for (const e of data ?? []) {
      m.set(e.problemId, {
        bits: e.bits,
        verifications: e.verifications,
        lastBand: e.lastBand,
      })
    }
    return m
  }, [data])
}

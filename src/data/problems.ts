import type { Domain } from '@contracts/constants'
export type { Domain }

export type OutputKind = 'verified_behavior' | 'verified_truth' | 'scaffolding'

/**
 * 残差三层：模型近似 / 输入参数不确定度 / 数值。verified_behavior 类问题须
 * 三层齐备，总带 ≤ 三者之和（scripts/lib/catalog-checks.mjs 强制）。
 */
export interface ResidualLayer {
  bound: string
  derivation: string
}

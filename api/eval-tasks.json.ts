// LLM 数学推理评测集（公开版，契约 v0.1）：目录里「判定可消费/可判定」的题——
// verified_behavior（带证行为证书）或带 certificate（三层残差总带）——导出为
// 机器可核验的评测任务。与 buildBenchmark（api/catalog.json.ts）同筛选同源，
// 避免第二份事实来源；每条任务标注 L0/L1/L2 机器核验锚点（谁可核验什么）。
// 诚实语义：这是"评测资产 + 判定协议"，不是虚构的模型分数榜；结果必须走双桥
// 账本提交，经审稿通过后才会出现在公开判定进度里。
import { AUDITED_PROBLEMS } from "../src/data/audits.ts";
import { anchorOf, DOMAINS, type Domain, type VerificationPath } from "../src/data/problems.ts";

export interface EvalTask {
  task_id: string;
  title: string;
  domain: Domain;
  /** 判定形式：被认可答案必须满足什么、如何核验（证明证书 / 数值判据 / 反例构造）。 */
  judgment: string;
  /** 待证的 Lean 4 陈述（L0 锚点；有才给）。 */
  lean_statement?: string;
  verification_path: VerificationPath;
  difficulty: string;
  tags: string[];
  /** 机器核验锚点：L0 陈述 / L1 纪录括区 / L2 失败类型学。 */
  anchors: {
    statement_anchor: boolean;
    certificate_record: { lo: number; hi: number } | null;
    failure_typology: boolean;
  };
}

export function buildEvalTasks(): EvalTask[] {
  return AUDITED_PROBLEMS.filter(
    (p) => p.certificate || p.output === "verified_behavior",
  )
    .map((p) => {
      const a = anchorOf(p);
      return {
        task_id: p.id,
        title: p.title,
        domain: p.domain,
        judgment: p.judgment ?? "",
        lean_statement: p.lean_statement,
        verification_path: p.verification_path,
        difficulty: p.difficulty,
        tags: p.tags,
        anchors: {
          statement_anchor: a.statement_anchor,
          certificate_record: a.certificate_record ?? null,
          failure_typology: a.failure_typology,
        },
      };
    })
    .sort((a, b) => a.task_id.localeCompare(b.task_id));
}

export function evalTaskStats() {
  const tasks = buildEvalTasks();
  return {
    contract: "eval-tasks/v1",
    count: tasks.length,
    by_domain: Object.fromEntries(
      (Object.keys(DOMAINS) as Domain[]).map((d) => [d, tasks.filter((x) => x.domain === d).length]),
    ),
    anchors: {
      statement_anchor: tasks.filter((x) => x.anchors.statement_anchor).length,
      certificate_record: tasks.filter((x) => x.anchors.certificate_record).length,
      failure_typology: tasks.filter((x) => x.anchors.failure_typology).length,
    },
  };
}

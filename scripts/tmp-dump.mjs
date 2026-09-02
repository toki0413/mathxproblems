// 一次性倾倒：把 114 题的审计相关字段压缩输出，供逐题审计判断。
import { PROBLEMS } from "../src/data/problems.ts";

for (const p of PROBLEMS) {
  const s = (p.statement ?? "").replace(/\s+/g, " ").trim();
  const refs = (p.references ?? []).map((r) => (typeof r === "string" ? r : r.label ?? "")).filter(Boolean);
  const refCount = refs.length;
  const refSample = refs.slice(0, 2).join(" | ");
  console.log(
    [
      p.id,
      `d=${p.domain}`,
      `st=${p.status}`,
      `v=${p.verification_path}`,
      `dif=${p.difficulty}`,
      `pot=${p.formalization_potential}`,
      `refs=${refCount}`,
      p.title,
      "::",
      s.slice(0, 180),
      refSample ? `[[${refSample.slice(0, 120)}]]` : "[no-refs]",
    ].join("\t"),
  );
}

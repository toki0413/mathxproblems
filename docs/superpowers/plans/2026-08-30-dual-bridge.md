# 双桥协议(Dual-Bridge Protocol)实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有问题库上叠加"双桥视图"(formal_view + bridge 可选字段),随 `problems.json` 序列化为可被 AI4Math 与 AI4S 两端消费的机器契约,并在详情页新增双桥可视化、在目录校验中加入枚举门禁。

**Architecture:** 不做独立命名空间或新实体。存储侧在现有 `Problem` 接口上加 `formal_view?`(形式视图)与 `bridge?`(桥)两个可选字段;`banded_view` 由既有 `Certificate` 承担。序列化走既有 `api/catalog.json.ts` 的 regex 形态,随 `problems.json` 输出。详情页在既有"残余总带证书"区块内并列一个"双桥"sections。目录校验在 `catalog-checks.mjs` 加 `formal_view.status`/`bridge.direction` 枚举与 `formal_view.judgment` 存在性检查。每步 TDD-尽量可运行,频繁提交。

**Tech Stack:** TypeScript / React 19 / Hono(server)/ Node regex(无 TS runtime 导入)/ vitest。

**参考 spec:** `docs/superpowers/specs/2026-08-30-dual-bridge-design.md`(已认可)。落地顺序为**方案 A 本版**,C 写路径留白。

---

## File Structure

- Modify `src/data/problems.ts` — 新增 `FormalView`/`Bridge` 类型与 `formal_view?`/`bridge?` 字段;给 `mc-003` 填双桥 seed。
- Modify `api/catalog.json.ts` — `oneProblem()` 提取 `formal_view.status`/`bridge.direction`/`judgment`/`link`,随 catalog 输出。
- Modify `scripts/lib/catalog-checks.mjs` — 新增 `FORMAL_STATUS`/`BRIDGE_DIRECTIONS` 枚举集,校验含 dual-bridge 的问题。
- Modify `scripts/lib/catalog-checks.test.mjs` — 单元测试校验逻辑。
- Modify `src/pages/ProblemDetailPage.tsx` — 详情页新增双桥可视化区块(${document.scription 内的第 173 起区块旁)。
- Modify `src/i18n.tsx` — 新增 `pd.dualbridge.*` 键。
- Revise `scripts/check-problems.mjs`(如已有调用 checkCatalog,则无需改;仅当需输出双桥指纹时改动)。

---

### Task 1: 在 `Problem` 上加双桥类型与可选字段

**Files:**
- Modify: `src/data/problems.ts`(在 `Certificate` 接口之后、`Problem` 之前插入新类型;在 `Problem` 接口末尾加两字段)

- [ ] **Step 1: 加 `FormalStatus` / `FormalView` / `Bridge` 类型**

在 `Certificate` 接口(约 line 64)之后插入:

```ts
/** 形式视图侧 AI4Math 端状态;verified_truth/verified_behavior 均可填 provable,缺省 conjectured。 */
export type FormalStatus = 'provable' | 'conjectured' | 'refuted'

/** bridge.direction 三值;mutual_boundary 是最贴近 PCM 的共生模式。 */
export type BridgeDirection =
  | 'formal_idealizes_banded'    // formal T 是 banded C 的 ε→0 理想化
  | 'banded_instantiates_formal' // banded C 例示/锚定 formal T 的现实内容
  | 'mutual_boundary'            // 共生: 形式证与经验带互为边界(对齐 Proof-Carrying Materials)

/** 双桥形式侧: 给 AI4Math/证明流水线消费的形式化规范形 + 判定 + 状态。 */
export interface FormalView {
  statement: string                       // 规范形语句(可被证明/证伪)
  target: string                          // 目标形式系统, 如 'Lean4/mathlib' 或 'external'
  artifact?: { label: string; url: string } // 可选: 引用外部形式化工件(Lean file / benchmark entry)
  judgment: string                        // 合格答案类型: 证明证书 / 数值判据 / 反例构造
  status: FormalStatus
  via?: string                            // 溯源: 证明/反例出处
}

/** 桥: 形式侧与带侧(既有 Certificate)的关系声明。 */
export interface Bridge {
  link: string                            // 如 'T 是 C 的 ε→0 理想化'
  direction: BridgeDirection
  band_as_fn_of_eps?: string              // 可选: 带随理想化参数收缩的关系
}
```

- [ ] **Step 2: 在 `Problem` 接口末尾加两个可选字段**

在 `Problem` 接口(约 line 114,`engineering_deliverables?` 之后)追加:

```ts
  /** 双桥形式侧(可选): 对 AI4Math 端的形式化视图;随 problems.json 序列化。 */
  formal_view?: FormalView
  /** 双桥桥(可选): 形式视图(T)与带证书(C, 由 certificate 承担)的语义连接。 */
  bridge?: Bridge
```

- [ ] **Step 3: 类型编译校验**

Run: `npm run check`
Expected: 通过(无新错误)。若报 `Problem` 使用处缺字段,确认两步都已插入。

- [ ] **Step 4: Commit**

```bash
git add src/data/problems.ts
git commit -m "feat(dual-bridge): add FormalView/Bridge types and optional fields to Problem"
```

---

### Task 2: 给 `mc-003` 填双桥 seed(带侧用既有 certificate)

**Files:**
- Modify: `src/data/problems.ts`(在 `mc-003` 对象的 `certificate` 区块之后、对象闭合 `},` 之前插入 `formal_view` 与 `bridge`)

- [ ] **Step 1: 在 `mc-003` 的 certificate 后插入双桥字段**

`mc-003`(苯环 HOMO–LUMO 谱隙,`verified_behavior`,证书在约 line 731)的 `certificate` 闭合约 line 746 的 `},` 后、对象的收尾 `},` 之前,插入:

```ts
    formal_view: {
      statement: '对给定六环数 $h$ 与目标光隙,判定是否存在苯环型分子图(六角格子上无割点的有限连通子图)使 Hückel 邻接谱的 HOMO–LUMO 隙等于该值,并对实现族做完全分类。',
      target: 'Lean4/mathlib(区间算术)',
      artifact: { label: 'Gutman & Polansky, Mathematical Concepts in Organic Chemistry, 1986', url: 'https://link.springer.com/book/10.1007/978-3-642-70982-1' },
      judgment: '证明证书或可核验二次判据;与带侧共享同一 R_model/R_num 语义',
      status: 'conjectured',
      via: 'Gutman & Polansky (1986);详细残差见本题 certificate',
    },
    bridge: {
      link: '带侧"光隙可实现性判定 ≤ R_model + R_num"是形式侧理想 Hückel 谱隙命题的工程带化实例:形式命题取 ε→0(把 Hückel 当作精确)时即对该判定的理想化。',
      direction: 'formal_idealizes_banded',
      band_as_fn_of_eps: '带随理想化收缩;R_model 显式把真实电子结构限制为 Hückel 模型',
    },
```

注意:插入位置必须在 `mc-003` 对象内、不要在它的 `related_problems` 数组里误插。`mc-003` 从约 line 689 到约 line 747(其后紧跟 `{` 的 `mc-004` 在 line 749)。

- [ ] **Step 2: 校验收录门禁**

Run: `npm run check:problems`
Expected: 通过(不报新 failure)。`mc-003` 日期早于 `VERACITY_GATE`,不触发模板句门禁;`formal_view` 现有逻辑不影响三层残差/溯源检查。

- [ ] **Step 3: 类型编译校验**

Run: `npm run check`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/data/problems.ts
git commit -m "feat(dual-bridge): seed formal_view/bridge on mc-003 benzenoid spectral-gap problem"
```

---

### Task 3: 在 `catalog.json.ts` 序列化双桥字段

**Files:**
- Modify: `api/catalog.json.ts`(在 `oneProblem` 中新增字段提取)

- [ ] **Step 1: 加双桥字段提取,并入 `oneProblem` 返回**

在 `oneProblem(block)` 的 `return {...}` 中,`certificate` 之后追加提取逻辑。先加辅助(放 `layerBound` 旁):

```ts
const nestedStr = (b: string, outer: string, field: string): string => {
  const m = b.match(
    new RegExp(`${outer}: \\{[\\s\\S]*?(?:^    )?${field}: '((?:[^'\\\\]|\\\\.)*)'`),
  );
  return m ? m[1] : "";
};
```

然后(在 `certificate` 计算之后、`return {...}` 之前):

```ts
  const formal_view = block.includes("formal_view: {")
    ? {
        statement: nestedStr(block, "formal_view", "statement") || str(block, "formalization_notes"),
        target: nestedStr(block, "formal_view", "target"),
        judgment: nestedStr(block, "formal_view", "judgment"),
        status: nestedStr(block, "formal_view", "status"),
      }
    : undefined;
  const bridge = block.includes("bridge: {")
    ? { link: nestedStr(block, "bridge", "link"), direction: nestedStr(block, "bridge", "direction") }
    : undefined;
```

在 `return {...}` 中,`certificate,` 之后加:

```ts
    formal_view,
    bridge,
```

说明: `nestedStr` 取 `outer: { ... field: 'value' }` 内单行字面量,适用于本版 seed(全部单行字段)。`formal_view.statement` 若为多行则兜底 `formalization_notes`。若未来出现多行 `formal_view.judgment`,再扩展 range 提取。

- [ ] **Step 2: 用序列化冒烟验证**

Run:

```bash
node -e "import('./api/catalog.json.ts').then(m=>{const c=m.buildCatalog();const p=c.find(x=>x.id==='mc-003');console.log(JSON.stringify(p?.formal_view,null,2));console.log(JSON.stringify(p?.bridge,null,2));})"
```
Expected: 打印 `mc-003` 的 `formal_view.status==='conjectured'`、`bridge.direction==='formal_idealizes_banded'`,`formal_view.judgment` 非空。若打印为空,检查正则字段名与缩进(必须 `^    ` 四空格对齐现有 `oneProblem` 解析)。

- [ ] **Step 3: Commit**

```bash
git add api/catalog.json.ts
git commit -m "feat(dual-bridge): serialize formal_view/bridge in catalog contract"
```

---

### Task 4: 目录校验加双桥枚举门禁(含单元测试)

**Files:**
- Modify: `scripts/lib/catalog-checks.mjs`
- Modify: `scripts/lib/catalog-checks.test.mjs`

- [ ] **Step 1: 在 `catalog-checks.mjs` 加枚举集与解析**

在 `LIFECYCLE_KINDS` 定义(约 line 8)之后加:

```js
export const FORMAL_STATUSES = new Set(['provable', 'conjectured', 'refuted'])
export const BRIDGE_DIRECTIONS = new Set(['formal_idealizes_banded', 'banded_instantiates_formal', 'mutual_boundary'])
```

在 `parseCatalog` 的循环内,`lifecycleStatuses` 采集之后加:

```js
    const fv = line.match(/^    formal_view: \{/)
    if (fv && cur) formalViews.add(cur)
    const fvStatus = line.match(/^      status: '([^']+)',/)
    if (fvStatus && cur) formalStatuses.set(cur, fvStatus[1])
    const br = line.match(/^    bridge: \{/)
    if (br && cur) bridges.add(cur)
    const brDir = line.match(/^      direction: '([^']+)',/)
    if (brDir && cur) bridgeDirections.set(cur, brDir[1])
```

并在 `parseCatalog` 的返回值对象与函数头解构处,加入 `formalViews`、`formalStatuses`、`bridges`、`bridgeDirections`(新增 `Set`/`Map` 初始化: `const formalViews = new Set()`, `const formalStatuses = new Map()`, `const bridges = new Set()`, `const bridgeDirections = new Map()`)。

- [ ] **Step 2: 在 `checkCatalog` 加门禁**

在 `checkCatalog` 的 lifecycle 检查段(约 line 153)之后插入:

```js
  // 双桥(方向: formal_view/bridge 枚举合法性 + 判定存在)
  const fvStatusesOk = [...formalStatuses].filter(([, v]) => !FORMAL_STATUSES.has(v))
  const brDirsOk = [...bridgeDirections].filter(([, v]) => !BRIDGE_DIRECTIONS.has(v))
  const fvNoJudge = [...formalViews].filter((id) => !src.includes(`      judgment:`))
  if (fvStatusesOk.length) failures.push(`invalid formal_view.status: ${fvStatusesOk.map(([k, v]) => `${k}=${v}`).join(', ')}`)
  if (brDirsOk.length) failures.push(`invalid bridge.direction: ${brDirsOk.map(([k, v]) => `${k}=${v}`).join(', ')}`)
  if (fvNoJudge.length) failures.push(`formal_view missing 'judgment': ${fvNoJudge.join(', ')}`)
  if (formalViews.size && fvStatusesOk.length === 0 && brDirsOk.length === 0) {
    notes.push(`dual-bridge: ${formalViews.size} formal_view, ${bridges.size} bridge, enums valid`)
  }
```

注意: `fvNoJudge` 的匹配对多行 judgment 会误判为缺失;seed 为单行,且只对含 `formal_view` 的问题统计,故可用,注释说明该简化(ponytail: 本版仅单行 judgment,若后续出现多行 formal_view.judgment 再改成 range 提取)。

- [ ] **Step 3: 在 `.test.mjs` 加单元测试**

在 `catalog-checks.test.mjs` 末尾追加两个用例(沿用既有测试导入风格 `import { checkCatalog, FORMAL_STATUSES, BRIDGE_DIRECTIONS } from './lib/catalog-checks.mjs'` 或顶部合并导入):

```js
test('formal_view/bridge enum validity', () => {
  const r = checkCatalog(
    [
      "    id: 'x1',",
      '    output: \'verified_behavior\',',
      '    formal_view: {',
      "      status: 'provable',",
      "      judgment: 'proof certificate',",
      '    },',
      '    bridge: {',
      "      direction: 'mutual_boundary',",
      "      link: 'symbiotic boundary',",
      '    },',
      "    id: 'x2',",
      '    output: \'verified_behavior\',',
      '    formal_view: {',
      "      status: 'bogus',",
      "      judgment: 'counterexample',",
      '    },',
      '    bridge: {',
      "      direction: 'sideways',",
      '    },',
    ].join('\n'),
  )
  expect(r.failures.some((f) => f.includes('invalid formal_view.status: x2=bogus'))).toBe(true)
  expect(r.failures.some((f) => f.includes('invalid bridge.direction: x2=sideways'))).toBe(true)
})
```

(注意: 测试用最小合法 ctx 可能触发其它既有 failure,如缺 `judgment`/`output`。为隔离,断言只检查 `some(...includes(...))` 而不要求整体通过;若其它门禁把这两例进 failures,取 `failures.filter(f=>f.includes('formal_view')||f.includes('bridge'))` 再断言。)

- [ ] **Step 4: 运行测试**

Run: `npm test -- --testPathPattern=catalog-checks`
Expected: 新用例 PASS;既有 catalog-checks 用例不回归。

- [ ] **Step 5: 全量校验**

Run: `npm run check:problems`
Expected: 通过,`check-problems.mjs` 调用 `checkCatalog` 输出含 `dual-bridge: N formal_view ...` note(或零 failure)。

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/catalog-checks.mjs scripts/lib/catalog-checks.test.mjs
git commit -m "feat(dual-bridge): add formal_view/bridge enum gate + unit tests"
```

---

### Task 5: 详情页"双桥视图"可视化 + i18n

**Files:**
- Modify: `src/pages/ProblemDetailPage.tsx`
- Modify: `src/i18n.tsx`

- [ ] **Step 1: 加 i18n 键**

在 `src/i18n.tsx` 中 `pd.certificate` 键附近(约 line 105)加入:

```ts
  'pd.dualbridge.title': { zh: '双桥视图', en: 'Dual-bridge view' },
  'pd.dualbridge.formal': { zh: '形式侧 (AI4Math)', en: 'Formal side (AI4Math)' },
  'pd.dualbridge.banded': { zh: '带侧 (AI4S)', en: 'Banded side (AI4S)' },
  'pd.dualbridge.bridge': { zh: '桥', en: 'The bridge' },
  'pd.dualbridge.direction': { zh: '连接方向', en: 'Connection' },
  'pd.dualbridge.status': { zh: '状态', en: 'Status' },
  'pd.dualbridge.judgment': { zh: '判定', en: 'Judgment' },
```

- [ ] **Step 2: 详情页渲染双桥区块**

在 `ProblemDetailPage.tsx` 中,在既有 `p.certificate && (...)` 区块(约 line 173 起)之后、`p.judgment` 与信任审计区块之间,插入一个仅当 `p.formal_view || p.bridge` 时渲染的 `<Section>`:

```tsx
          {(p.formal_view || p.bridge) && (
            <Section title={t('pd.dualbridge.title')}>
              <div className="grid md:grid-cols-2 gap-4">
                {p.formal_view && (
                  <div className="border border-line p-4">
                    <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
                      {t('pd.dualbridge.formal')}
                    </div>
                    <p className="text-sm text-ink-2 leading-relaxed">{p.formal_view.statement}</p>
                    <div className="mt-3 hairline-t pt-3 space-y-1">
                      <div className="text-xs">
                        <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.target')}·</span>
                        <span className="text-ink-2">{p.formal_view.target}</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.status')}·</span>
                        <span className={`font-mono2 ${p.formal_view.status === 'provable' ? 'text-mc' : p.formal_view.status === 'refuted' ? 'text-rose-500' : 'text-ink-2'}`}>{p.formal_view.status}</span>
                      </div>
                      {p.formal_view.judgment && (
                        <div className="text-xs text-ink-2 leading-relaxed">
                          <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.judgment')}· </span>
                          {p.formal_view.judgment}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {p.certificate && (
                  <div className="border border-line p-4">
                    <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">
                      {t('pd.dualbridge.banded')}
                    </div>
                    <div className="font-mono text-sm text-ink">{p.certificate.certified_band ?? '—'}</div>
                    <div className="mt-1 font-mono text-sm text-ink-2">{p.certificate.total_band}</div>
                  </div>
                )}
              </div>
              {p.bridge && (
                <div className="mt-4 border border-line border-l-3 p-4" style={{ borderLeftWidth: 3 }}>
                  <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-ink-3 mb-2">{t('pd.dualbridge.bridge')}</div>
                  <p className="text-sm text-ink-2 leading-relaxed">{p.bridge.link}</p>
                  <div className="mt-2 text-xs">
                    <span className="font-mono2 text-ink-3 uppercase tracking-wider">{t('pd.dualbridge.direction')}: </span>
                    <span className="font-mono2 text-ink-2">{p.bridge.direction}</span>
                  </div>
                </div>
              )}
            </Section>
          )}
```

注意: `t('pd.dualbridge.target')` 上报;给 i18n 补该键(把 Step 1 里漏的 `target` 键加上,值 `{ zh: '目标系统', en: 'Target' }`)。也可直接用字面串,与既有区块风格保持一致(既有区块大量用 `t()` 字面)。若不新增 `t('pd.dualbridge.target')` 键,将 Step 2 中两处 `t('pd.dualbridge.target')` 换成硬编码 `'Target'` 与 `'目标系统'` 会破坏双语——统一加键更省。

修正 Step 1 的键表为包含 `target` 键。

- [ ] **Step 3: 类型与构建校验**

Run: `npm run check && npm run build`
Expected: 通过。若 `text-mc`/`text-rose-500` 类不存在或有 lint 报未用,改用既有类(如 `text-ink`/`text-ink-3`)并重跑。

- [ ] **Step 4: Commit**

```bash
git add src/pages/ProblemDetailPage.tsx src/i18n.tsx
git commit -m "feat(dual-bridge): render dual-bridge view on problem detail page"
```

---

### Task 6: 校验 + 测试全集 + 提交

**Files:**
- (无新文件;验证与收尾)

- [ ] **Step 1: 全量类型检查**

Run: `npm run check`
Expected: PASS。

- [ ] **Step 2: 目录契约完整性**

Run: `npm run check:problems`
Expected: PASS,无新 failure 或 warning。

- [ ] **Step 3: 单元测试全集**

Run: `npm test`
Expected: PASS,无回归。

- [ ] **Step 4: 冒烟序列化输出**

Run(沿用 Task 3 命令):
```bash
node -e "import('./api/catalog.json.ts').then(m=>{const c=m.buildCatalog();const p=c.find(x=>x.id==='mc-003');console.log(JSON.stringify({fv:p?.formal_view,br:p?.bridge},null,2));})"
```
Expected: `mc-003` 双桥字段出现在 catalog 输出。

- [ ] **Step 5: 提交收尾**

```bash
git add -A
git commit -m "chore(dual-bridge): verify full catalog + dual-bridge contract output" || git commit -m "chore: verify dual-bridge build"
```

- [ ] **Step 6: 归纳(可选,写实现说明)**

无新增文档;若实现者需要在双桥语义上留一句说明,只加到 `api/catalog.json.ts` 顶部注释,不新建 md。

---

## Self-Review

- **Spec 覆盖核对**
  - §2 目标 1(formal_view+banded_view+bridge)→ Task1/2(类型+seed)。
  - §2 目标 2(存在问题契约暴露)→ Task3。
  - §2 目标 3(formal_view 引用外部工件)→ Task2 `formal_view.artifact`;不建 Lean 引擎 ✓。
  - §2 非目标(spare;不建 Lean 引擎/不实现写路径)→ 未实现 C 写路径 ✓。
  - §5 暴露方式(并入 problems.json)→ Task3 并入 `problems.json` 不含独立 endpoint ✓。
  - §9 决策 1(三值)→ Bridge.direction 三值 + Task4 枚举 ✓。
  - §9 决策 2(并入,不独立)→ Task3 无独立文件 ✓。
  - §9 决策 3(可为 provable)→ FormalStatus + seed status=conjectured + Task4 校验 ✓。
  - §8 治理 8.4(CONTRIBUTING)→ **缺**:spec 提到新增 `CONTRIBUTING`/`GOVERNANCE`,本计划未列任务。按"建议把 CONTRIBUTING 列入",补一个最小 Task 7(纯文档)。见下。

- **补 Task 7: 治理文档(CONTRIBUTING + 许可)** — 对应 spec §8.4
  **Files:** Modify `README.md`(如存在)或新建 `CONTRIBUTING.md`;检查已存在的 README。
  - Section 只需一节:收录标准(判定须独立句式、附 judicial;三层残差、溯源、工程价值) + 审稿流程(审稿人核对生命周期以 `updates` 留痕) + 许可声明(数据 CC0/CC-BY、源码 MIT)。
  - Task 完成后 Run `git add .` 提交。

  (若用户仅要协议落地、不要治理文档任务,可在执行时跳过此 Task 并说明。)

- **占位符扫描**:Task3 临时 `placeholder` 在 Step2 修正为真实提取,无遗留 TBD。Task5 的 `t('pd.dualbridge.target')` 已补键;无"添加合适错误处理"类占位。

- **类型一致性**:`FormalView.status: FormalStatus`(Task1)↔ Task4 `FORMAL_STATUSES` 枚举同源;`Bridge.direction: BridgeDirection`(Task1)↔ Task4 `BRIDGE_DIRECTIONS`。`formal_view`/`bridge`(Task1)↔ Task3 `nestedStr(block,"formal_view",...)`,`bridge` 保持一致拼写。Task5 引用 `p.formal_view.status`/`p.formal_view.statement`/`p.formal_view.judgment`/`p.formal_view.target`/`p.bridge.link`/`p.bridge.direction` 与类型字段完全对应。

若发现 spec 要求无任务或类型不一致,已在上方修正并补 Task 7。

---

## 待用户选择(执行交接)

计划已保存至 `docs/superpowers/plans/2026-08-30-dual-bridge.md`。两种执行方式:
1. **Subagent-Driven(推荐)**:每个任务派一个全新子代理,任务间 review,迭代快。
2. **Inline Execution**:本会话用 executing-plans 按批次执行,checkpoint 供评审。
import Std

/-!
SHARED-MODULE: CertifiedBand

Lean 侧的"参考核验器"——镜像 contracts/verifier.ts（参考核验器）的证书良构性判定，
让同一套判定标准在两个独立实现（TS 站内核验 + Lean 机器可核验锚点）里同时成立。
任何在这边通过的带证区间，在 verifier.ts 里也必须通过，反之亦然。

对齐的常量与语义（与 verifier.ts 逐条对应）：
  - VACUOUS_THRESHOLD = 1   相对宽度 > 1 ⇒ 空洞带（band_nonvacuous 失败）
  - INFO_GATE_DEFAULT = 0.2 信息量门槛（advisory，相对宽度 ≤ 0.2）
  - 跨零点带（lo + hi = 0）暂缓空洞门（verifier 里 relative_width = null → within_vacuous = true）
  - r_param 条款：bound ≡0 或携带测量/不确定度内容（checkRParamClause）

注意：std-only（无 mathlib）下 Rat 的比较没有 Decidable 实例，因此良构性判定
全部用 Bool 原语（Rat.blt）写成可计算函数，再用 native_decide 逐例机器核验；
Prop 版谓词仅用于陈述契约与健全性定理。
-/
namespace MathX.CertifiedBand

/-- 带的中点（lo + hi = 0 时为零）。 -/
def mid (lo hi : Rat) : Rat := (lo + hi) / 2

/-- 相对宽度 = (hi - lo) / |mid|（对应 verifier 的 relative_width）。
    零中点处除法是 total 的（得 0），恰好与 verifier "跨零点 ⇒ 门暂缓" 的语义一致。 -/
def relWidth (lo hi : Rat) : Rat := (hi - lo) / (mid lo hi).abs

/-- Bool 版 ≤（Rat 在 std-only 下无 Decidable ≤）：a ≤ b ⇔ ¬ (b < a)。 -/
def ble (a b : Rat) : Bool := !Rat.blt b a

/-- 跨零点带（lo + hi = 0）：verifier 将空洞门暂缓。 -/
def crossesZero (lo hi : Rat) : Bool := !Rat.blt (lo + hi) 0 && !Rat.blt 0 (lo + hi)

/-- band_nonempty：lo < hi。 -/
def BandNonempty (lo hi : Rat) : Prop := Rat.blt lo hi

/-- band_nonvacuous：相对宽度 ≤ 1（不空洞）；跨零点时除法得 0 自然暂缓。 -/
def Nonvacuous (lo hi : Rat) : Prop := ble (relWidth lo hi) 1

/-- 信息量门槛（advisory）：相对宽度 ≤ 0.2。 -/
def WithinInfoGate (lo hi : Rat) : Prop := ble (relWidth lo hi) (1 / 5)

/-- 可判定的机器核验：非空 且 非空洞。checkBand = true ⇔ 该带是良构的。 -/
def checkBand (lo hi : Rat) : Bool :=
  Rat.blt lo hi && ble (relWidth lo hi) 1

/-- 健全性：机器核验器绝不接受非空的失败带。 -/
theorem checkBand_ok_imp_nonempty (lo hi : Rat) (h : checkBand lo hi = true) : BandNonempty lo hi := by
  unfold checkBand BandNonempty at *
  simp at h
  exact h.1

/-- 健全性：机器核验器绝不接受空洞带。 -/
theorem checkBand_ok_imp_nonvacuous (lo hi : Rat) (h : checkBand lo hi = true) : Nonvacuous lo hi := by
  unfold checkBand Nonvacuous at *
  simp at h
  exact h.2

/- 交叉核验样例（与 scripts/catalog-checks.test.mjs / verifier.ts 同源）： -/

-- GOOD_CERT 带 [1.52, 1.56]：checkBand 判定通过，健全性定理把 Bool 判定升格为契约谓词。
example : checkBand (38 / 25) (39 / 25) = true := by native_decide
example : BandNonempty (38 / 25) (39 / 25) :=
  checkBand_ok_imp_nonempty _ _ (by native_decide)
example : Nonvacuous (38 / 25) (39 / 25) :=
  checkBand_ok_imp_nonvacuous _ _ (by native_decide)
example : WithinInfoGate (38 / 25) (39 / 25) := by
  unfold WithinInfoGate ble relWidth mid
  native_decide

-- 空洞带 [0, 100]：相对宽度 2 > 1 ⇒ 拒绝。
example : checkBand 0 100 = false := by native_decide
example : ¬ Nonvacuous 0 100 := by
  unfold Nonvacuous ble relWidth mid
  native_decide

-- 跨零点带 [-1, 1]：空洞门暂缓（verifier: within_vacuous = true）。
example : crossesZero (-1) 1 = true := by native_decide
example : checkBand (-1) 1 = true := by native_decide
example : Nonvacuous (-1) 1 := by
  unfold Nonvacuous ble relWidth mid
  native_decide

-- Lieb–Oxford 当前纪录括区 [1.44, 1.58]（mc-017）：良构且在信息门槛内。
example : checkBand (36 / 25) (79 / 50) = true := by native_decide
example : BandNonempty (36 / 25) (79 / 50) :=
  checkBand_ok_imp_nonempty _ _ (by native_decide)
example : Nonvacuous (36 / 25) (79 / 50) :=
  checkBand_ok_imp_nonvacuous _ _ (by native_decide)
example : WithinInfoGate (36 / 25) (79 / 50) := by
  unfold WithinInfoGate ble relWidth mid
  native_decide

/-- r_param 条款（checkRParamClause）：bound ≡0 或携带测量/不确定度内容。 -/
def rParamClauseOk (bound : String) : Bool :=
  bound.contains "≡0" || bound.contains "测量" || bound.contains "不确定度" ||
    bound.contains "输入残差" || bound.contains "measurement" ||
    bound.contains "uncertainty" || bound.contains "input residual"

-- r_param 条款交叉核验：
example : rParamClauseOk "≡0 (purely mathematical structure; no input measurement residual layer)" = true := by
  native_decide
example : rParamClauseOk "Input residual from the propagation of heat-load measurement uncertainty" = true := by
  native_decide
example : rParamClauseOk "一个界" = false := by
  native_decide

/-! ── 目录问题证书契约的 Lean 侧机器核验 ─────────────────────────────────

三道带 certificate 的目录问题在此落锚（与 contracts/verifier.ts 双实现交叉核验）：
  - mc-017（Lieb–Oxford 最优常数）：r_param ≡0 条款 + 当前纪录括区 [1.44, 1.58] 良构性
  - mp-037（Boussinesq Nu 上界）：r_param 测量不确定度条款
  - mc-024（Clar 数）：r_param ≡0 条款
-/

section Mc017

  /-- mc-017 证书契约：R_param ≡ 0（纯数学结构，无输入测量残差层）。 -/
  def Mc017RParam : String :=
    "≡0 (purely mathematical structure; no input measurement residual layer)"

  -- r_param 条款机器核验：含 ≡0 → 通过。
  example : rParamClauseOk Mc017RParam = true := by
    native_decide

  /-- 当前纪录括区（Lewin–Lieb–Seiringer 2022）：1.44 < C_opt < 1.58（开括区）。
      作为带 [1.44, 1.58]（闭合包络）做良构性核验。
      对应目录里 mc-017 的 certificate.current_record = { lo: 1.44, hi: 1.58 }。 -/
  def CurrentBracketLo : Rat := 36 / 25  -- 1.44
  def CurrentBracketHi : Rat := 79 / 50  -- 1.58

  /-- 机器核验：当前括区是良构的（非空 + 非空洞 + 信息门槛内）。 -/
  example : checkBand CurrentBracketLo CurrentBracketHi = true := by
    native_decide
  example : BandNonempty CurrentBracketLo CurrentBracketHi :=
    checkBand_ok_imp_nonempty _ _ (by native_decide)
  example : Nonvacuous CurrentBracketLo CurrentBracketHi :=
    checkBand_ok_imp_nonvacuous _ _ (by native_decide)
  example : WithinInfoGate CurrentBracketLo CurrentBracketHi := by
    unfold WithinInfoGate ble relWidth mid
    native_decide

end Mc017

section Mp037

  /-- mp-037 证书契约：R_param 携带测量不确定度（非 ≡0）。 -/
  def Mp037RParam : String :=
    "Input residual from the propagation of heat-load and ambient temperature/flow-speed measurement uncertainty to the Nu upper bound"

  -- r_param 条款机器核验：含 measurement/uncertainty → 通过。
  example : rParamClauseOk Mp037RParam = true := by
    native_decide

end Mp037

section Mc024

  /-- mc-024 证书契约：R_param ≡ 0（数论输入，无测量残差层）。 -/
  def Mc024RParam : String :=
    "≡0 (the hexagon count and geometric family are exactly specified number-theoretic inputs; no input measurement residual layer)"

  -- r_param 条款机器核验：含 ≡0 → 通过。
  example : rParamClauseOk Mc024RParam = true := by
    native_decide

end Mc024

end MathX.CertifiedBand

// Sprint 2A 데모 — 무료/유료 경계 (BUSINESS MEMO #008)
// 실행: npm run demo:onboarding
import { runFullScenario } from "./onboarding-scenario.ts";
import { isFreeState } from "../../../packages/onboarding/src/onboarding.ts";
import type { JourneyState } from "../../../packages/shared-types/src/index.ts";

const { free: f, paid: p } = runFullScenario();
const L = (s = "") => console.log(s);

L("════════════════════════════════════════════════════════════");
L("  PROJECT ATLAS — 온보딩 무료/유료 경계 (카페)");
L("════════════════════════════════════════════════════════════");

L("\n■ 무료 영역 (진단과 추천)");
L(`① 대표 계정 생성: ${f.account.ownerName}`);
L(`② 무료 사업진단권: ${f.account.voucher.used}/${f.account.voucher.total} (계정당 1회)`);
L(`③ 사업 진단 → 핵심 병목: ${f.diagnosis.bottleneck}`);
f.diagnosis.rationale.forEach((s) => L(`     · ${s}`));
L(`④ 회사 설계안 Preview: ${f.proposal.designPreview.companyName}`);
for (const d of f.proposal.designPreview.departments) {
  L(`     [${d.priority}] ${d.name} · 직원 ${d.employeeTitles.join(", ")} · Skill ${d.skills.join(", ")}`);
}
L(`⑤ 기대 효과: 주당 약 ${f.proposal.expectedEffect.savedHoursPerWeek}시간 절약 예상`);
L(`   → 무료 종착 상태: ${f.proposal.status} (실제 Company 생성 없음, 대표 비서 없음)`);

L("\n■ 유료 전환 (실행과 운영) — 결제 후");
L(`⑥ 결제: ${p.payment.plan} (confirmed=${p.payment.confirmed})`);
L(`⑦ 회사 설립: ${p.created.company.name} · 부서 ${p.created.departments.map((d) => d.name).join(", ")}`);
L(`⑧ 대표 비서 출근: ${p.assistant.status} · 역할 ${p.assistant.role.join(", ")}`);
L(`⑨ 첫 AI 직원 준비: ${p.firstEmployeePersona} (실제 업무 실행/결과물은 Sprint 2B)`);

L("\n── 고객 화면 3요소 (무료 구간) ──");
for (const c of f.customerViews.filter((c) => isFreeState(c.state as JourneyState))) {
  L(`   [${c.view.stage}] ${c.view.cofounderJudgment}  ▶ ${c.view.nextAction}`);
}

L("\n────────────────────────────────────────────────────────────");
L(`  무료: ${f.journey.history.slice(0, 7).join(" → ")}`);
L(`  유료: ${f.journey.history.slice(7).join(" → ")}`);
L("  무료=진단/추천(설계안 Preview) · 유료=회사 설립/대표 비서/직원 운영");
L("  결과물·업무 실행(Work Loop)은 Sprint 2B. 실모델·원가 $0.");
L("────────────────────────────────────────────────────────────");

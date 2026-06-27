// Sprint 2A 데모 러너 — AI 공동창업자 온보딩 (CPO UX Sprint #001 IA 반영)
// 실행: npm run demo:onboarding
import { runOnboardingScenario } from "./onboarding-scenario.ts";
import { STAGE_LABEL } from "../../../packages/shared-types/src/index.ts";

const r = runOnboardingScenario();
const L = (s = "") => console.log(s);

L("════════════════════════════════════════════════════════════");
L("  PROJECT ATLAS — Sprint 2A: AI 공동창업자 온보딩 (카페)");
L("════════════════════════════════════════════════════════════");

L("\n① 대표 계정 생성 (회원가입 아님)");
L(`   대표: ${r.account.ownerName} · 계정 ${r.account.id}`);
L("\n② 무료 사업진단권");
L(`   활성화 ${r.account.voucher.active} · 사용 ${r.account.voucher.used}/${r.account.voucher.total} (계정당 1회)`);

L("\n③ 무료 AI 컨설팅 → 사업 진단");
L(`   회사: ${r.response.companyName} · ${r.response.industry} · ${STAGE_LABEL[r.response.stage]}`);
L(`   시간소모="${r.response.timeSink}" · 문제="${r.response.problem}" · 성장="${r.response.grow}"`);

L("\n④ 공동창업자의 판단 (점수 아닌 우선순위 판단)");
L(`   ${r.diagnosis.bottleneck}`);
r.diagnosis.rationale.forEach((s) => L(`   · ${s}`));

L("\n⑤ AI 회사 설계안 → 추천 Department / Employee / Skill");
for (const d of r.recommendation.departments) {
  L(`   [${d.priority}] ${d.name}`);
  for (const e of d.seedEmployees) L(`        └ ${e.title}(${e.role}) · ${e.recommendedSkills.join(", ")}`);
}

L("\n⑥ 대표 승인 (회사 설립 승인)");
L(`   CTA "이 설계안으로 내 회사 만들기" → ${r.approval.status}`);

L("\n⑦ Company 생성 완료");
L(`   ${r.created.company.name} · 부서 ${r.created.departments.map((d) => d.name).join(", ")} · 직원 ${r.created.employees.length} · 트리 ${r.created.tree.length}`);

L("\n⑧ 첫 업무 추천");
L(`   CTA "${r.firstTask.label}" → ${r.firstTask.description}`);

L("\n── 고객 화면 항상-노출 3요소 (현재 단계 / 공동창업자의 판단 / 대표의 다음 행동) ──");
for (const { view } of r.customerViews) {
  L(`   [${view.stage}] ${view.cofounderJudgment}  ▶ ${view.nextAction}`);
}

L("\n────────────────────────────────────────────────────────────");
L(`  Journey: ${r.journey.history.join(" → ")}`);
L("  대표는 '계정 생성·진단권 활성화·컨설팅 응답·회사 설립 승인'만 했고,");
L("  AI 공동창업자가 진단·설계·생성했다. (원가 $0 / 내부지표 숨김 / 운영루프는 2B)");
L("────────────────────────────────────────────────────────────");

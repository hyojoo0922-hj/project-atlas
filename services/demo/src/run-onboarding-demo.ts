// Sprint 2A 데모 러너 — AI 공동창업자 온보딩 내러티브
// 실행: npm run demo:onboarding
import { runOnboardingScenario } from "./onboarding-scenario.ts";
import { STAGE_LABEL } from "../../../packages/shared-types/src/index.ts";

const r = runOnboardingScenario();
const L = (s = "") => console.log(s);

L("════════════════════════════════════════════════════════════");
L("  PROJECT ATLAS — Sprint 2A: AI 공동창업자 온보딩 (카페)");
L("════════════════════════════════════════════════════════════");

L("\n① 무료 AI 컨설팅 (회원가입 아님)");
L(`   회사: ${r.response.companyName} · 업종 ${r.response.industry} · 단계 ${STAGE_LABEL[r.response.stage]}`);
L(`   직원 ${r.response.employees} · 온라인 ${r.response.online} · 브랜드 ${r.response.brand}`);
L(`   시간소모="${r.response.timeSink}" · 문제="${r.response.problem}" · 성장="${r.response.grow}"`);

L("\n② 사업 진단 (회사보다 사업을 먼저)");
r.diagnosis.priorities.forEach((p, i) => L(`   ${i + 1}. ${p.focus} (${p.score}) — ${p.reason}`));

L("\n③ 핵심 병목 판단");
L(`   ${r.diagnosis.bottleneck}`);
r.diagnosis.rationale.forEach((s) => L(`   · ${s}`));

L("\n④ AI 회사 설계안 제안 (대표는 승인만)");
L(`   회사명: ${r.draft.company.name} · 목표: ${r.draft.company.goal}`);
L(`   CEO: 위임 ${r.draft.ceo.decisionStyle.delegation} · 리스크 ${r.draft.ceo.riskAppetite} · 브랜드우선 ${r.draft.ceo.brandPriority.join(",")}`);

L("\n⑤ 추천 Department → Employee → Skill");
for (const d of r.recommendation.departments) {
  L(`   [${d.priority}] ${d.name} — ${d.mandate}`);
  for (const e of d.seedEmployees) {
    L(`        └ ${e.title}(${e.role}, ${e.roleFamily}) · 추천 Skill: ${e.recommendedSkills.join(", ")}`);
  }
}

L("\n⑥ 대표 승인");
L(`   승인 요청(${r.approval.kind}) → status=${r.approval.status}`);

L("\n⑦ Company 생성 완료");
const c = r.created;
L(`   Company: ${c.company.name} (${c.company.industry}, ${STAGE_LABEL[c.company.stage]})`);
L(`   CEO: ${c.ceo.id} · Departments: ${c.departments.map((d) => d.name).join(", ")}`);
L(`   Employees: ${c.employees.map((e) => e.dna.phenotype.persona).join(", ")}`);
L(`   조직 트리 노드: ${c.tree.length}개 (company/ceo/department/employee)`);

L("\n────────────────────────────────────────────────────────────");
L(`  Journey: ${r.journey.history.join(" → ")}`);
L("  증명: 고객은 '컨설팅 응답 + 대표 승인'만 했고, AI가 사업을 진단해");
L("  회사를 설계·생성했다. (원가 $0 / 실모델·로그인·결제 없음 / 운영루프는 2B)");
L("────────────────────────────────────────────────────────────");

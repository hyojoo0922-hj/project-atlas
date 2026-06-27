// Sprint 2A 온보딩 화면/상태 스냅샷 (CPO UX 설계용)
// Customer(4스텝 단순) / Operator(생성된 조직 전체) 두 관점.
import { STAGE_LABEL } from "../../../packages/shared-types/src/index.ts";
import type { OnboardingResult } from "../../onboarding/src/onboarding-flow.ts";

const esc = (s: unknown): string => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
const page = (title: string, body: string): string =>
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font:14px/1.6 system-ui,sans-serif;margin:0;background:#0f1115;color:#e6e8eb}
.wrap{max-width:920px;margin:0 auto;padding:24px}h1{font-size:20px}h2{font-size:14px;color:#9aa4b2;margin-top:24px;text-transform:uppercase;letter-spacing:.05em}
.card{background:#171a21;border:1px solid #232833;border-radius:10px;padding:14px 16px;margin:10px 0}
.kv{color:#9aa4b2}.tag{display:inline-block;background:#1f2530;border-radius:6px;padding:1px 8px;margin:2px;font-size:12px}
.ok{color:#5bd6a0}.muted{color:#6b7280}.step{display:flex;gap:8px;align-items:center;margin:4px 0}
.dot{width:8px;height:8px;border-radius:50%;background:#5bd6a0;display:inline-block}
.note{background:#13251f;border:1px solid #1d3a30;border-radius:8px;padding:10px 14px;color:#9fe3c4;font-size:13px}</style>
</head><body><div class="wrap">${body}</div></body></html>`;

/** 고객 관점 — 4스텝 단순 (컨설팅→진단→설계안→승인). 진단 규칙 비노출. */
export function renderOnboardingCustomer(r: OnboardingResult): string {
  const depts = r.recommendation.departments.map((d) =>
    `<div class="card"><b>${esc(d.name)}</b> <span class="muted">${esc(d.mandate)}</span><br>
     ${d.seedEmployees.map((e) => `<span class="tag">${esc(e.title)}</span>`).join("")}</div>`).join("");
  const body = `
  <h1>👋 ${esc(r.response.companyName)} · AI 공동창업자</h1>
  <div class="note">고객은 설계하지 않습니다. 답하고 → 진단/설계안을 보고 → 승인합니다.</div>

  <h2>STEP 1 · 무료 AI 컨설팅</h2>
  <div class="card kv">업종 ${esc(r.response.industry)} · 단계 ${STAGE_LABEL[r.response.stage]} · 직원 ${r.response.employees}
   · 문제 "${esc(r.response.problem)}" · 성장 "${esc(r.response.grow)}"</div>

  <h2>STEP 2 · AI 사업 진단</h2>
  <div class="card"><b>${esc(r.diagnosis.bottleneck)}</b><br>${r.diagnosis.rationale.map(esc).join("<br>")}</div>

  <h2>STEP 3 · AI가 설계한 회사 (제안)</h2>
  ${depts}

  <h2>STEP 4 · 대표 승인</h2>
  <div class="card">승인 시 회사가 생성됩니다 · 현재: <span class="ok">${esc(r.approval.status)}</span> →
   <b class="ok">${esc(r.created.company.name)} 생성 완료</b></div>`;
  return page("Atlas · Onboarding (Customer)", body);
}

/** 운영자 관점 — Journey 상태 + 진단/추천/생성된 조직 전체. */
export function renderOnboardingOperator(r: OnboardingResult): string {
  const steps = r.journey.history.map((s) => `<div class="step"><span class="dot"></span>${esc(s)}</div>`).join("");
  const audit = r.audit.map((a) => `<div class="kv">• <b>${esc(a.step)}</b> — ${esc(a.detail)}</div>`).join("");
  const tree = r.created.tree.map((n) => `${esc(n.kind)}`).join(" · ");
  const emps = r.created.employees.map((e) =>
    `<span class="tag">${esc(e.dna.phenotype.persona)} (${esc(e.dna.genome.roleFamily)}, ${esc(e.rank)})</span>`).join("");
  const body = `
  <h1>🛠️ Operator HQ · Onboarding</h1>
  <div class="note">운영자는 Journey 상태·진단·추천·생성 결과를 본다. (2B: Health/Growth/재추천 추가 예정)</div>

  <h2>Customer Journey 상태머신</h2>
  <div class="card">${steps}</div>

  <h2>AI Business Diagnosis</h2>
  <div class="card">${r.diagnosis.priorities.map((p) => `<div>${esc(p.focus)} <b>${p.score}</b> — <span class="kv">${esc(p.reason)}</span></div>`).join("")}</div>

  <h2>설계안 → 생성된 조직</h2>
  <div class="card"><b>${esc(r.created.company.name)}</b> (${esc(r.created.company.industry)}, ${STAGE_LABEL[r.created.company.stage]})
   · CEO 위임 ${esc(r.draft.ceo.decisionStyle.delegation)}/리스크 ${esc(r.draft.ceo.riskAppetite)}<br>
   부서: ${r.created.departments.map((d) => `<span class="tag">${d.priority}.${esc(d.name)}</span>`).join("")}<br>
   직원: ${emps}<br>
   <span class="kv">조직 트리: ${tree}</span></div>

  <h2>Audit</h2>
  <div class="card">${audit}</div>`;
  return page("Atlas · Onboarding (Operator)", body);
}

// Sprint 2A 온보딩 화면/상태 스냅샷 (CPO UX Sprint #001 IA 반영)
// Customer: 대표 계정→진단권→진단→설계안→설립 승인→생성→첫 업무. 내부지표 숨김.
// Operator: 내부 구조 포함(진단 점수·트리·Audit).
import { STAGE_LABEL } from "../../../packages/shared-types/src/index.ts";
import type { OnboardingResult } from "../../onboarding/src/onboarding-flow.ts";

const esc = (s: unknown): string => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
const page = (title: string, body: string): string =>
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font:14px/1.6 system-ui,sans-serif;margin:0;background:#0f1115;color:#e6e8eb}
.wrap{max-width:880px;margin:0 auto;padding:24px}h1{font-size:20px}h2{font-size:13px;color:#9aa4b2;margin-top:22px;text-transform:uppercase;letter-spacing:.05em}
.card{background:#171a21;border:1px solid #232833;border-radius:12px;padding:16px;margin:10px 0}
.kv{color:#9aa4b2}.tag{display:inline-block;background:#1f2530;border-radius:6px;padding:1px 8px;margin:2px;font-size:12px}
.ok{color:#5bd6a0}.muted{color:#6b7280}
.cta{display:inline-block;background:#5bd6a0;color:#0f1115;font-weight:700;border-radius:8px;padding:8px 14px;margin-top:8px}
.three{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.three .b{background:#13182088;border:1px solid #232833;border-radius:10px;padding:10px}
.lbl{font-size:11px;color:#6b7280;text-transform:uppercase}
.step{display:flex;gap:8px;align-items:center;margin:4px 0}.dot{width:8px;height:8px;border-radius:50%;background:#5bd6a0;display:inline-block}
.note{background:#13251f;border:1px solid #1d3a30;border-radius:8px;padding:10px 14px;color:#9fe3c4;font-size:13px}
.voucher{background:#241f13;border:1px solid #3a3320;border-radius:10px;padding:10px 14px;color:#e3cf9f}</style>
</head><body><div class="wrap">${body}</div></body></html>`;

/** 고객 관점 — 항상 3요소(현재 단계/공동창업자의 판단/대표의 다음 행동) + 진단권 + CTA. 내부지표 숨김. */
export function renderOnboardingCustomer(r: OnboardingResult): string {
  // 항상-노출 3요소: 현재(첫 업무) 시점 뷰
  const now = r.customerViews[r.customerViews.length - 1]!.view;

  const journeyBar = r.customerViews.map((c) =>
    `<div class="step"><span class="dot"></span>${esc(c.view.stage)}</div>`).join("");

  // 설계안(고객용): 부서/직원만 — Skill 라이프사이클/점수/인증/모델/토큰/원가는 숨김
  const design = r.recommendation.departments.map((d) =>
    `<div class="card"><b>${esc(d.name)}</b> <span class="muted">${esc(d.mandate)}</span><br>
     ${d.seedEmployees.map((e) => `<span class="tag">${esc(e.title)} · ${esc(e.role)}</span>`).join("")}</div>`).join("");

  const body = `
  <h1>👋 ${esc(r.account.ownerName)} · AI 공동창업자</h1>
  <div class="note">대표님은 설계하지 않습니다. 진단을 받고, 설계안을 보고, 회사 설립을 승인합니다.</div>

  <div class="voucher">🎟️ 무료 사업진단권 ${r.account.voucher.used}/${r.account.voucher.total} 사용 · 계정당 1회 제공</div>

  <h2>지금 (항상 보이는 3요소)</h2>
  <div class="three">
    <div class="b"><div class="lbl">현재 단계</div><b>${esc(now.stage)}</b></div>
    <div class="b"><div class="lbl">공동창업자의 판단</div>${esc(now.cofounderJudgment)}</div>
    <div class="b"><div class="lbl">대표의 다음 행동</div><span class="ok">${esc(now.nextAction)}</span></div>
  </div>

  <h2>진단 — 공동창업자의 판단 (점수 아님)</h2>
  <div class="card">${r.diagnosis.rationale.map(esc).join("<br>")}</div>

  <h2>AI가 설계한 회사 (제안)</h2>
  ${design}
  <div><span class="cta">이 설계안으로 내 회사 만들기</span></div>

  <h2>회사 생성 완료 → 첫 업무</h2>
  <div class="card"><b class="ok">${esc(r.created.company.name)}</b> 가 만들어졌습니다.<br>
   ${esc(r.firstTask.description)}<br><span class="cta">${esc(r.firstTask.label)}</span></div>

  <h2>계속</h2>
  <div class="kv">더 운영하려면 → <span class="tag">계속 회사 운영하기</span> (플랜/크레딧)</div>

  <h2>여정</h2>
  <div class="card">${journeyBar}</div>`;
  return page("Atlas · Onboarding (Customer)", body);
}

/** 운영자 관점 — 내부 구조 포함(진단 점수·트리·Audit). */
export function renderOnboardingOperator(r: OnboardingResult): string {
  const steps = r.journey.history.map((s) => `<div class="step"><span class="dot"></span>${esc(s)}</div>`).join("");
  const audit = r.audit.map((a) => `<div class="kv">• <b>${esc(a.step)}</b> — ${esc(a.detail)}</div>`).join("");
  const tree = r.created.tree.map((n) => esc(n.kind)).join(" · ");
  const emps = r.created.employees.map((e) =>
    `<span class="tag">${esc(e.dna.phenotype.persona)} (${esc(e.dna.genome.roleFamily)}, ${esc(e.rank)})</span>`).join("");
  const body = `
  <h1>🛠️ Operator HQ · Onboarding</h1>
  <div class="note">운영자는 내부 구조(진단 점수·트리·Audit)를 본다. (2B: Health/Growth/재추천 추가 예정)</div>

  <h2>대표 계정 / 진단권</h2>
  <div class="card kv">${esc(r.account.ownerName)} · voucher ${r.account.voucher.used}/${r.account.voucher.total} (active ${r.account.voucher.active})</div>

  <h2>Customer Journey 상태머신</h2>
  <div class="card">${steps}</div>

  <h2>AI Business Diagnosis (점수 — 내부)</h2>
  <div class="card">${r.diagnosis.priorities.map((p) => `<div>${esc(p.focus)} <b>${p.score}</b> — <span class="kv">${esc(p.reason)}</span></div>`).join("")}</div>

  <h2>설계안 → 생성된 조직</h2>
  <div class="card"><b>${esc(r.created.company.name)}</b> (${esc(r.created.company.industry)}, ${STAGE_LABEL[r.created.company.stage]})
   · CEO 위임 ${esc(r.draft.ceo.decisionStyle.delegation)}/리스크 ${esc(r.draft.ceo.riskAppetite)}<br>
   부서: ${r.created.departments.map((d) => `<span class="tag">${d.priority}.${esc(d.name)}</span>`).join("")}<br>
   직원: ${emps}<br><span class="kv">트리: ${tree}</span></div>

  <h2>첫 업무 추천</h2>
  <div class="card kv">${esc(r.firstTask.description)}</div>

  <h2>Audit</h2>
  <div class="card">${audit}</div>`;
  return page("Atlas · Onboarding (Operator)", body);
}

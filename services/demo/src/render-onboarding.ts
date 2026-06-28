// 온보딩 스냅샷 (CPO UX #001 + BUSINESS MEMO #008 무료/유료 경계)
// Customer: 무료 영역(설계안 Preview + 기대효과 + 무료/유료 CTA). "생성 완료" 문구 금지.
// Operator: 무료+유료 전체(진단 점수·트리·결제·대표 비서·Audit).
import { STAGE_LABEL } from "../../../packages/shared-types/src/index.ts";
import type { OnboardingFreeResult } from "../../onboarding/src/onboarding-flow.ts";
import type { ScenarioResult } from "./onboarding-scenario.ts";

const esc = (s: unknown): string => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
const page = (title: string, body: string): string =>
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font:14px/1.6 system-ui,sans-serif;margin:0;background:#0f1115;color:#e6e8eb}
.wrap{max-width:880px;margin:0 auto;padding:24px}h1{font-size:20px}h2{font-size:13px;color:#9aa4b2;margin-top:22px;text-transform:uppercase;letter-spacing:.05em}
.card{background:#171a21;border:1px solid #232833;border-radius:12px;padding:16px;margin:10px 0}
.kv{color:#9aa4b2}.tag{display:inline-block;background:#1f2530;border-radius:6px;padding:1px 8px;margin:2px;font-size:12px}
.ok{color:#5bd6a0}.muted{color:#6b7280}
.cta{display:inline-block;background:#5bd6a0;color:#0f1115;font-weight:700;border-radius:8px;padding:8px 14px;margin:6px 6px 0 0}
.cta2{display:inline-block;background:#1f2530;color:#cfd6df;border:1px solid #2c3340;border-radius:8px;padding:8px 14px;margin:6px 6px 0 0}
.three{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.three .b{background:#13182088;border:1px solid #232833;border-radius:10px;padding:10px}
.lbl{font-size:11px;color:#6b7280;text-transform:uppercase}
.step{display:flex;gap:8px;align-items:center;margin:4px 0}.dot{width:8px;height:8px;border-radius:50%;background:#5bd6a0;display:inline-block}
.dotp{background:#e3cf9f}
.note{background:#13251f;border:1px solid #1d3a30;border-radius:8px;padding:10px 14px;color:#9fe3c4;font-size:13px}
.voucher{background:#241f13;border:1px solid #3a3320;border-radius:10px;padding:10px 14px;color:#e3cf9f}
.pay{background:#1a1530;border:1px solid #2c2350;border-radius:10px;padding:10px 14px;color:#c9b8ff}</style>
</head><body><div class="wrap">${body}</div></body></html>`;

/** 고객(무료 영역) — 설계안 Preview + 기대효과 + 무료/유료 CTA. 내부지표·"생성 완료" 숨김. */
export function renderOnboardingCustomer(f: OnboardingFreeResult): string {
  const now = f.customerViews[f.customerViews.length - 1]!.view; // proposal_ready 시점
  const journeyBar = f.customerViews.map((c) =>
    `<div class="step"><span class="dot"></span>${esc(c.view.stage)}</div>`).join("");

  const design = f.proposal.designPreview.departments.map((d) =>
    `<div class="card"><b>${d.priority}. ${esc(d.name)}</b><br>
     ${d.employeeTitles.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`).join("");

  const body = `
  <h1>👋 ${esc(f.account.ownerName)} · AI 공동창업자 <span class="muted">(무료 진단)</span></h1>
  <div class="note">무료에서는 <b>진단과 추천</b>까지 제공합니다. 실제 운영(직원 업무·결과물·대표 비서)은 회사 설립 후 시작됩니다.</div>

  <div class="voucher">🎟️ 무료 사업진단권 ${f.account.voucher.used}/${f.account.voucher.total} 사용 · 계정당 1회</div>

  <h2>지금 (항상 보이는 3요소)</h2>
  <div class="three">
    <div class="b"><div class="lbl">현재 단계</div><b>${esc(now.stage)}</b></div>
    <div class="b"><div class="lbl">공동창업자의 판단</div>${esc(now.cofounderJudgment)}</div>
    <div class="b"><div class="lbl">대표의 다음 행동</div><span class="ok">${esc(now.nextAction)}</span></div>
  </div>

  <h2>진단 — 공동창업자의 판단 (점수 아님)</h2>
  <div class="card">${f.diagnosis.rationale.map(esc).join("<br>")}</div>

  <h2>기대 효과 (예상)</h2>
  <div class="card">⏱️ 주당 약 <b>${f.proposal.expectedEffect.savedHoursPerWeek}시간</b> 절약 예상
   <div class="kv">${f.proposal.expectedEffect.summary.slice(1).map(esc).join(" · ")}</div></div>

  <h2>회사 설계안 (Preview)</h2>
  ${design}

  <h2>다음</h2>
  <div>
    <span class="cta2">회사 설계안 보기</span><span class="cta2">필요한 직원 확인하기</span>
    <span class="cta">이 설계안으로 회사 설립하기</span>
  </div>
  <div class="kv" style="margin-top:6px">※ 회사 설립(유료)부터 대표 비서 출근·직원 업무·결과물 생성이 시작됩니다.</div>

  <h2>여정 (무료 구간)</h2>
  <div class="card">${journeyBar}</div>`;
  return page("Atlas · Onboarding (Customer · 무료)", body);
}

/** 운영자 — 무료+유료 전체. 내부 구조 노출. */
export function renderOnboardingOperator(s: ScenarioResult): string {
  const f = s.free, p = s.paid;
  const steps = f.journey.history.map((st) => {
    const paidState = !["account_created", "voucher_activated", "diagnosing", "designing", "recommending", "reviewing", "proposal_ready"].includes(st);
    return `<div class="step"><span class="dot ${paidState ? "dotp" : ""}"></span>${esc(st)} ${paidState ? '<span class="kv">(유료)</span>' : '<span class="kv">(무료)</span>'}</div>`;
  }).join("");
  const audit = f.audit.map((a) => `<div class="kv">• <b>${esc(a.step)}</b> — ${esc(a.detail)}</div>`).join("");
  const emps = p.created.employees.map((e) =>
    `<span class="tag">${esc(e.dna.phenotype.persona)} (${esc(e.dna.genome.roleFamily)})</span>`).join("");
  const body = `
  <h1>🛠️ Operator HQ · Onboarding (무료/유료 경계)</h1>
  <div class="note">무료=진단·추천(proposal_ready) / 유료=설립·운영. 내부지표는 운영자 화면에만.</div>

  <h2>대표 계정 / 진단권</h2>
  <div class="card kv">${esc(f.account.ownerName)} · voucher ${f.account.voucher.used}/${f.account.voucher.total}</div>

  <h2>Customer Journey (무료→유료)</h2>
  <div class="card">${steps}</div>

  <h2>AI Business Diagnosis (점수 — 내부)</h2>
  <div class="card">${f.diagnosis.priorities.map((x) => `<div>${esc(x.focus)} <b>${x.score}</b> — <span class="kv">${esc(x.reason)}</span></div>`).join("")}</div>

  <h2>무료 산출 — Company Proposal</h2>
  <div class="card">기대효과 주당 ${f.proposal.expectedEffect.savedHoursPerWeek}h · 부서 ${f.proposal.designPreview.departments.map((d) => esc(d.name)).join(", ")} <span class="kv">(실제 Company 아직 없음)</span></div>

  <h2>유료 전환 — 결제 → 설립</h2>
  <div class="pay">💳 ${esc(p.payment.plan)} · confirmed ${p.payment.confirmed}</div>
  <div class="card"><b>${esc(p.created.company.name)}</b> 설립 · 부서 ${p.created.departments.map((d) => `<span class="tag">${d.priority}.${esc(d.name)}</span>`).join("")}<br>
   직원: ${emps}<br>🧑‍💼 대표 비서: ${esc(p.assistant.status)} (${p.assistant.role.length} roles) · 첫 직원: ${esc(p.firstEmployeePersona)}</div>

  <h2>Audit (무료)</h2>
  <div class="card">${audit}</div>`;
  return page("Atlas · Onboarding (Operator)", body);
}

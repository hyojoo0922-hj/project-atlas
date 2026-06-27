// 렌더 헬퍼 + 정적 HTML 스냅샷 생성기
// 목적: Operator HQ(복잡)와 Customer(단순)의 '개념적 분리'와 '화면 구조'를 코드로 남김.
// UI 완성도는 목표 아님 — Sprint 2에서 Codex가 이 구조로 UX를 설계한다.
import type { Id } from "../../../packages/shared-types/src/index.ts";
import type { Orchestrator } from "../../orchestrator/src/orchestrator.ts";
import type { ScenarioResult } from "./scenario.ts";

export function skillName(o: Orchestrator, skillVersionId: Id): string {
  const sv = o.skills.getVersion(skillVersionId);
  if (!sv) return skillVersionId;
  return o.skills.getSkill(sv.skillId)?.name ?? skillVersionId;
}

const esc = (s: unknown): string => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
const page = (title: string, body: string): string =>
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font:14px/1.6 system-ui,sans-serif;margin:0;background:#0f1115;color:#e6e8eb}
.wrap{max-width:920px;margin:0 auto;padding:24px}h1{font-size:20px}h2{font-size:15px;color:#9aa4b2;margin-top:28px;text-transform:uppercase;letter-spacing:.05em}
.card{background:#171a21;border:1px solid #232833;border-radius:10px;padding:14px 16px;margin:10px 0}
.kv{color:#9aa4b2}.tag{display:inline-block;background:#1f2530;border-radius:6px;padding:1px 8px;margin:2px;font-size:12px}
.ok{color:#5bd6a0}.muted{color:#6b7280}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:6px 8px;border-bottom:1px solid #232833}
.note{background:#13251f;border:1px solid #1d3a30;border-radius:8px;padding:10px 14px;color:#9fe3c4;font-size:13px}</style>
</head><body><div class="wrap">${body}</div></body></html>`;

/** Operator HQ — 복잡성 수용: 직원 DNA·Skill 라이프사이클·적합도(사유)·인증·Cost/ROI */
export function renderOperatorHQ(o: Orchestrator, r: ScenarioResult): string {
  const e = o.employees.get(r.writer.id)!;
  const sum = o.gateway.summary();
  const lifecycleRows = o.skills.allVersions().map((sv) =>
    `<tr><td>${esc(skillName(o, sv.id))}</td><td><span class="tag">${sv.lifecycleState}</span></td><td>ROI ${sv.roi.roiScore} (${sv.roi.status})</td></tr>`).join("");
  const reco = o.recommendSkills(e.id).map((f) =>
    `<div class="card"><b>${esc(skillName(o, f.skillVersionId))}</b> — 적합도 <b class="ok">${f.score}</b>
     <div class="kv">${esc(f.reasons.join(" · "))}</div>
     <div class="muted">breakdown: ${Object.entries(f.breakdown).map(([k, v]) => `${k} ${(+v).toFixed(2)}`).join(", ")}</div></div>`).join("");
  const certs = e.certifications.map((id) => { const c = o.employees.getCert(id)!; return `<span class="tag">${esc(skillName(o, c.skillVersionId))}: ${c.status}</span>`; }).join("");

  const body = `
  <h1>🛠️ Operator HQ <span class="muted">— 운영자: Skill·교육·인증·성과·원가 운영</span></h1>
  <div class="note">운영자는 직원을 일일이 지시하지 않는다. Skill Library·Training·Certification·Skill Update·Employee Upgrade를 운영한다.</div>

  <h2>직원 (Employee) — 중심 객체</h2>
  <div class="card"><b>${esc(e.dna.phenotype.persona)}</b>
    <div class="kv">DNA.genome(불변): ${esc(e.dna.genome.archetype)}/${esc(e.dna.genome.roleFamily)}</div>
    <div>traits: ${e.dna.acquired.traits.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    <div>인증: ${certs || '<span class="muted">없음</span>'}</div>
    <div class="kv">trackRecord: ${esc(JSON.stringify(e.matchingProfile.trackRecord))} · lineage ${e.dna.lineage.length}단계</div>
  </div>

  <h2>Skill 라이프사이클 (자산, 10단계)</h2>
  <table><tr><th>Skill</th><th>상태</th><th>ROI</th></tr>${lifecycleRows}</table>

  <h2>Matching 추천 (직원별 적합도 + 사유)</h2>
  ${reco}

  <h2>Usage / Cost / ROI</h2>
  <div class="card">호출 <b>${sum.calls}</b>건 · 총비용 <b>$${sum.cost}</b> (mock) · 누적 ROI <b>${sum.roi}</b>
   · tokens ${sum.tokensIn}/${sum.tokensOut}</div>`;
  return page("Atlas · Operator HQ", body);
}

/** Customer Experience — 단순: 직원 채용·업무 위임·결과·크레딧. Skill OS 복잡성 비노출. */
export function renderCustomer(o: Orchestrator, r: ScenarioResult): string {
  const e = o.employees.get(r.writer.id)!;
  const run = r.work.run;
  const body = `
  <h1>👋 ${esc(r.customer.name)} 워크스페이스 <span class="muted">— 고객: 직원을 채용하고 일을 맡긴다</span></h1>
  <div class="note">고객은 Skill·라이프사이클·토큰·모델을 몰라도 된다. 직원에게 일을 맡기면 결과가 온다.</div>

  <h2>나의 AI 직원</h2>
  <div class="card"><b>${esc(e.dna.phenotype.persona)}</b> <span class="tag ok">근무 중</span>
    <div class="kv">${esc(e.dna.phenotype.tone)} 톤 · ${esc(e.dna.phenotype.locale)}</div>
  </div>

  <h2>맡긴 업무</h2>
  <div class="card"><b>${esc(r.work.task.intent)}</b> <span class="tag ok">완료</span>
    <div class="kv">결과:</div><div>${esc(run.output)}</div>
  </div>

  <h2>크레딧</h2>
  <div class="card">이번 달 사용 <b>$0.00</b> <span class="muted">(미리보기 — 결제 미연동)</span></div>`;
  return page("Atlas · Customer", body);
}

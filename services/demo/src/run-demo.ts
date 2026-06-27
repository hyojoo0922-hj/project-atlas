// Sprint 1 데모 러너 — Employee 중심 내러티브로 핵심 흐름을 출력
// 실행: npm run demo   (또는 node services/demo/src/run-demo.ts)
import { runScenario } from "./scenario.ts";
import { skillName } from "./render.ts";

const r = runScenario();
const o = r.orch;
const L = (s = "") => console.log(s);
const fmt = (f: { skillVersionId: string; score: number }) => `${skillName(o, f.skillVersionId)}(적합도 ${f.score})`;

L("════════════════════════════════════════════════════════════");
L("  PROJECT ATLAS — Sprint 1 데모: 'AI 직원의 입사→성장' 경험");
L("════════════════════════════════════════════════════════════");

L("\n① 고객 회사 생성");
L(`   고객사: ${r.customer.name} (요금제 ${r.customer.plan}) / 브랜드: ${r.brand.name}`);

L("\n② Brand Memory 입력 (회사의 기억 — 직원이 바뀌어도 남음)");
for (const m of o.memory.all(r.brand.id)) L(`   · [${m.kind}] ${m.key} = ${String(m.value)} (v${m.version})`);

L("\n③ Writer Employee 확인 (직원 = 독립 객체)");
const dna = r.writer.dna;
L(`   직원: ${dna.phenotype.persona}  | DNA.genome(불변): ${dna.genome.archetype}/${dna.genome.roleFamily}`);
L(`   acquired.traits: [${dna.acquired.traits.join(", ")}]  | memoryScope: [${r.writer.memoryScope.join(", ")}]`);

L("\n④ Skill 적합도 추천 (초기) — 직원별, 임계 0.70 미만 제외");
r.recoInitial.forEach((f) => L(`   ▶ ${fmt(f)}  사유: ${f.reasons.join(" / ")}`));
L(`   (이 시점엔 ${r.recoInitial.length}개만 추천됨)`);

L("\n⑤ 교육(AI University) → ⑥ 시험 → ⑦ 인증(Certification System)");
const cert = o.employees.getCert(r.writer.certifications[0]!)!;
L(`   교육 수료 → 시험 ${cert.evidenceTestScore} 합격 → 인증 발급(status=${cert.status}, scope=${cert.scope.join(",")})`);

L("\n⑧ 배치 (Deployment) — 미인증이면 차단됨");
const asn = o.getAssignments(r.writer.id)[0]!;
L(`   ${skillName(o, asn.skillVersionId)} 배치 완료 (certified=${asn.certified}, fit=${asn.fitScore})`);

L("\n⑨~⑫ 업무 요청 → mock 결과 → Usage / Cost / ROI 기록");
L(`   업무: "${r.work.task.intent}"`);
L(`   결과(mock): ${r.work.run.output}`);
const sum = o.gateway.summary();
const ledger = o.gateway.getLedger()[0]!;
L(`   Ledger: provider=${ledger.provider} model=${ledger.model} tokens=${ledger.tokensIn}/${ledger.tokensOut} cost=$${ledger.cost} ROI=${ledger.roiDelivered}`);
L(`   집계: 호출 ${sum.calls}건 / 총비용 $${sum.cost} / 누적ROI ${sum.roi}`);

L("\n⑬ 성과가 Matching Profile에 반영 → 다음 추천이 '달라짐'");
L(`   trackRecord(content) = ${o.employees.get(r.writer.id)!.matchingProfile.trackRecord["content"]}`);
L(`   이전 추천: [${r.recoInitial.map(fmt).join(", ")}]`);
L(`   이후 추천: [${r.recoAfter.map(fmt).join(", ")}]`);
const newly = r.recoAfter.filter((a) => !r.recoInitial.some((b) => b.skillVersionId === a.skillVersionId));
L(`   ✅ 새로 추천된 Skill: [${newly.map((f) => skillName(o, f.skillVersionId)).join(", ") || "없음"}]`);

L("\n────────────────────────────────────────────────────────────");
L("  증명: 직원이 입사→교육→인증→배치→업무→성과로 '성장'했고,");
L("  성장이 다음 추천을 바꿨다. (원가 $0 / 실모델·로그인·결제 없음)");
L("────────────────────────────────────────────────────────────");

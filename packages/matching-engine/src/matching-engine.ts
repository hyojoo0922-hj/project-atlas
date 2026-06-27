// Skill Matching Engine v0 — 직원별 적합도(설명 가능) + 선행 인증 게이트
// 근거: docs/specs/skill-matching-engine-spec.md
import type {
  FitResult, FitSignal, Id, MatchingProfile, MemoryKind, SkillVersion,
} from "../../shared-types/src/index.ts";

/** 신호별 가중치 (스펙 초안). 합 = 1.0 */
export const WEIGHTS: Record<FitSignal, number> = {
  roleFamily: 0.30,
  traits: 0.20,
  certReadiness: 0.15,
  memoryReadiness: 0.15,
  trackRecord: 0.15,
  costFit: 0.05,
};

/** 추천 임계값 — 이 미만은 배포 추천하지 않음(헌법 강제) */
export const FIT_THRESHOLD = 0.70;

export interface MatchContext {
  availableMemoryKinds: MemoryKind[];   // 브랜드가 보유한 기억 종류
  budgetHeadroom: number;               // 0..1 (예산 여유)
}

const overlap = (a: string[], b: string[]): number => {
  if (a.length === 0) return 0;
  const set = new Set(b);
  return a.filter((x) => set.has(x)).length / a.length;
};

/** (Employee × SkillVersion) 적합도 계산. breakdown + reasons 동반(설명 가능). */
export function computeFit(
  profile: MatchingProfile,
  sv: SkillVersion,
  ctx: MatchContext,
): FitResult {
  const m = sv.manifest;
  const reasons: string[] = [];

  // 1) Role family
  const roleHit = profile.roleFamily === m.fitSignals.roleFamily ? 1 : 0;
  if (roleHit) reasons.push(`역할군 일치(${profile.roleFamily})`);

  // 2) Traits
  const traitScore = overlap(m.fitSignals.traits, profile.traits);
  if (traitScore > 0) reasons.push(`특성 적합 ${Math.round(traitScore * 100)}%`);

  // 3) Cert readiness (선행 인증) — eligibility 게이트도 겸함
  const prereqSatisfied = m.prereqCertSkillIds.every((id) =>
    profile.certifiedSkillVersionIds.includes(id));
  const certScore = prereqSatisfied ? 1 : 0;
  const eligible = prereqSatisfied;
  if (!eligible) reasons.push("선행 인증 미충족 → 배치 부적격");

  // 4) Memory readiness
  const memScore = m.requiresMemory.length === 0
    ? 1
    : m.requiresMemory.filter((k) => ctx.availableMemoryKinds.includes(k)).length / m.requiresMemory.length;
  if (memScore < 1) reasons.push(`요구 기억 일부 미보유(${Math.round(memScore * 100)}%)`);

  // 5) Track record (카테고리 누적 성과) — 성장 루프의 핵심
  const cat = svCategoryKey(sv);
  const track = clamp01(profile.trackRecord[cat] ?? 0);
  if (track > 0) reasons.push(`과거 성과 반영(${Math.round(track * 100)}%)`);

  // 6) Cost fit
  const costFit = clamp01(ctx.budgetHeadroom);

  const breakdown: Record<FitSignal, number> = {
    roleFamily: roleHit * WEIGHTS.roleFamily,
    traits: traitScore * WEIGHTS.traits,
    certReadiness: certScore * WEIGHTS.certReadiness,
    memoryReadiness: memScore * WEIGHTS.memoryReadiness,
    trackRecord: track * WEIGHTS.trackRecord,
    costFit: costFit * WEIGHTS.costFit,
  };

  const score = round2(
    Object.values(breakdown).reduce((a, b) => a + b, 0),
  );

  return { skillVersionId: sv.id, score, breakdown, eligible, reasons };
}

/** 추천: 적격 + 임계 통과만, 점수 내림차순 */
export function recommend(
  profile: MatchingProfile,
  versions: SkillVersion[],
  ctx: MatchContext,
): FitResult[] {
  return versions
    .filter((sv) => sv.lifecycleState !== "killed" && sv.lifecycleState !== "hold")
    .map((sv) => computeFit(profile, sv, ctx))
    .filter((f) => f.eligible && f.score >= FIT_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

// category key는 skillVersion.skillId 기반이 아니라 manifest로는 못 얻으므로
// 호출측에서 카테고리를 trackRecord 키로 쓰도록 약속. 여기선 roleFamily를 보조 키로 사용.
function svCategoryKey(sv: SkillVersion): string {
  return sv.manifest.fitSignals.roleFamily; // trackRecord는 roleFamily(=category축) 단위로 누적
}

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));
const round2 = (n: number): number => Math.round(n * 100) / 100;
export type { Id };

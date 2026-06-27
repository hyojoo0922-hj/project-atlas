// AI Organization Recommendation v0 — (업종 × 단계 × 진단) → 조직 추천 (템플릿/규칙)
// 근거: docs/specs/org-recommendation-spec.md
import { newId } from "../../shared-types/src/index.ts";
import type {
  Diagnosis, DepartmentRecommendation, FocusArea, Industry,
  CompanyStage, OrgRecommendation,
} from "../../shared-types/src/index.ts";
import { STAGE_ORDER } from "../../shared-types/src/index.ts";

/** 업종 템플릿: 부서별 활성화 단계 + 필수 Skill + seed 직원 */
interface DeptTemplate {
  focus: FocusArea;
  name: string;
  mandate: string;
  activeFrom: CompanyStage;
  requiredSkills: string[];
  seed: DepartmentRecommendation["seedEmployees"];
}

const CAFE_TEMPLATE: DeptTemplate[] = [
  {
    focus: "operations", name: "Operations", mandate: "매장 운영·재고·발주·품질",
    activeFrom: "founding", requiredSkills: ["inventory-mgmt", "quality-check"],
    seed: [{
      role: "운영 매니저", title: "Operations Employee", roleFamily: "operations", archetype: "responder",
      traits: ["organized", "reliable"], recommendedSkills: ["inventory-mgmt", "quality-check"],
    }],
  },
  {
    focus: "marketing", name: "Marketing", mandate: "수요 창출·브랜드 보이스·콘텐츠",
    activeFrom: "early_growth", requiredSkills: ["brand-voice-writer", "repurpose-to-channel"],
    seed: [{
      role: "콘텐츠 라이터", title: "Writer Employee", roleFamily: "content", archetype: "creator",
      traits: ["creative", "concise"], recommendedSkills: ["brand-voice-writer", "repurpose-to-channel"],
    }],
  },
  {
    focus: "customer_care", name: "Customer Care", mandate: "문의·리뷰·고객 유지",
    activeFrom: "stabilize", requiredSkills: ["inquiry-responder"],
    seed: [{
      role: "고객 응대 직원", title: "Care Employee", roleFamily: "support", archetype: "responder",
      traits: ["empathetic", "patient"], recommendedSkills: ["inquiry-responder"],
    }],
  },
];

const TEMPLATES: Partial<Record<Industry, DeptTemplate[]>> = { cafe: CAFE_TEMPLATE };

const stageIdx = (s: CompanyStage): number => STAGE_ORDER.indexOf(s);

/**
 * (업종 × 단계 × 진단) → 조직 추천.
 * - 현재 단계에서 활성화된 부서만 포함(동일 시작 금지의 한 축).
 * - 진단 우선순위(firstBuild·priorities)로 부서 priority를 정렬.
 */
export function recommendOrganization(
  industry: Industry, stage: CompanyStage, diagnosis: Diagnosis,
): OrgRecommendation {
  const tmpl = TEMPLATES[industry];
  if (!tmpl) throw new Error(`업종 템플릿 없음: ${industry} (현재 카페만 지원)`);

  // 1) 단계 활성 필터
  const active = tmpl.filter((d) => stageIdx(stage) >= stageIdx(d.activeFrom));

  // 2) 진단 우선순위 → 부서 순서. 진단 점수가 높은 focus가 앞으로.
  const focusRank = new Map<FocusArea, number>();
  diagnosis.priorities.forEach((p, i) => focusRank.set(p.focus, i));
  const rankOf = (f: FocusArea): number => focusRank.has(f) ? focusRank.get(f)! : 999;

  const ordered = [...active].sort((a, b) => rankOf(a.focus) - rankOf(b.focus));

  const departments: DepartmentRecommendation[] = ordered.map((d, i) => ({
    focus: d.focus, name: d.name, mandate: d.mandate, priority: i + 1,
    requiredSkills: [...d.requiredSkills],
    seedEmployees: d.seed.map((e) => ({ ...e, recommendedSkills: [...e.recommendedSkills] })),
  }));

  const rationale: string[] = [
    `${industry} / ${stage} 단계 활성 부서: ${active.map((d) => d.name).join(", ")}`,
    `진단 핵심 병목(${diagnosis.firstBuild}) → ${departments[0]?.name ?? "-"} 1순위`,
  ];

  return { id: newId("rec"), industry, stage, departments, rationale };
}

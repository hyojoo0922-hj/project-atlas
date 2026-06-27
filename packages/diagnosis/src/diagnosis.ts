// AI Business Diagnosis v0 — 회사보다 사업을 먼저 진단 (규칙 기반)
// 근거: docs/specs/ai-business-diagnosis-spec.md
import { newId } from "../../shared-types/src/index.ts";
import type {
  Diagnosis, DiagnosisPriority, FocusArea, OnboardingResponse,
} from "../../shared-types/src/index.ts";

const has = (s: string, kws: string[]): boolean =>
  kws.some((k) => s.toLowerCase().includes(k.toLowerCase()));

const FOCUS_LABEL: Record<FocusArea, string> = {
  operations: "운영", marketing: "마케팅", content: "콘텐츠", customer_care: "고객 응대",
};

/**
 * 온보딩 응답 → 진단. 신호별 가중으로 초점 점수를 매기고, 핵심 병목(firstBuild)을 판단.
 * 모든 처방은 사유(reason)를 동반(설명 가능).
 */
export function diagnose(res: OnboardingResponse): Diagnosis {
  const score: Record<FocusArea, number> = { operations: 0, marketing: 0, content: 0, customer_care: 0 };
  const why: Record<FocusArea, string[]> = { operations: [], marketing: [], content: [], customer_care: [] };

  // 운영: 시간 소모가 운영/재고/발주에 몰림
  if (has(res.timeSink, ["재고", "발주", "운영", "재고관리", "스케줄", "정산"])) {
    score.operations += 3; why.operations.push(`시간 소모가 운영성 업무(${res.timeSink})에 집중`);
  }
  // 소규모인데 운영 부하 → 체계 부재
  if (res.employees <= 5 && score.operations > 0) {
    score.operations += 1; why.operations.push("소규모 인력 대비 운영 부하 → 체계 우선");
  }
  // 마케팅: 신규 고객/유입/매출 문제
  if (has(res.problem, ["고객", "유입", "마케팅", "매출", "홍보"])) {
    score.marketing += 2; why.marketing.push(`핵심 문제가 수요 창출(${res.problem})`);
  }
  // 온라인 매출 성장 희망 + 온라인 미운영 → 마케팅/채널 구축
  if (has(res.grow, ["온라인", "매출", "채널"]) && !res.online) {
    score.marketing += 1; why.marketing.push("온라인 미운영 상태에서 온라인 성장 목표 → 채널 구축 필요");
  }
  // 콘텐츠: 브랜드 미보유 → 보이스/콘텐츠 정립
  if (!res.brand) {
    score.content += 1.5; why.content.push("브랜드 미보유 → 브랜드 보이스/콘텐츠 정립 필요");
  }
  // 고객 응대: CS/문의/응대 문제
  if (has(res.problem, ["cs", "문의", "응대", "클레임", "리뷰"])) {
    score.customer_care += 2; why.customer_care.push(`고객 응대 이슈(${res.problem})`);
  }

  const priorities: DiagnosisPriority[] = (Object.keys(score) as FocusArea[])
    .map((f) => ({ focus: f, score: score[f], reason: why[f].join("; ") || `${FOCUS_LABEL[f]} 신호 약함` }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);

  // 안전장치: 신호가 전혀 없으면 운영을 기본 우선
  if (priorities.length === 0) {
    priorities.push({ focus: "operations", score: 1, reason: "기본: 운영 체계부터" });
  }

  const firstBuild = priorities[0]!.focus;
  const second = priorities[1]?.focus;
  const bottleneck = `핵심 병목 = ${FOCUS_LABEL[firstBuild]} 체계 (${priorities[0]!.reason})`;
  const rationale: string[] = [];
  if (firstBuild === "operations" && second === "marketing") {
    rationale.push("지금은 마케팅보다 운영 체계를 먼저 만드는 것이 좋습니다.");
  } else if (firstBuild === "content" && second === "customer_care") {
    rationale.push("지금은 CS 직원보다 콘텐츠 직원이 우선입니다.");
  }
  rationale.push(`우선순위: ${priorities.map((p) => FOCUS_LABEL[p.focus]).join(" → ")}`);

  return {
    id: newId("dg"),
    responseId: res.id,
    priorities,
    firstBuild,
    bottleneck,
    rationale,
    recommendedStage: res.stage,
  };
}

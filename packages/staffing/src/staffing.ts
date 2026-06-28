// Staffing / Upsell — 부족 직원 채용 추천 (순수 분석, 결과물 미생성)
// 근거: docs/specs/employee-recommendation-upsell-spec.md
// 주의: 업무 실행/결과물 생성은 하지 않는다(2B Work Loop와 분리).
import type { RoleFamily, StaffingAnalysis } from "../../shared-types/src/index.ts";

/**
 * 요청 업무가 요구하는 직군 vs 회사 보유 직군을 비교해 부족 직원과 업셀 메시지를 산출.
 * 결과물은 만들지 않는다 — 필요한 직원이 없으면 '채용 추천'만 한다.
 */
export function analyzeStaffing(
  requiredRoleFamilies: RoleFamily[],
  presentRoleFamilies: RoleFamily[],
): StaffingAnalysis {
  const present = new Set(presentRoleFamilies);
  const required = [...new Set(requiredRoleFamilies)];
  const missing = required.filter((r) => !present.has(r));
  const canPartial = required.some((r) => present.has(r));

  let upsellMessage: string;
  if (missing.length === 0) {
    upsellMessage = "현재 직원으로 이 업무를 수행할 수 있습니다.";
  } else if (canPartial) {
    upsellMessage =
      `이번 업무에는 ${required.join(", ")} 직원이 필요합니다. ` +
      `현재는 ${[...present].filter((r) => required.includes(r)).join(", ")}만 있습니다. ` +
      `${missing.join(", ")}을(를) 채용하면 전체 결과물까지 제작할 수 있고, ` +
      `채용하지 않으면 보유 직군 범위까지만 가능합니다.`;
  } else {
    upsellMessage =
      `이번 업무에는 ${required.join(", ")} 직원이 필요하지만 현재 보유 직원이 없습니다. ` +
      `${missing.join(", ")}을(를) 채용하면 업무를 시작할 수 있습니다.`;
  }

  return {
    requiredRoleFamilies: required,
    presentRoleFamilies: [...present],
    missingRoleFamilies: missing,
    canPartial,
    upsellMessage,
  };
}

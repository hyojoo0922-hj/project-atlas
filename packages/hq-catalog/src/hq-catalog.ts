// HQ Catalog — 전문 직원 레지스트리 + HQ 적합성 판단(가능/비추천/지원안함).
// 근거: docs/CEO_MEMOS/EMPLOYEE_CONTRACT_AND_PRICING_CONSTITUTION.md, ADR 0013.
// 순수 모듈(부수효과 없음). 가격/계약기간은 모두 Placeholder — 실결제 없음.
import type {
  ContractOption, OutputType, RoleFamily, SpecializedEmployee, SuitabilityVerdict,
} from "../../shared-types/src/index.ts";

// ── 공용 계약 옵션 빌더 (가격은 Placeholder) ──
const days = (n: number): ContractOption => ({ unit: "days", days: n, label: `${n}일`, pricePlaceholder: "₩— · Placeholder" });
const project: ContractOption = { unit: "project", label: "프로젝트 단위", pricePlaceholder: "₩— · Placeholder" };
const monthly: ContractOption = { unit: "monthly", label: "월 단위", pricePlaceholder: "₩—/월 · Placeholder" };
const company: ContractOption = { unit: "company", label: "회사 계약", pricePlaceholder: "₩—/회사 · Placeholder" };

const PRICE_PLACEHOLDER: Record<SpecializedEmployee["costTier"], string> = {
  low: "낮은 원가 · ₩— Placeholder",
  medium: "중간 원가 · ₩— Placeholder",
  high: "높은 원가 · ₩— Placeholder",
  very_high: "매우 높은 원가 · ₩— Placeholder",
};

const mk = (e: Omit<SpecializedEmployee, "pricePlaceholder" | "version"> & { version?: string }): SpecializedEmployee =>
  ({ ...e, pricePlaceholder: PRICE_PLACEHOLDER[e.costTier], version: e.version ?? "1.0.0" });

// ── HQ 전문 직원 레지스트리 (직군 ↔ 직원 분리) ──
// 가격은 원가 기준(직군이 아니라 원가): Writer=low, Designer=medium, Video=very_high 등.
export const HQ_EMPLOYEES: SpecializedEmployee[] = [
  // ── Writer (content) — 낮은 원가 ──
  mk({ id: "writer-sns", roleFamily: "content", title: "SNS Writer", specialty: "SNS 채널 카피",
    goodAt: ["인스타·피드 글", "짧은 홍보 카피", "해시태그 구성"], notSupported: ["이미지 제작", "법률 검수"],
    recommendedIndustries: ["카페", "뷰티", "쇼핑몰"], costTier: "low",
    contractOptions: [days(7), days(30), days(90)], supported: ["social_post", "ad_copy"], notRecommended: ["report", "document"] }),
  mk({ id: "writer-detail", roleFamily: "content", title: "Detail Page Writer", specialty: "상세페이지 카피",
    goodAt: ["상세페이지 문구", "제품 설명", "구매 전환 카피"], notSupported: ["이미지 제작", "영상 편집"],
    recommendedIndustries: ["쇼핑몰", "뷰티", "리빙"], costTier: "low",
    contractOptions: [days(7), days(30), days(90)], supported: ["product_page", "document"], notRecommended: ["social_post"] }),
  mk({ id: "writer-blog", roleFamily: "content", title: "Blog Writer", specialty: "블로그·SEO 글",
    goodAt: ["블로그 포스트", "정보성 장문", "SEO 구조 글"], notSupported: ["이미지 제작", "단문 광고"],
    recommendedIndustries: ["병원", "교육", "쇼핑몰"], costTier: "low",
    contractOptions: [days(30), days(90)], supported: ["document", "text"], notRecommended: ["social_post"] }),
  mk({ id: "writer-brand", roleFamily: "content", title: "Brand Copy Writer", specialty: "브랜드 보이스 카피",
    goodAt: ["브랜드 슬로건", "톤앤매너 카피", "캠페인 메시지"], notSupported: ["데이터 분석", "이미지 제작"],
    recommendedIndustries: ["뷰티", "카페", "패션"], costTier: "medium",
    contractOptions: [days(30), days(90)], supported: ["ad_copy", "text"], notRecommended: ["report"] }),

  // ── Designer (design) — 중간~높은 원가 ──
  mk({ id: "designer-sns", roleFamily: "design", title: "SNS Designer", specialty: "SNS 비주얼",
    goodAt: ["피드 이미지 기획", "썸네일", "카드뉴스"], notSupported: ["실제 이미지 생성", "인쇄 입고"],
    recommendedIndustries: ["카페", "뷰티", "쇼핑몰"], costTier: "medium",
    contractOptions: [days(7), days(30)], supported: ["image", "image_brief"], notRecommended: ["video"] }),
  mk({ id: "designer-package", roleFamily: "design", title: "Package Designer", specialty: "패키지·라벨",
    goodAt: ["패키지 기획", "라벨 디자인 가이드", "구조 설계"], notSupported: ["실제 인쇄", "이미지 생성"],
    recommendedIndustries: ["뷰티", "F&B", "리빙"], costTier: "high",
    contractOptions: [days(30)], supported: ["image", "image_brief"], notRecommended: [] }),
  mk({ id: "designer-landing", roleFamily: "design", title: "Landing Designer", specialty: "랜딩·상세 비주얼",
    goodAt: ["랜딩 레이아웃 기획", "상세페이지 비주얼", "배너"], notSupported: ["실제 이미지 생성", "코딩 배포"],
    recommendedIndustries: ["쇼핑몰", "교육", "뷰티"], costTier: "medium",
    contractOptions: [days(7), days(30)], supported: ["image", "image_brief", "product_page"], notRecommended: [] }),
  mk({ id: "designer-print", roleFamily: "design", title: "Print Designer", specialty: "인쇄물",
    goodAt: ["전단·포스터 기획", "메뉴판 가이드", "인쇄 규격"], notSupported: ["실제 인쇄", "이미지 생성"],
    recommendedIndustries: ["카페", "병원", "리테일"], costTier: "medium",
    contractOptions: [days(30)], supported: ["image", "image_brief"], notRecommended: ["video"] }),
  mk({ id: "designer-luxury", roleFamily: "design", title: "Luxury Designer", specialty: "럭셔리·프리미엄",
    goodAt: ["프리미엄 무드 기획", "고급 비주얼 가이드", "브랜드 키비주얼"], notSupported: ["실제 이미지 생성", "대량 양산물"],
    recommendedIndustries: ["뷰티", "주얼리", "호텔"], costTier: "high",
    contractOptions: [days(30)], supported: ["image", "image_brief"], notRecommended: [] }),
  mk({ id: "producer-video", roleFamily: "design", title: "Video Producer", specialty: "영상 기획·연출",
    goodAt: ["영상 콘티 기획", "촬영 가이드", "편집 디렉션"], notSupported: ["실제 영상 생성", "음원 라이선스"],
    recommendedIndustries: ["뷰티", "쇼핑몰", "F&B"], costTier: "very_high",
    contractOptions: [project], supported: ["video"], notRecommended: ["image"] }),

  // ── Marketing — 월 단위 ──
  mk({ id: "marketer-campaign", roleFamily: "marketing", title: "Campaign Strategist", specialty: "캠페인 기획",
    goodAt: ["홍보 우선순위", "캠페인 설계", "채널 믹스"], notSupported: ["광고비 집행", "외부 매체 구매"],
    recommendedIndustries: ["카페", "뷰티", "쇼핑몰"], costTier: "medium",
    contractOptions: [monthly], supported: ["ad_copy", "social_post"], notRecommended: ["report"] }),

  // ── Support (CS) — 일 단위 ──
  mk({ id: "cs-responder", roleFamily: "support", title: "CS Responder", specialty: "문의·리뷰 응대",
    goodAt: ["문의 답변", "리뷰 대응", "FAQ 정리"], notSupported: ["법적 분쟁 대응", "환자 진단"],
    recommendedIndustries: ["쇼핑몰", "병원", "뷰티"], costTier: "low",
    contractOptions: [days(30)], supported: ["customer_reply"], notRecommended: [] }),

  // ── Operations — 월 단위 ──
  mk({ id: "ops-manager", roleFamily: "operations", title: "Operations Manager", specialty: "운영·재고",
    goodAt: ["재고 점검", "발주 체크리스트", "운영 리포트"], notSupported: ["실제 발주 대행", "결제 처리"],
    recommendedIndustries: ["카페", "병원", "리테일"], costTier: "low",
    contractOptions: [monthly], supported: ["report", "document"], notRecommended: [] }),

  // ── AI 비서 — 회사 계약(회사 단위, 항상 출근). 직접 결과물 생성이 아닌 오케스트레이션. ──
  mk({ id: "assistant-owner", roleFamily: "support", title: "AI 비서", specialty: "회사 운영 비서(오케스트레이션)",
    goodAt: ["업무 분석", "직원 배정", "결과 취합·보고"], notSupported: ["직접 결과물 생성", "결제 집행"],
    recommendedIndustries: ["전 업종"], costTier: "medium",
    contractOptions: [company], supported: [], notRecommended: [] }),
];

// ── 조회 ──
export function listSpecialized(roleFamily?: RoleFamily): SpecializedEmployee[] {
  return roleFamily ? HQ_EMPLOYEES.filter((e) => e.roleFamily === roleFamily) : [...HQ_EMPLOYEES];
}
export function getSpecialized(id: string): SpecializedEmployee | undefined {
  return HQ_EMPLOYEES.find((e) => e.id === id);
}
export function contractOptionsFor(id: string): ContractOption[] {
  return getSpecialized(id)?.contractOptions ?? [];
}
/** roleFamily별로 그룹핑 (UI 카탈로그용) */
export function bySpecialization(): { roleFamily: RoleFamily; employees: SpecializedEmployee[] }[] {
  const order: RoleFamily[] = ["content", "design", "marketing", "support", "operations", "research"];
  return order
    .map((rf) => ({ roleFamily: rf, employees: listSpecialized(rf) }))
    .filter((g) => g.employees.length > 0);
}

// ── HQ 판단: 가능 / 비추천 / 지원 안 함 ──
// 고객은 아무 직원에게 아무 업무를 시킬 수 없다 — HQ가 적합성을 판단한다.
export function judgeSuitability(emp: SpecializedEmployee, outputType: OutputType): SuitabilityVerdict {
  if (emp.supported.includes(outputType)) return "supported";
  if (emp.notRecommended.includes(outputType)) return "not_recommended";
  return "unsupported";
}
/** id로 판단 — 없는 직원이면 지원 안 함 처리 */
export function judgeSuitabilityById(id: string, outputType: OutputType): SuitabilityVerdict {
  const emp = getSpecialized(id);
  return emp ? judgeSuitability(emp, outputType) : "unsupported";
}

/** 업무(OutputType)에 대해 HQ가 가능/비추천으로 분류한 전문 직원 목록 */
export function recommendForOutput(outputType: OutputType): {
  supported: SpecializedEmployee[]; notRecommended: SpecializedEmployee[];
} {
  const supported: SpecializedEmployee[] = [];
  const notRecommended: SpecializedEmployee[] = [];
  for (const e of HQ_EMPLOYEES) {
    const v = judgeSuitability(e, outputType);
    if (v === "supported") supported.push(e);
    else if (v === "not_recommended") notRecommended.push(e);
  }
  return { supported, notRecommended };
}

export const SUITABILITY_LABEL: Record<SuitabilityVerdict, string> = {
  supported: "가능", not_recommended: "비추천", unsupported: "지원 안 함",
};

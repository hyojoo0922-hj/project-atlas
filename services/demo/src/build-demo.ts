// HTML 스냅샷 생성기 — Operator HQ / Customer 화면을 정적 파일로 출력
// 실행: npm run build:demo
import { writeFileSync, mkdirSync } from "node:fs";
import { runScenario } from "./scenario.ts";
import { renderOperatorHQ, renderCustomer } from "./render.ts";
import { runOnboardingScenario } from "./onboarding-scenario.ts";
import { renderOnboardingCustomer, renderOnboardingOperator } from "./render-onboarding.ts";

mkdirSync("apps/operator-console/public", { recursive: true });
mkdirSync("apps/customer-portal/public", { recursive: true });

// Sprint 1 — 운영 루프 스냅샷
const r = runScenario();
writeFileSync("apps/operator-console/public/index.html", renderOperatorHQ(r.orch, r));
writeFileSync("apps/customer-portal/public/index.html", renderCustomer(r.orch, r));

// Sprint 2A — 온보딩 스냅샷
const o = runOnboardingScenario();
writeFileSync("apps/operator-console/public/onboarding.html", renderOnboardingOperator(o));
writeFileSync("apps/customer-portal/public/onboarding.html", renderOnboardingCustomer(o));

console.log("✅ HTML 스냅샷 생성:");
console.log("   - apps/operator-console/public/index.html (Operator HQ · 운영루프)");
console.log("   - apps/customer-portal/public/index.html (Customer · 운영루프)");
console.log("   - apps/operator-console/public/onboarding.html (Operator · 온보딩 2A)");
console.log("   - apps/customer-portal/public/onboarding.html (Customer · 온보딩 2A)");

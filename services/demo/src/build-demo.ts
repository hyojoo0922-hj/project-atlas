// HTML 스냅샷 생성기 — Operator HQ / Customer 화면을 정적 파일로 출력
// 실행: npm run build:demo
import { writeFileSync, mkdirSync } from "node:fs";
import { runScenario } from "./scenario.ts";
import { renderOperatorHQ, renderCustomer } from "./render.ts";

const r = runScenario();
mkdirSync("apps/operator-console/public", { recursive: true });
mkdirSync("apps/customer-portal/public", { recursive: true });
writeFileSync("apps/operator-console/public/index.html", renderOperatorHQ(r.orch, r));
writeFileSync("apps/customer-portal/public/index.html", renderCustomer(r.orch, r));
console.log("✅ HTML 스냅샷 생성:");
console.log("   - apps/operator-console/public/index.html (Operator HQ)");
console.log("   - apps/customer-portal/public/index.html (Customer)");

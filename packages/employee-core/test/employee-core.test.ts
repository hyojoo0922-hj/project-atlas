import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import { EmployeeStore, type HireInput } from "../src/employee-core.ts";

const hireInput = (): HireInput => ({
  brandId: "brd_1", archetype: "creator", roleFamily: "content",
  persona: "라이터", tone: "warm", locale: "ko-KR",
  traits: ["creative"], values: ["on-brand"],
  memoryScope: ["voice"], guardrails: [], budgetId: "bdg_1",
});

test("employee: 채용 시 DNA 4레이어와 MatchingProfile이 구성된다", () => {
  __resetIds();
  const s = new EmployeeStore();
  const e = s.hire(hireInput());
  assert.equal(e.dna.genome.archetype, "creator");      // genome 불변 레이어
  assert.equal(e.dna.lineage.length, 1);                 // 계보 시작
  assert.equal(e.matchingProfile.roleFamily, "content"); // 파생 프로파일
});

test("employee: 성과 기록이 trackRecord(카테고리 평균)를 갱신한다", () => {
  __resetIds();
  const s = new EmployeeStore();
  const e = s.hire(hireInput());
  s.recordPerformance(e.id, "run_1", "content", 0.8, 3);
  s.recordPerformance(e.id, "run_2", "content", 1.0, 3);
  assert.equal(s.get(e.id)!.matchingProfile.trackRecord["content"], 0.9);
});

test("employee: 시험 불합격이면 인증 발급이 거부된다", () => {
  __resetIds();
  const s = new EmployeeStore();
  const e = s.hire(hireInput());
  assert.throws(() => s.certify(e.id, "skv_1", ["brd_1"], 0.4));
});

test("employee: Upgrade는 trait 획득 + lineage append(계보 보존)", () => {
  __resetIds();
  const s = new EmployeeStore();
  const e = s.hire(hireInput());
  s.upgrade(e.id, "on-brand", "first job");
  const u = s.get(e.id)!;
  assert.ok(u.dna.acquired.traits.includes("on-brand"));
  assert.equal(u.dna.lineage.length, 2);
});

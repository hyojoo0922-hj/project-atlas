import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import {
  CONSULT_QUESTIONS, CustomerJourney, JourneyTransitionError, VoucherError,
  activateVoucher, buildCustomerView, consumeVoucher, createOwnerAccount,
} from "../src/onboarding.ts";

test("onboarding: 컨설팅 질문 세트가 핵심 항목을 포함한다", () => {
  const keys = CONSULT_QUESTIONS.map((q) => q.key);
  for (const k of ["industry", "stage", "timeSink", "problem", "grow"]) assert.ok(keys.includes(k));
});

test("voucher: 무료 사업진단권은 계정당 1회 (재사용 차단)", () => {
  __resetIds();
  const acc = createOwnerAccount("대표");
  assert.throws(() => consumeVoucher(acc), VoucherError);  // 활성화 전
  activateVoucher(acc);
  consumeVoucher(acc);                                     // 1회 OK
  assert.equal(acc.voucher.used, 1);
  assert.throws(() => consumeVoucher(acc), VoucherError);  // 2회 차단
});

test("journey: 대표 계정 생성 → … → first_task 정상 경로", () => {
  __resetIds();
  const j = new CustomerJourney("cus_1");
  assert.equal(j.state, "account_created");
  for (const s of ["voucher_activated", "diagnosing", "designing", "recommending", "reviewing", "approving", "created", "first_task"] as const) j.to(s);
  assert.ok(j.isCreated);
});

test("journey: 불법 전이 차단 (account_created→created 직행 불가)", () => {
  __resetIds();
  const j = new CustomerJourney("cus_1");
  assert.throws(() => j.to("created"), JourneyTransitionError);
});

test("customerView: 항상 3요소(현재 단계/판단/다음 행동)를 반환하고 승인·첫업무 CTA가 IA와 일치", () => {
  assert.equal(buildCustomerView("approving").nextAction, "이 설계안으로 내 회사 만들기");
  assert.equal(buildCustomerView("created").nextAction, "첫 업무 맡기기");
  assert.equal(buildCustomerView("first_task").nextAction, "계속 회사 운영하기");
  const v = buildCustomerView("voucher_activated", { ownerName: "대표" });
  assert.ok(v.stage && v.cofounderJudgment && v.nextAction);  // 3요소 항상 존재
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import {
  CONSULT_QUESTIONS, CustomerJourney, JourneyTransitionError, VoucherError,
  activateVoucher, buildCustomerView, consumeVoucher, createOwnerAccount, isFreeState,
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
  consumeVoucher(acc);
  assert.equal(acc.voucher.used, 1);
  assert.throws(() => consumeVoucher(acc), VoucherError);  // 2회 차단
});

test("journey: 무료는 proposal_ready까지, 유료로 first_employee_ready까지", () => {
  __resetIds();
  const j = new CustomerJourney("cus_1");
  for (const s of ["voucher_activated", "diagnosing", "designing", "recommending", "reviewing", "proposal_ready"] as const) j.to(s);
  assert.ok(j.isProposalReady);
  assert.ok(!j.isCompanyCreated);              // 무료 단계엔 회사 생성 없음
  for (const s of ["payment_required", "company_activation", "company_created", "assistant_on_duty", "first_employee_ready"] as const) j.to(s);
  assert.ok(j.isCompanyCreated);
});

test("journey: 무료 종착(proposal_ready)에서 결제 없이 회사 생성 상태로 갈 수 없다", () => {
  __resetIds();
  const j = new CustomerJourney("cus_1");
  for (const s of ["voucher_activated", "diagnosing", "designing", "recommending", "reviewing", "proposal_ready"] as const) j.to(s);
  assert.throws(() => j.to("company_created"), JourneyTransitionError); // proposal_ready→company_created 직행 불가
});

test("isFreeState: 무료/유료 경계", () => {
  assert.ok(isFreeState("proposal_ready"));
  assert.ok(!isFreeState("company_created"));
});

test("customerView: 문구 원칙 — 무료엔 '생성 완료' 없음, 유료 전환 CTA 일치", () => {
  assert.equal(buildCustomerView("proposal_ready").stage, "회사 설계안 준비 완료"); // '생성 완료' 아님
  assert.equal(buildCustomerView("proposal_ready").nextAction, "이 설계안으로 회사 설립하기");
  assert.equal(buildCustomerView("reviewing").nextAction, "필요한 직원 확인하기");
  assert.equal(buildCustomerView("company_created").nextAction, "대표 비서 출근시키기");
  assert.equal(buildCustomerView("first_employee_ready").nextAction, "계속 회사 운영하기");
});

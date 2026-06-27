import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import { OrgTree, OrgTreeError } from "../src/organization.ts";

test("org tree: 단일 루트 + 부서/직원 배치 후 validate 통과", () => {
  __resetIds();
  const t = new OrgTree("com_1");
  t.setRoot("com_1");
  t.addUnderCompany("ceo", "ceo_1");
  const dep = t.addUnderCompany("department", "dep_1");
  t.addEmployee(dep.id, "emp_1");
  t.validate();
  assert.equal(t.root!.kind, "company");
});

test("org tree: 루트는 하나만", () => {
  __resetIds();
  const t = new OrgTree("com_1");
  t.setRoot("com_1");
  assert.throws(() => t.setRoot("com_2"), OrgTreeError);
});

test("org tree: 직원은 department 아래에만 배치된다", () => {
  __resetIds();
  const t = new OrgTree("com_1");
  t.setRoot("com_1");
  const ceo = t.addUnderCompany("ceo", "ceo_1");
  assert.throws(() => t.addEmployee(ceo.id, "emp_1"), OrgTreeError);
});

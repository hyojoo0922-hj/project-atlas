import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetIds } from "../../shared-types/src/index.ts";
import { BrandMemoryStore } from "../src/brand-memory.ts";

test("brand memory: 수정 시 리비전이 누적되고 이전 값이 보존된다(손실 없음)", () => {
  __resetIds();
  const s = new BrandMemoryStore();
  const m = s.write("brd_1", "voice", "tone", "v1-따뜻함");
  s.update(m.id, "v2-간결함");
  s.update(m.id, "v3-신뢰감");
  const got = s.get(m.id)!;
  assert.equal(got.version, 3);
  assert.equal(got.value, "v3-신뢰감");
  assert.deepEqual(got.revisions.map((r) => r.value), ["v1-따뜻함", "v2-간결함", "v3-신뢰감"]);
});

test("brand memory: 동일 kind+key write는 update로 합쳐진다", () => {
  __resetIds();
  const s = new BrandMemoryStore();
  s.write("brd_1", "voice", "tone", "a");
  s.write("brd_1", "voice", "tone", "b");
  assert.equal(s.byKind("brd_1", "voice").length, 1);
  assert.equal(s.find("brd_1", "voice", "tone")!.version, 2);
});

test("brand memory: availableKinds가 보유 종류를 반환", () => {
  __resetIds();
  const s = new BrandMemoryStore();
  s.write("brd_1", "voice", "t", "x");
  s.write("brd_1", "product", "p", "y");
  assert.deepEqual(s.availableKinds("brd_1").sort(), ["product", "voice"]);
});

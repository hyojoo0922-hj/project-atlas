// Brand Memory v0 — 회사의 기억 (CRUD + 손실 없는 버전관리)
// 근거: docs/architecture/02-data-model.md
import { newId } from "../../shared-types/src/index.ts";
import type { BrandMemory, Id, MemoryKind } from "../../shared-types/src/index.ts";

/** 인메모리 Brand Memory 스토어. 직원이 바뀌어도 남는 회사의 기억(해자). */
export class BrandMemoryStore {
  private items = new Map<Id, BrandMemory>();

  /** 기억 생성 (kind+key 단위) */
  write(brandId: Id, kind: MemoryKind, key: string, value: unknown, author = "operator"): BrandMemory {
    const existing = this.find(brandId, kind, key);
    if (existing) return this.update(existing.id, value, author);
    const mem: BrandMemory = {
      id: newId("mem"),
      brandId, kind, key, value,
      version: 1,
      revisions: [{ version: 1, value, author }],
    };
    this.items.set(mem.id, mem);
    return mem;
  }

  /** 수정 = 리비전 append (이전 값 보존) */
  update(id: Id, value: unknown, author = "operator"): BrandMemory {
    const mem = this.items.get(id);
    if (!mem) throw new Error(`BrandMemory not found: ${id}`);
    mem.version += 1;
    mem.value = value;
    mem.revisions.push({ version: mem.version, value, author });
    return mem;
  }

  get(id: Id): BrandMemory | undefined {
    return this.items.get(id);
  }

  find(brandId: Id, kind: MemoryKind, key: string): BrandMemory | undefined {
    for (const m of this.items.values()) {
      if (m.brandId === brandId && m.kind === kind && m.key === key) return m;
    }
    return undefined;
  }

  /** 브랜드의 특정 kind 기억들 */
  byKind(brandId: Id, kind: MemoryKind): BrandMemory[] {
    return [...this.items.values()].filter((m) => m.brandId === brandId && m.kind === kind);
  }

  /** 브랜드가 보유한 memory kind 집합 (Matching의 memoryReadiness 신호용) */
  availableKinds(brandId: Id): MemoryKind[] {
    const set = new Set<MemoryKind>();
    for (const m of this.items.values()) if (m.brandId === brandId) set.add(m.kind);
    return [...set];
  }

  all(brandId: Id): BrandMemory[] {
    return [...this.items.values()].filter((m) => m.brandId === brandId);
  }
}

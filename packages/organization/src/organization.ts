// Organization Tree — Company→CEO→Department→Employee 트리 (불변식 강제)
// 근거: docs/specs/organization-tree-spec.md
import { newId } from "../../shared-types/src/index.ts";
import type { Id, OrgNode, OrgNodeKind } from "../../shared-types/src/index.ts";

export class OrgTreeError extends Error {}

export class OrgTree {
  private nodes = new Map<Id, OrgNode>();
  private rootId: Id | null = null;
  private companyId: Id;
  constructor(companyId: Id) { this.companyId = companyId; }

  /** 루트(company) 노드 생성 — 1회만 */
  setRoot(refId: Id): OrgNode {
    if (this.rootId) throw new OrgTreeError("루트(company)는 하나만 존재할 수 있습니다.");
    const node = this.mk("company", refId, null);
    this.rootId = node.id;
    return node;
  }

  /** company 자식: ceo | department */
  addUnderCompany(kind: "ceo" | "department", refId: Id): OrgNode {
    if (!this.rootId) throw new OrgTreeError("루트(company)가 먼저 필요합니다.");
    return this.attach(kind, refId, this.rootId);
  }

  /** department 자식: employee (직원은 정확히 하나의 부서 소속, 리프) */
  addEmployee(departmentNodeId: Id, refId: Id): OrgNode {
    const parent = this.nodes.get(departmentNodeId);
    if (!parent || parent.kind !== "department") throw new OrgTreeError("직원은 department 노드 아래에만 배치됩니다.");
    return this.attach("employee", refId, departmentNodeId);
  }

  nodeByRef(refId: Id): OrgNode | undefined {
    return [...this.nodes.values()].find((n) => n.refId === refId);
  }
  all(): OrgNode[] { return [...this.nodes.values()]; }
  get root(): OrgNode | undefined { return this.rootId ? this.nodes.get(this.rootId) : undefined; }

  /** 불변식 검사: 단일 루트, 사이클 없음, 직원은 리프 */
  validate(): void {
    if (!this.rootId) throw new OrgTreeError("루트가 없습니다.");
    const roots = [...this.nodes.values()].filter((n) => n.parentId === null);
    if (roots.length !== 1) throw new OrgTreeError(`루트는 1개여야 합니다(현재 ${roots.length}).`);
    // 사이클/도달성: 루트에서 BFS로 전부 도달해야 함
    const seen = new Set<Id>();
    const queue = [this.rootId];
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) throw new OrgTreeError("사이클이 감지되었습니다.");
      seen.add(id);
      queue.push(...this.nodes.get(id)!.childrenIds);
    }
    if (seen.size !== this.nodes.size) throw new OrgTreeError("고아 노드가 있습니다(트리 불일치).");
    for (const n of this.nodes.values()) {
      if (n.kind === "employee" && n.childrenIds.length > 0) throw new OrgTreeError("employee는 리프여야 합니다.");
    }
  }

  private attach(kind: OrgNodeKind, refId: Id, parentId: Id): OrgNode {
    const node = this.mk(kind, refId, parentId);
    this.nodes.get(parentId)!.childrenIds.push(node.id);
    return node;
  }
  private mk(kind: OrgNodeKind, refId: Id, parentId: Id | null): OrgNode {
    const node: OrgNode = { id: newId("node"), companyId: this.companyId, kind, refId, parentId, childrenIds: [] };
    this.nodes.set(node.id, node);
    return node;
  }
}

// Skill Library v0 — Skill 자산 카탈로그 + 10단계 라이프사이클 상태머신
// 근거: docs/specs/skill-lifecycle-spec.md
import { newId } from "../../shared-types/src/index.ts";
import type {
  Id, LifecycleState, RoiResult, Skill, SkillManifest, SkillVersion,
} from "../../shared-types/src/index.ts";

/** 자산 성숙 단계의 선형 전이 (per-skill-version). */
const FORWARD: LifecycleState[] = [
  "discovered", "analyzed", "sandboxed", "roi_evaluated",
  "recommended", "trained", "tested", "certified",
  "deployed", "measured",
];

const nextOf = (s: LifecycleState): LifecycleState | undefined => {
  const i = FORWARD.indexOf(s);
  return i >= 0 && i < FORWARD.length - 1 ? FORWARD[i + 1] : undefined;
};

export class IllegalTransitionError extends Error {}

export class SkillLibrary {
  private skills = new Map<Id, Skill>();
  private versions = new Map<Id, SkillVersion>();

  registerSkill(name: string, category: string, description: string, owner = "research-lab"): Skill {
    const skill: Skill = { id: newId("skl"), name, category, description, assetOwner: owner };
    this.skills.set(skill.id, skill);
    return skill;
  }

  publishVersion(skillId: Id, version: string, manifest: SkillManifest): SkillVersion {
    if (!this.skills.has(skillId)) throw new Error(`Skill not found: ${skillId}`);
    const sv: SkillVersion = {
      id: newId("skv"),
      skillId, version,
      lifecycleState: "discovered",
      manifest,
      roi: { status: "pending", roiScore: 0, recommendedMode: "credit" },
    };
    this.versions.set(sv.id, sv);
    return sv;
  }

  getVersion(id: Id): SkillVersion | undefined { return this.versions.get(id); }
  getSkill(id: Id): Skill | undefined { return this.skills.get(id); }
  allVersions(): SkillVersion[] { return [...this.versions.values()]; }

  /**
   * 다음 단계로 1칸 전진. 게이트:
   * - 단계 건너뛰기 금지 (불법 전이 차단)
   * - sandboxed → roi_evaluated: ROI 결과 필요
   * - roi_evaluated → recommended: roi.status === "go" 여야 함 (아니면 hold/kill로)
   */
  advance(versionId: Id): SkillVersion {
    const sv = this.versions.get(versionId);
    if (!sv) throw new Error(`SkillVersion not found: ${versionId}`);
    const target = nextOf(sv.lifecycleState);
    if (!target) {
      throw new IllegalTransitionError(`'${sv.lifecycleState}'에서 더 전진할 수 없습니다.`);
    }
    if (target === "roi_evaluated" && sv.roi.status === "pending") {
      throw new IllegalTransitionError("ROI 분석 결과 없이 roi_evaluated로 전진할 수 없습니다.");
    }
    if (sv.lifecycleState === "roi_evaluated" && target === "recommended" && sv.roi.status !== "go") {
      throw new IllegalTransitionError(`ROI 게이트 미통과(status=${sv.roi.status}) — recommended 불가.`);
    }
    sv.lifecycleState = target;
    return sv;
  }

  /** ROI 분석 단계 기록. status='go'면 통과, 아니면 hold/kill로 분기. */
  setRoi(versionId: Id, roi: RoiResult): SkillVersion {
    const sv = this.versions.get(versionId);
    if (!sv) throw new Error(`SkillVersion not found: ${versionId}`);
    sv.roi = roi;
    if (roi.status === "kill") sv.lifecycleState = "killed";
    else if (roi.status === "hold") sv.lifecycleState = "hold";
    return sv;
  }

  /** 특정 단계까지 한 번에 전진 (편의). 각 칸마다 게이트 적용. */
  advanceTo(versionId: Id, target: LifecycleState): SkillVersion {
    let sv = this.versions.get(versionId);
    if (!sv) throw new Error(`SkillVersion not found: ${versionId}`);
    while (sv.lifecycleState !== target) {
      const before = sv.lifecycleState;
      sv = this.advance(versionId);
      if (sv.lifecycleState === before) break; // 안전장치
    }
    return sv;
  }
}

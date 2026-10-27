import { MAX_LEVEL } from '../config/LevelCatalog.ts';
import type { Level } from '../config/LevelCatalog.ts';

export type MergeCandidate = { id: number; level: Level };

export type MergePlan = {
  firstId: number;
  secondId: number;
  targetLevel: Level;
};

/** 在同一物理步锁定卡片，避免一个接触参与多次结算。 */
export class MergeResolver {
  private readonly lockedIds = new Set<number>();
  private readonly pending: MergePlan[] = [];

  queue(first: MergeCandidate, second: MergeCandidate): boolean {
    if (first.id === second.id) return false;
    const pair = [first.level, second.level].sort((a, b) => a - b).join('-');
    const complementary = pair === '1-2' || pair === '3-4';
    const sameFragment = first.level === second.level && first.level >= 5 && first.level < MAX_LEVEL;
    if (!complementary && !sameFragment) return false;
    if (this.lockedIds.has(first.id) || this.lockedIds.has(second.id)) return false;

    this.lockedIds.add(first.id);
    this.lockedIds.add(second.id);
    this.pending.push({
      firstId: first.id,
      secondId: second.id,
      targetLevel: (complementary ? 5 : first.level + 1) as Level,
    });
    return true;
  }

  drain(): MergePlan[] {
    return this.pending.splice(0);
  }

  complete(plan: MergePlan): void {
    this.lockedIds.delete(plan.firstId);
    this.lockedIds.delete(plan.secondId);
  }

  clear(): void {
    this.pending.length = 0;
    this.lockedIds.clear();
  }
}

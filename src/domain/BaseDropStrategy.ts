import type { DropLevel, Level } from '../config/LevelCatalog';

export type BaseCounts = readonly [number, number, number, number];

const BASES: readonly DropLevel[] = [1, 2, 3, 4];
const PARTNERS: readonly DropLevel[] = [2, 1, 4, 3];

/** 把下一张待投放碱基计入供给，避免已有配对球在队列里时继续集中抽取。 */
export function missingPartners(board: BaseCounts, current: Level): BaseCounts {
  const available = [...board];
  if (current <= 4) available[current - 1] += 1;
  const missing: [number, number, number, number] = [0, 0, 0, 0];
  for (const base of BASES) {
    missing[base - 1] = Math.max(0, available[PARTNERS[base - 1] - 1] - available[base - 1]);
  }
  return missing;
}

/** 只累计仍有缺口且当前队列不能补足的等待轮次。 */
export function advancePartnerWaits(
  waits: BaseCounts,
  dropped: Level,
  current: Level,
  missing: BaseCounts,
): BaseCounts {
  const next: [number, number, number, number] = [0, 0, 0, 0];
  for (const base of BASES) {
    next[base - 1] = missing[base - 1] > 0 && dropped !== base && current !== base
      ? waits[base - 1] + 1
      : 0;
  }
  return next;
}

/** 按场上缺口加权；若已连续等待四次，则让下一张保底补上配对球。 */
export function chooseNextBase(
  unlocked: boolean,
  current: Level,
  lastDropped: DropLevel | null,
  missing: BaseCounts,
  waits: BaseCounts,
  random: () => number = Math.random,
): DropLevel {
  const candidates = BASES.filter((base) =>
    (unlocked || base <= 2) && !(current === lastDropped && base === current));

  const overdue = candidates
    .filter((base) => base !== current && missing[base - 1] > 0 && waits[base - 1] >= 3)
    .sort((a, b) => waits[b - 1] - waits[a - 1]
      || missing[b - 1] - missing[a - 1]);
  if (overdue.length > 0) return overdue[0];

  const weights = candidates.map((base) => 1 + Math.min(missing[base - 1], 4) * 2);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let pick = Math.min(Math.max(random(), 0), 0.9999999999999999) * total;
  for (let i = 0; i < candidates.length; i += 1) {
    pick -= weights[i];
    if (pick < 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

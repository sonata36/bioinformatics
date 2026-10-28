import assert from 'node:assert/strict';
import test from 'node:test';
import { LEVELS, getLevelConfig } from '../src/config/LevelCatalog.ts';
import { advancePartnerWaits, chooseNextBase, missingPartners } from '../src/domain/BaseDropStrategy.ts';
import { MergeResolver } from '../src/domain/MergeResolver.ts';
import { DROP_GRACE_MS, GameSession, OVER_LINE_MS } from '../src/domain/GameSession.ts';

test('四种碱基同样大小，片段随长度增加', () => {
  assert.deepEqual(LEVELS.map((item) => item.level), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(new Set(LEVELS.map((item) => item.fill)).size, 8);
  assert.deepEqual(LEVELS.slice(0, 4).map((item) => item.radius), [31, 31, 31, 31]);
  assert.deepEqual(LEVELS.slice(4).map((item) => item.radius), [43, 55, 68, 83]);
  assert.equal(getLevelConfig(8).textureKey, 'level-8');
});

test('待投放球计入配对供给，场上失衡时提高缺少球的抽取概率', () => {
  assert.deepEqual(missingPartners([3, 0, 2, 1], 3), [0, 3, 0, 2]);
  assert.deepEqual(missingPartners([1, 0, 0, 0], 2), [0, 0, 0, 0]);
  const missing = missingPartners([3, 0, 0, 0], 3);
  assert.deepEqual([0, .1, .6, .8].map((value) =>
    chooseNextBase(true, 3, 1, missing, [0, 0, 0, 0], () => value)), [1, 2, 2, 4]);
});

test('保底在连续等待后补上配对球，并保留新手池和防三连规则', () => {
  const missing = missingPartners([2, 0, 0, 0], 3);
  let waits = [0, 0, 0, 0];
  for (let i = 0; i < 3; i += 1) waits = advancePartnerWaits(waits, 1, 3, missing);
  assert.deepEqual(waits, [0, 3, 0, 3]);
  assert.equal(chooseNextBase(true, 3, 1, missing, waits, () => 0), 2);
  assert.deepEqual(advancePartnerWaits(waits, 1, 2, missing), [0, 0, 0, 4]);
  assert.deepEqual(advancePartnerWaits(waits, 1, 3, [0, 0, 0, 0]), [0, 0, 0, 0]);
  assert.equal(chooseNextBase(false, 1, 1, missing, waits, () => .99), 2);
  assert.notEqual(chooseNextBase(true, 2, 2, missing, waits, () => .99), 2);
});

test('只有 A–T、C–G 互补配对；同长度片段可继续合并', () => {
  for (const [left, right] of [[1,2], [2,1], [3,4], [4,3]]) {
    const resolver = new MergeResolver();
    assert.equal(resolver.queue({ id: 1, level: left }, { id: 2, level: right }), true);
    assert.deepEqual(resolver.drain(), [{ firstId: 1, secondId: 2, targetLevel: 5 }]);
  }
  for (let level = 5; level <= 7; level += 1) {
    const resolver = new MergeResolver();
    assert.equal(resolver.queue({ id: 1, level }, { id: 2, level }), true);
    assert.equal(resolver.drain()[0].targetLevel, level + 1);
  }
  const resolver = new MergeResolver();
  assert.equal(resolver.queue({ id: 1, level: 1 }, { id: 2, level: 1 }), false);
  assert.equal(resolver.queue({ id: 1, level: 1 }, { id: 2, level: 3 }), false);
  assert.equal(resolver.queue({ id: 3, level: 8 }, { id: 4, level: 8 }), false);
  assert.deepEqual(resolver.drain(), []);
});

test('连续接触时同一枚角色只能进入一个合成计划', () => {
  const resolver = new MergeResolver();
  const a = { id: 1, level: 1 };
  const b = { id: 2, level: 2 };
  const c = { id: 3, level: 1 };
  const d = { id: 4, level: 2 };
  assert.equal(resolver.queue(a, b), true);
  assert.equal(resolver.queue(b, a), false);
  assert.equal(resolver.queue(a, c), false);
  assert.equal(resolver.queue(c, d), true);
  const plans = resolver.drain();
  assert.equal(plans.length, 2);
  assert.deepEqual(plans.map((plan) => [plan.firstId, plan.secondId]), [[1, 2], [3, 4]]);
  for (const plan of plans) resolver.complete(plan);
});

test('只按目标等级一次性计分', () => {
  const session = new GameSession();
  assert.equal(session.score, 0);
  session.awardMerge(5);
  assert.equal(session.score, 32);
  session.awardMerge(8);
  assert.equal(session.score, 288);
});

test('新投放角色先宽限 2 秒，再连续越线 3 秒才失败', () => {
  assert.equal(DROP_GRACE_MS, 2_000);
  assert.equal(OVER_LINE_MS, 3_000);
  const session = new GameSession();
  assert.equal(session.observePiece(1, true, 0, 0), false);
  assert.equal(session.observePiece(1, true, 0, 1_999), false);
  assert.equal(session.observePiece(1, true, 0, 2_000), false);
  assert.equal(session.observePiece(1, true, 0, 4_999), false);
  assert.equal(session.isEnded, false);
  assert.equal(session.observePiece(1, true, 0, 5_000), true);
  assert.equal(session.isEnded, true);
  assert.equal(session.observePiece(1, true, 0, 5_001), false);
});

test('回到线下会清零连续计时；合成角色无新投放宽限', () => {
  const session = new GameSession();
  assert.equal(session.observePiece(1, true, 0, 2_000), false);
  assert.equal(session.observePiece(1, true, 0, 4_000), false);
  assert.equal(session.observePiece(1, false, 0, 4_001), false);
  assert.equal(session.observePiece(1, true, 0, 4_002), false);
  assert.equal(session.observePiece(1, true, 0, 7_001), false);
  assert.equal(session.isEnded, false);
  assert.equal(session.observePiece(1, true, 0, 7_002), true);

  const mergedSession = new GameSession();
  assert.equal(mergedSession.observePiece(2, true, null, 0), false);
  assert.equal(mergedSession.observePiece(2, true, null, 2_999), false);
  assert.equal(mergedSession.observePiece(2, true, null, 3_000), true);
});

test('移除角色和重新开始清空越线计时、分数与结束状态', () => {
  const session = new GameSession();
  session.awardMerge(5);
  session.observePiece(1, true, null, 0);
  session.forgetPiece(1);
  assert.equal(session.observePiece(1, true, null, 3_000), false);
  assert.equal(session.observePiece(1, true, null, 6_000), true);
  session.awardMerge(5);
  assert.equal(session.score, 32);
  session.reset();
  assert.equal(session.score, 0);
  assert.equal(session.isEnded, false);
  assert.equal(session.observePiece(1, true, null, 6_001), false);
});

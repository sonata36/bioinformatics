import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('八级角色图实际存在，均为独立的 512×512 RGBA PNG', async () => {
  const hashes = new Set();
  for (let level = 1; level <= 8; level += 1) {
    const data = await readFile(new URL(`../assets/characters/lv${level}.png`, import.meta.url));
    assert.deepEqual(data.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.equal(data.readUInt32BE(16), 512);
    assert.equal(data.readUInt32BE(20), 512);
    assert.equal(data[25], 6, `lv${level} 应为带 Alpha 的 RGBA PNG`);
    assert.ok(data.length > 10_000);
    hashes.add(createHash('sha256').update(data).digest('hex'));
  }
  assert.equal(hashes.size, 8);
});

test('长版背景音乐有 OGG 主文件与 MP3 回退文件', async () => {
  const ogg = await readFile(new URL('../assets/audio/underwater-theme-ii.ogg', import.meta.url));
  assert.ok(ogg.length > 1_000_000);
  assert.equal(ogg.subarray(0, 4).toString('ascii'), 'OggS');

  const mp3 = await readFile(new URL('../assets/audio/underwater-theme-ii.mp3', import.meta.url));
  assert.ok(mp3.length > 1_000_000);
  const hasId3 = mp3.subarray(0, 3).toString('ascii') === 'ID3';
  const hasMpegFrame = mp3[0] === 0xff && (mp3[1] & 0xe0) === 0xe0;
  assert.ok(hasId3 || hasMpegFrame);
});

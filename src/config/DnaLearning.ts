export const DNA_CARDS = [
  { name: 'A', tag: '腺嘌呤 · A', fact: '在双链 DNA 中，A 通常与 T 互补配对。试着让 A 与 T 相碰。', cue: '新手关只会出现 A 和 T。' },
  { name: 'T', tag: '胸腺嘧啶 · T', fact: 'T 是 DNA 的四种碱基之一；在双链 DNA 中，它通常与 A 配对。', cue: '记忆方法：A ↔ T。' },
  { name: 'C', tag: '胞嘧啶 · C', fact: '第一次成功配对后会解锁 C。它通常与 G 互补配对。', cue: '记忆方法：C ↔ G。' },
  { name: 'G', tag: '鸟嘌呤 · G', fact: 'G 与 C 组成另一种常见的 DNA 碱基对。', cue: '颜色和图形也能帮助你找到配对。' },
  { name: '1 bp', tag: '一个碱基对', fact: 'A–T 或 C–G 相碰都会生成一个碱基对。bp 是“碱基对”的英文缩写。', cue: 'A–A、T–T、A–C 等不会配对。' },
  { name: '2 bp', tag: '两个碱基对', fact: '把两个 1 bp 游戏卡合并，就得到 2 bp 片段。真实 DNA 的序列顺序还要单独记录。', cue: '本游戏用卡片长度表示研究进度。' },
  { name: '4 bp', tag: '四个碱基对', fact: 'DNA 序列可以看成碱基的排列。生物信息学会比较不同序列的相同与差异位置。', cue: '“长度相同”不意味着“序列相同”。' },
  { name: '8 bp', tag: '八个碱基对', fact: '序列比对是 DNA 分析的常用步骤，可帮助寻找相似片段；还需要结合来源和证据解释结果。', cue: '片段合并是游戏规则，并不模拟真实的 DNA 合成。' },
] as const;

export function stageName(level: number): string {
  return DNA_CARDS[level - 1]?.name ?? `${level} 级`;
}

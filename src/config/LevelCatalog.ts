export const MAX_LEVEL = 8;
export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type DropLevel = 1 | 2 | 3 | 4;

export type ShapePart =
  | { kind: 'circle'; x: number; y: number; radius: number }
  | { kind: 'rect'; x: number; y: number; width: number; height: number };

export type LevelConfig = {
  level: Level;
  radius: number;
  fill: string;
  stroke: string;
  label: string;
  textureKey: string;
  parts: readonly ShapePart[];
};

const BASE_SHAPE: readonly ShapePart[] = [
  { kind: 'circle', x: -0.12, y: 0, radius: 0.75 },
  { kind: 'circle', x: 0.12, y: 0, radius: 0.75 },
];

export const LEVELS: readonly LevelConfig[] = [
  { level: 1, radius: 31, fill: '#f9a887', stroke: '#ca654a', label: '#63382d', textureKey: 'level-1', parts: BASE_SHAPE },
  { level: 2, radius: 31, fill: '#9edfd1', stroke: '#4a9f93', label: '#245a53', textureKey: 'level-2', parts: BASE_SHAPE },
  { level: 3, radius: 31, fill: '#a9c9f2', stroke: '#6287bf', label: '#314e7a', textureKey: 'level-3', parts: BASE_SHAPE },
  { level: 4, radius: 31, fill: '#f5d894', stroke: '#b89547', label: '#69542b', textureKey: 'level-4', parts: BASE_SHAPE },
  { level: 5, radius: 43, fill: '#c9e8ea', stroke: '#5f9ca2', label: '#2e5961', textureKey: 'level-5', parts: [
    { kind: 'circle', x: -0.29, y: 0, radius: 0.67 },
    { kind: 'circle', x: 0.29, y: 0, radius: 0.67 },
    { kind: 'rect', x: 0, y: 0, width: 0.76, height: 0.35 },
  ] },
  { level: 6, radius: 55, fill: '#c1dfed', stroke: '#568ca7', label: '#2b5365', textureKey: 'level-6', parts: [
    { kind: 'circle', x: -0.34, y: -0.24, radius: 0.56 },
    { kind: 'circle', x: 0.34, y: 0.24, radius: 0.56 },
    { kind: 'rect', x: 0, y: 0, width: 0.8, height: 0.5 },
  ] },
  { level: 7, radius: 68, fill: '#d6c5ef', stroke: '#8065ac', label: '#50416e', textureKey: 'level-7', parts: [
    { kind: 'circle', x: -0.3, y: -0.38, radius: 0.54 },
    { kind: 'circle', x: 0.3, y: -0.13, radius: 0.54 },
    { kind: 'circle', x: -0.3, y: 0.38, radius: 0.54 },
    { kind: 'circle', x: 0.3, y: 0.18, radius: 0.54 },
  ] },
  { level: 8, radius: 83, fill: '#e3d8ae', stroke: '#a39352', label: '#635935', textureKey: 'level-8', parts: [
    { kind: 'circle', x: -0.3, y: -0.45, radius: 0.48 },
    { kind: 'circle', x: 0.3, y: -0.3, radius: 0.48 },
    { kind: 'circle', x: -0.3, y: 0.05, radius: 0.48 },
    { kind: 'circle', x: 0.3, y: 0.25, radius: 0.48 },
    { kind: 'circle', x: -0.3, y: 0.48, radius: 0.48 },
  ] },
];

export function getSpriteDisplaySize(config: LevelConfig): number {
  return config.radius * 2.1;
}

export function getLevelConfig(level: Level): LevelConfig {
  return LEVELS[level - 1];
}

export function getShapeHalfExtents(config: LevelConfig): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const part of config.parts) {
    const halfWidth = part.kind === 'circle' ? part.radius : part.width / 2;
    const halfHeight = part.kind === 'circle' ? part.radius : part.height / 2;
    x = Math.max(x, Math.abs(part.x) + halfWidth);
    y = Math.max(y, Math.abs(part.y) + halfHeight);
  }
  return { x: x * config.radius, y: y * config.radius };
}

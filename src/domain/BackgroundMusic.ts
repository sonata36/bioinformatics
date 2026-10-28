/** 只在玩家点击开始后播放，浏览器禁止播放时不影响游戏。 */
export class BackgroundMusic {
  private readonly audio = new Audio();
  private muted = false;

  constructor() {
    this.audio.src = window.location.protocol === 'file:'
      ? './assets/audio/overworld.mp3'
      : './audio/overworld.mp3';
    this.audio.loop = true;
    this.audio.preload = 'none';
    this.audio.volume = 0.14;
  }

  play(): void {
    if (!this.muted) void this.audio.play().catch(() => undefined);
  }

  pause(): void {
    this.audio.pause();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.pause();
  }

  close(): void {
    this.pause();
    this.audio.removeAttribute('src');
  }
}

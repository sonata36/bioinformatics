/** End-to-end smoke check against a running local Vite server and Chrome CDP. */
import { writeFile } from 'node:fs/promises';
const url = process.env.CDP_URL ?? 'http://127.0.0.1:9222';
const tabs = await (await fetch(`${url}/json/list`)).json();
const tab = tabs.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:5173'));
if (!tab) throw new Error('Game tab not found');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  const slot = pending.get(message.id);
  if (!slot) return;
  pending.delete(message.id);
  message.error ? slot.reject(new Error(message.error.message)) : slot.resolve(message.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const callId = ++id;
  pending.set(callId, { resolve, reject });
  ws.send(JSON.stringify({ id: callId, method, params }));
});
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pointer = async (x, y) => {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};

await send('Page.enable');
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__bgmPlayCalls = 0;
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    if (this.src.includes('underwater-theme-ii.')) {
      window.__bgmAudio = this;
      window.__bgmPlayCalls += 1;
    }
    return originalPlay.apply(this, args);
  };
` });
await send('Page.reload', { ignoreCache: true });
await wait(1200);
const ready = await evaluate('({disabled:document.getElementById("start-button").disabled, next:document.getElementById("next-value").textContent})');
if (ready.disabled || ready.next !== 'T') throw new Error(`Opening queue is not ready: ${JSON.stringify(ready)}`);
await evaluate('document.getElementById("start-button").click()');
const music = await evaluate('(() => ({calls:window.__bgmPlayCalls,src:window.__bgmAudio?.src,loop:window.__bgmAudio?.loop,volume:window.__bgmAudio?.volume}))()');
if (music.calls !== 1 || !music.src?.endsWith('/audio/underwater-theme-ii.ogg') || !music.loop || music.volume >= .3) {
  throw new Error(`Background music did not start correctly: ${JSON.stringify(music)}`);
}
await evaluate('document.getElementById("mute-toggle").click()');
const muted = await evaluate('({pressed:document.getElementById("mute-toggle").getAttribute("aria-pressed"),paused:window.__bgmAudio.paused})');
if (muted.pressed !== 'true' || !muted.paused) throw new Error(`Mute did not pause music: ${JSON.stringify(muted)}`);
await evaluate('document.getElementById("mute-toggle").click()');
if (await evaluate('window.__bgmPlayCalls') !== 2) throw new Error('Unmute did not resume music');
await wait(350);
const playback = await evaluate('({paused:window.__bgmAudio.paused,error:window.__bgmAudio.error?.code,readyState:window.__bgmAudio.readyState,duration:window.__bgmAudio.duration})');
if (playback.paused || playback.error || playback.readyState < 2 || playback.duration < 100) {
  throw new Error(`Background music could not play: ${JSON.stringify(playback)}`);
}
await evaluate('new Promise((resolve, reject) => { const audio = window.__bgmAudio; audio.addEventListener("seeked", () => resolve(true), {once:true}); audio.currentTime = audio.duration - .25; setTimeout(() => reject(new Error("seek timeout")), 5000); })');
await wait(1300);
const loopPosition = await evaluate('({paused:window.__bgmAudio.paused,currentTime:window.__bgmAudio.currentTime})');
if (loopPosition.paused || loopPosition.currentTime > 2) {
  throw new Error(`Background music did not loop: ${JSON.stringify(loopPosition)}`);
}
await evaluate('document.querySelector("#game-root canvas").scrollIntoView({block:"center"})');
const rect = await evaluate('(() => { const r=document.querySelector("#game-root canvas").getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height*.35}; })()');
await pointer(rect.x, rect.y);
await wait(1300);
await pointer(rect.x, rect.y);
await wait(2300);
const outcome = await evaluate('({score:Number(document.getElementById("score-value").textContent),status:document.getElementById("game-status").textContent,insight:document.getElementById("insight-name").textContent})');
await evaluate('document.querySelector("#quiz-options button").click()');
const quizFeedback = await evaluate('document.getElementById("quiz-feedback").textContent');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await wait(700);
const mobile = await evaluate('({viewport:window.innerWidth, content:document.documentElement.scrollWidth})');
if (process.env.QA_SCREENSHOT) {
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(process.env.QA_SCREENSHOT, Buffer.from(shot.data, 'base64'));
}
ws.close();
if (outcome.score < 32 || outcome.insight !== '1 bp') throw new Error(`First pairing failed: ${JSON.stringify(outcome)}`);
if (!quizFeedback.includes('回答正确')) throw new Error(`Quiz interaction failed: ${quizFeedback}`);
if (mobile.content > mobile.viewport) throw new Error(`Mobile horizontal overflow: ${JSON.stringify(mobile)}`);
console.log(JSON.stringify({ ready, outcome, mobile, quizFeedback }));

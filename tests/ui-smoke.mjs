import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9333;
const profile = await mkdtemp(join(tmpdir(), "hanyue-ui-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--window-size=390,844",
  "http://127.0.0.1:4173"
], { stdio: "ignore" });

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
      const page = pages.find(item => item.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* Chrome is still starting */ }
    await pause(100);
  }
  throw new Error("Chrome debugging endpoint did not start");
}

let sequence = 0;
const pending = new Map();

try {
  const ws = new WebSocket(await waitForDebugger());
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  ws.addEventListener("message", event => {
    const payload = JSON.parse(event.data);
    if (!payload.id || !pending.has(payload.id)) return;
    const { resolve, reject } = pending.get(payload.id);
    pending.delete(payload.id);
    payload.error ? reject(new Error(payload.error.message)) : resolve(payload.result);
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send("Page.reload", { ignoreCache: true });
  await pause(700);
  assert.match(await evaluate("document.title"), /汉跃/);
  assert.equal(await evaluate("window.innerWidth"), 390);
  assert.equal(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), true);
  assert.equal(await evaluate("document.querySelectorAll('.mobile-nav button').length"), 4);
  assert.equal(await evaluate("document.querySelector('.mobile-nav button:last-child').getBoundingClientRect().right <= window.innerWidth"), true);
  assert.equal(await evaluate("document.querySelector('.lesson-label').getBoundingClientRect().right <= window.innerWidth"), true);
  const mobileShot = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile("/private/tmp/hanyue-real-mobile.png", Buffer.from(mobileShot.data, "base64"));
  assert.equal(await evaluate("document.querySelectorAll('[data-lesson]').length"), 8);
  assert.equal(await evaluate("document.querySelector('[data-lesson=\"hello-1\"]').click(); true"), true);
  assert.equal(await evaluate("Boolean(document.querySelector('#lesson-overlay'))"), true);
  assert.match(await evaluate("document.querySelector('.exercise-card h1').textContent"), /你好/);

  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click(); true`);
  const check = () => click(".check-btn");
  const expectCorrect = async () => assert.equal(await evaluate("document.querySelector('.lesson-footer').classList.contains('correct')"), true);

  await click('[data-answer="Hello"]'); await check(); await expectCorrect(); await check();
  await click('[data-answer="你好"]'); await check(); await expectCorrect(); await check();
  await evaluate(`Array.from(document.querySelectorAll('[data-token-index]')).find(b => b.textContent === '再').click(); true`);
  await evaluate(`Array.from(document.querySelectorAll('[data-token-index]')).find(b => b.textContent === '见').click(); true`);
  await check(); await expectCorrect(); await check();
  await click('[data-answer="How are you?"]'); await check(); await expectCorrect(); await check();
  await evaluate(`const i=document.querySelector('#type-answer'); i.value='谢谢'; i.dispatchEvent(new Event('input',{bubbles:true})); true`);
  await check(); await expectCorrect(); await check();

  assert.match(await evaluate("document.querySelector('.result-screen h1').textContent"), /全对/);
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('hanyue-progress-v1')).xp"), 20);
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('hanyue-progress-v1')).dailyBestCombo"), 5);
  await click(".result-done");
  assert.equal(await evaluate("Boolean(document.querySelector('#lesson-overlay'))"), false);
  assert.equal(await evaluate("document.querySelector('[data-lesson=\"identity-1\"]').closest('.lesson-stop').classList.contains('locked')"), false);

  await evaluate(`const s=JSON.parse(localStorage.getItem('hanyue-progress-v1')); s.energy=10; s.mistakes=[{prompt:'选出「你好」的意思',lessonId:'hello-1'}]; localStorage.setItem('hanyue-progress-v1',JSON.stringify(s)); location.reload(); true`);
  await pause(500);
  await click('[data-view="practice"]');
  assert.match(await evaluate("document.querySelector('#mistake-practice h3').textContent"), /1 道题/);
  await click("#mistake-practice");
  assert.match(await evaluate("document.querySelector('.exercise-count').textContent"), /共 3 题/);
  await click('[data-answer="Hello"]'); await check(); await expectCorrect(); await check();
  await click('[data-answer="你好"]'); await check(); await expectCorrect(); await check();
  await evaluate(`Array.from(document.querySelectorAll('[data-token-index]')).find(b => b.textContent === '再').click(); true`);
  await evaluate(`Array.from(document.querySelectorAll('[data-token-index]')).find(b => b.textContent === '见').click(); true`);
  await check(); await expectCorrect(); await check();
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('hanyue-progress-v1')).energy"), 20);
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('hanyue-progress-v1')).mistakes.length"), 0);

  console.log("✓ 首页渲染：8 个课程节点");
  console.log("✓ 手机布局：390px 视口无横向溢出");
  console.log("✓ 第一课：选择、听力、组句、输入题均正确判分");
  console.log("✓ 结课：获得 20 XP，并写入本地进度");
  console.log("✓ 路径：第二课已解锁");
  console.log("✓ 自适应复习：抽取错题，完成后清空错题并恢复 10 点能量");
  ws.close();
} finally {
  chrome.kill("SIGTERM");
}

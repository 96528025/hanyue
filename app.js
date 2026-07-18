import { UNITS, exercisesFor } from "./course.js";
import { loadState, saveState, resetState, calculateStreak, localDay, STORAGE_KEY } from "./state.js";

const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toast-region");
let state = loadState();
let lesson = null;

const icons = {
  learn: `<svg viewBox="0 0 24 24"><path d="M4 5.5 12 3l8 2.5v10L12 21l-8-5.5v-10Z"/><path d="m4 5.5 8 3 8-3M12 8.5V21"/></svg>`,
  practice: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 2v7h-7M8 12l2.5 2.5L16 9"/></svg>`,
  league: `<svg viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H3v2a4 4 0 0 0 5 4M17 6h4v2a4 4 0 0 1-5 4"/></svg>`,
  quest: `<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4V3Z"/><path d="m9 9 2 2 4-4"/></svg>`,
  sound: `<svg viewBox="0 0 24 24"><path d="M5 9v6h4l5 4V5L9 9H5Z"/><path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>`,
  lock: `<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`
};

function persist() { saveState(state); }

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function showToast(message, tone = "dark") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${tone}`;
  toast.textContent = message;
  toastRegion.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 2300);
}

function lessonIndex(id) {
  return UNITS.flatMap(unit => unit.lessons).findIndex(item => item.id === id);
}

function isUnlocked(id) {
  const flat = UNITS.flatMap(unit => unit.lessons);
  const index = flat.findIndex(item => item.id === id);
  return index === 0 || state.completed.includes(flat[index - 1].id) || state.completed.includes(id);
}

function currentLessonId() {
  return UNITS.flatMap(unit => unit.lessons).find(item => !state.completed.includes(item.id))?.id || "review-2";
}

function statBar() {
  const energyPct = Math.max(0, Math.min(100, state.energy * 4));
  return `
    <div class="top-stats" aria-label="学习状态">
      <button class="stat-pill language" aria-label="当前课程：中文"><span>中</span></button>
      <button class="stat-pill" data-view="quests" aria-label="连续学习 ${state.streak} 天"><span class="stat-icon flame">🔥</span><b>${state.streak}</b></button>
      <button class="stat-pill energy" data-view="practice" aria-label="竹能量 ${state.energy}"><span class="energy-ring" style="--energy:${energyPct}%">🎋</span><b>${state.energy}</b></button>
      <button class="stat-pill xp" data-view="league" aria-label="总经验 ${state.xp}"><span>✦</span><b>${state.xp}</b></button>
    </div>`;
}

function sidebar() {
  const items = [
    ["learn", "学习", icons.learn],
    ["practice", "复习", icons.practice],
    ["league", "排行榜", icons.league],
    ["quests", "任务", icons.quest]
  ];
  return `<aside class="sidebar">
    <button class="brand" data-view="learn" aria-label="汉跃首页"><span class="brand-mark">汉</span><span class="brand-name">汉跃<small>HANYUE</small></span></button>
    <nav>${items.map(([id, label, icon]) => `<button class="nav-item ${state.activeView === id ? "active" : ""}" data-view="${id}">${icon}<span>${label}</span>${id === "quests" && state.todayXp < 20 ? '<i class="nav-dot"></i>' : ""}</button>`).join("")}</nav>
    <div class="sidebar-foot"><img src="assets/atao.png" alt="阿桃小熊猫" /><div class="sidebar-foot-copy"><b>阿桃陪你学</b><small>今天也迈一小步</small></div><button class="reset-progress" data-reset-progress>重新开始</button></div>
  </aside>`;
}

function mobileNav() {
  return `<nav class="mobile-nav">
    ${[["learn", icons.learn], ["practice", icons.practice], ["league", icons.league], ["quests", icons.quest]].map(([id, icon]) => `<button class="${state.activeView === id ? "active" : ""}" data-view="${id}">${icon}</button>`).join("")}
  </nav>`;
}

function learnView() {
  return `<main class="main-shell">
    <section class="path-column">
      ${statBar()}
      <div class="welcome-mobile"><span class="brand-mark">汉</span><div><b>晚上好，学习者</b><small>今天也说一句中文吧</small></div></div>
      ${UNITS.map((unit, unitIndex) => unitSection(unit, unitIndex)).join("")}
      <section class="coming-soon"><span>🚄</span><div><small>下一站</small><h3>问路与出行</h3><p>更多真实生活场景正在路上。</p></div></section>
    </section>
    <aside class="right-rail">
      ${dailyCard()}
      <section class="rail-card mascot-card">
        <div><span class="eyebrow">阿桃说</span><h3>${state.todayXp >= 20 ? "今日目标达成！" : "先学一课，再忙别的"}</h3><p>${state.todayXp >= 20 ? "你已经为今天的自己加了一块砖。" : "五分钟很短，但足够学会一句新的中文。"}</p></div>
        <img src="assets/atao.png" alt="阿桃挥手鼓励你" />
      </section>
      <button class="sound-toggle" id="sound-toggle">${icons.sound}<span>发音音效</span><b>${state.sound ? "开启" : "关闭"}</b></button>
    </aside>
  </main>`;
}

function unitSection(unit, unitIndex) {
  return `<section class="unit unit-${unit.color}">
    <header class="unit-header">
      <div><span class="unit-eyebrow">${unit.eyebrow} · 单元 ${unit.id}</span><h2>${unit.title}</h2><p>${unit.description}</p></div>
      <button class="guide-btn" data-guide="${unit.id}" aria-label="打开单元指南">指南 <span>→</span></button>
    </header>
    <div class="path-track" aria-label="${unit.title}课程路径">
      <div class="path-line"></div>
      ${unit.lessons.map((item, index) => lessonNode(item, index, unitIndex)).join("")}
    </div>
  </section>`;
}

function lessonNode(item, index, unitIndex) {
  const complete = state.completed.includes(item.id);
  const unlocked = isUnlocked(item.id);
  const current = currentLessonId() === item.id;
  const offsets = ["0px", "74px", "28px", "-58px"];
  return `<div class="lesson-stop ${complete ? "complete" : ""} ${current ? "current" : ""} ${!unlocked ? "locked" : ""}" style="--offset:${offsets[index]}">
    ${current ? '<div class="start-bubble">下一课在这里 <span>◆</span></div>' : ""}
    <button class="lesson-node ${item.review ? "review-node" : ""}" data-lesson="${item.id}" aria-label="${item.title}${!unlocked ? "，未解锁" : ""}" ${!unlocked ? 'aria-disabled="true"' : ""}>
      <span class="node-top">${complete ? icons.check : !unlocked ? icons.lock : item.icon}</span>
      <span class="node-shadow"></span>
    </button>
    <div class="lesson-label"><b>${item.title}</b><small>${complete ? "已完成 · 再练 +5 XP" : item.subtitle}</small></div>
  </div>`;
}

function dailyCard() {
  const pct = Math.min(100, (state.todayXp / 20) * 100);
  return `<section class="rail-card daily-card">
    <div class="rail-title"><div><span class="eyebrow">每日目标</span><h3>${state.todayXp >= 20 ? "稳稳拿下" : "再前进一点"}</h3></div><span class="goal-badge">${state.todayXp >= 20 ? "✓" : "✦"}</span></div>
    <div class="goal-progress"><span style="width:${pct}%"></span></div>
    <div class="goal-caption"><span>今日经验</span><b>${state.todayXp} / 20 XP</b></div>
  </section>`;
}

function practiceView() {
  const mistakeCount = state.mistakes.length;
  return `<main class="simple-view">
    ${statBar()}
    <header class="view-hero teal-hero"><div><span class="eyebrow">练习馆</span><h1>把不会的，练成会的。</h1><p>针对你的薄弱词汇进行短时复习，同时恢复竹能量。</p></div><div class="hero-glyph">↻</div></header>
    <div class="card-grid">
      <button class="action-card featured" id="mistake-practice"><span class="card-icon">🧩</span><div><small>错题本</small><h3>${mistakeCount ? `${mistakeCount} 道题待复习` : "错题本空空如也"}</h3><p>${mistakeCount ? "完成练习可恢复 10 点竹能量" : "先去完成一节新课吧"}</p></div><span class="card-arrow">→</span></button>
      <button class="action-card" id="energy-practice"><span class="card-icon">🎋</span><div><small>快速热身</small><h3>恢复竹能量</h3><p>3 道基础题 · 约 2 分钟</p></div><span class="card-arrow">→</span></button>
      <button class="action-card" id="listen-practice"><span class="card-icon">🎧</span><div><small>听力</small><h3>听懂日常中文</h3><p>重复播放真实中文发音</p></div><span class="card-arrow">→</span></button>
    </div>
  </main>`;
}

function leagueView() {
  const peers = [
    ["Mina", 148, "🧑🏻‍🎨"], ["Leo", 126, "🧑🏽‍🚀"], ["你", state.xp, "🦊"], ["Sam", 54, "🧑🏼‍🍳"], ["Nora", 38, "👩🏾‍🔬"]
  ].sort((a,b) => b[1] - a[1]);
  return `<main class="simple-view">
    ${statBar()}
    <header class="view-hero coral-hero"><div><span class="eyebrow">本周 · 青铜组</span><h1>一起学，会走得更远。</h1><p>这是本地演示排行榜，完成课程即可提升名次。</p></div><div class="hero-glyph">🏆</div></header>
    <section class="leaderboard">${peers.map((peer, index) => `<div class="leader-row ${peer[0] === "你" ? "you" : ""}"><span class="rank">${index + 1}</span><span class="avatar">${peer[2]}</span><b>${peer[0]}</b><strong>${peer[1]} XP</strong></div>`).join("")}</section>
  </main>`;
}

function questsView() {
  const lessonDone = state.completed.length > 0;
  const quests = [
    ["获得 20 XP", state.todayXp, 20, "✦"],
    ["完成 1 节课", lessonDone ? 1 : 0, 1, "✓"],
    ["保持 3 题连续答对", state.dailyBestCombo, 3, "⚡"]
  ];
  return `<main class="simple-view">
    ${statBar()}
    <header class="view-hero sun-hero"><div><span class="eyebrow">今日任务</span><h1>三件小事，一次完成。</h1><p>任务会在每天凌晨刷新。</p></div><div class="hero-glyph">☀</div></header>
    <section class="quest-list">${quests.map(([name, value, max, icon]) => `<div class="quest-row"><span class="quest-icon">${icon}</span><div><h3>${name}</h3><div class="mini-progress"><span style="width:${Math.min(100, value/max*100)}%"></span></div><small>${value} / ${max}</small></div><b>${value >= max ? "完成" : "+5 XP"}</b></div>`).join("")}</section>
  </main>`;
}

function render() {
  const views = { learn: learnView, practice: practiceView, league: leagueView, quests: questsView };
  app.innerHTML = `<div class="app-layout">${sidebar()}<div class="content">${(views[state.activeView] || learnView)()}</div>${mobileNav()}</div>`;
  bindShellEvents();
}

function bindShellEvents() {
  document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
    state.activeView = button.dataset.view;
    persist(); render(); window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  document.querySelectorAll("[data-lesson]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.lesson;
    if (!isUnlocked(id)) return showToast("先完成前一课，就能解锁这里", "coral");
    if (state.energy <= 0) {
      state.activeView = "practice";
      persist(); render();
      return showToast("竹能量用完了，完成一次热身就能恢复", "coral");
    }
    openLesson(id);
  }));
  document.querySelectorAll("[data-guide]").forEach(button => button.addEventListener("click", () => openGuide(Number(button.dataset.guide))));
  document.querySelector("#sound-toggle")?.addEventListener("click", () => { state.sound = !state.sound; persist(); render(); showToast(state.sound ? "发音已开启" : "发音已关闭"); });
  document.querySelector("[data-reset-progress]")?.addEventListener("click", resetProgress);
  document.querySelector("#mistake-practice")?.addEventListener("click", startPractice);
  document.querySelector("#energy-practice")?.addEventListener("click", startPractice);
  document.querySelector("#listen-practice")?.addEventListener("click", () => {
    state.sound = true; persist(); openLesson("hello-1", true);
  });
}

function resetProgress() {
  if (!window.confirm("确定要清空当前进度吗？这会回到第一课。")) return;
  state = resetState();
  lesson = null;
  document.body.classList.remove("lesson-open");
  document.querySelector("#lesson-overlay")?.remove();
  render();
  showToast("已重新开始", "teal");
}

function openGuide(unitId) {
  const unit = UNITS.find(item => item.id === unitId);
  const phrases = unitId === 1 ? [["你好", "nǐ hǎo", "Hello"], ["我叫…", "wǒ jiào", "My name is…"], ["谢谢", "xiè xie", "Thank you"]] : [["好吃", "hǎo chī", "Delicious"], ["我要…", "wǒ yào", "I want…"], ["茶", "chá", "Tea"]];
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="guide-modal" role="dialog" aria-modal="true" aria-label="${unit.title}指南"><button class="modal-close" aria-label="关闭">${icons.close}</button><span class="eyebrow">单元指南</span><h2>${unit.title}</h2><p>先认识本单元最有用的表达。</p><div class="phrase-list">${phrases.map(([hanzi, pinyin, english]) => `<button data-speak="${hanzi}"><span class="phrase-audio">${icons.sound}</span><b>${hanzi}</b><span>${pinyin}</span><small>${english}</small></button>`).join("")}</div><button class="primary-btn modal-done">知道了</button></section>`;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-speak]").forEach(button => button.addEventListener("click", () => speak(button.dataset.speak)));
  const close = () => modal.remove();
  modal.querySelector(".modal-close").addEventListener("click", close);
  modal.querySelector(".modal-done").addEventListener("click", close);
  modal.addEventListener("click", event => { if (event.target === modal) close(); });
}

function openLesson(id, practice = false) {
  const item = UNITS.flatMap(unit => unit.lessons).find(entry => entry.id === id) || { id, title: "快速练习", xp: 10 };
  lesson = {
    item,
    exercises: exercisesFor(id),
    index: 0,
    selected: null,
    arranged: [],
    status: "answering",
    correct: 0,
    combo: 0,
    bestCombo: 0,
    practice
  };
  document.body.classList.add("lesson-open");
  renderLesson();
}

function renderLesson() {
  let overlay = document.querySelector("#lesson-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "lesson-overlay";
    overlay.className = "lesson-overlay";
    document.body.appendChild(overlay);
  }
  const exercise = lesson.exercises[lesson.index];
  const progress = (lesson.index / lesson.exercises.length) * 100;
  overlay.innerHTML = `<div class="lesson-top"><button class="lesson-close" aria-label="退出课程">${icons.close}</button><div class="lesson-progress"><span style="width:${progress}%"></span></div><div class="lesson-energy">🎋 <b>${state.energy}</b></div></div>
    <main class="exercise-shell">
      <div class="exercise-count">第 ${lesson.index + 1} 题，共 ${lesson.exercises.length} 题</div>
      <section class="exercise-card">
        ${exerciseMarkup(exercise)}
      </section>
    </main>
    <footer class="lesson-footer ${lesson.status}">
      <div class="feedback-message">${lesson.status === "correct" ? `<span class="feedback-icon">✓</span><div><h3>答对了！</h3><p>${exercise.explain}</p></div>` : lesson.status === "wrong" ? `<span class="feedback-icon">×</span><div><h3>再记一下</h3><p>${exercise.explain}</p></div>` : `<span class="keyboard-hint">按 Enter 检查答案</span>`}</div>
      <button class="check-btn" ${canCheck(exercise) ? "" : "disabled"}>${lesson.status === "answering" ? "检查答案" : lesson.index === lesson.exercises.length - 1 ? "查看结果" : "继续"}</button>
    </footer>`;
  bindLessonEvents(exercise);
  if (exercise.type === "listen" && lesson.status === "answering" && state.sound) setTimeout(() => speak(exercise.speak), 250);
}

function exerciseMarkup(exercise) {
  const title = `<h1>${exercise.prompt}</h1>${exercise.hint ? `<p class="exercise-hint">${exercise.hint}</p>` : ""}`;
  if (exercise.type === "choice" || exercise.type === "listen") {
    return `${title}${exercise.type === "listen" ? `<button class="listen-button" data-speak="${exercise.speak}" aria-label="播放发音">${icons.sound}<span>再听一次</span></button>` : ""}<div class="choice-list">${exercise.options.map((option, index) => `<button class="choice ${lesson.selected === option ? "selected" : ""}" data-answer="${escapeHTML(option)}"><span>${index + 1}</span><b>${option}</b></button>`).join("")}</div>`;
  }
  if (exercise.type === "arrange") {
    return `${title}<div class="answer-zone">${lesson.arranged.length ? lesson.arranged.map((token, index) => `<button data-remove="${index}">${token}</button>`).join("") : '<span>点击下方词语组成答案</span>'}</div><div class="token-bank">${exercise.tokens.map((token, index) => `<button data-token-index="${index}" ${lesson.arranged.includes(token) ? "disabled" : ""}>${token}</button>`).join("")}</div>`;
  }
  return `${title}<div class="type-clue"><span>“</span>${exercise.clue}<span>”</span></div><label class="type-label">用中文回答<input id="type-answer" autocomplete="off" autocapitalize="off" placeholder="在这里输入……" value="${escapeHTML(lesson.selected || "")}" /></label>`;
}

function canCheck(exercise) {
  if (lesson.status !== "answering") return true;
  if (exercise.type === "arrange") return lesson.arranged.length > 0;
  return Boolean(lesson.selected?.trim?.() || lesson.selected);
}

function bindLessonEvents(exercise) {
  document.querySelector(".lesson-close")?.addEventListener("click", closeLesson);
  document.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => {
    if (lesson.status !== "answering") return;
    lesson.selected = button.dataset.answer; renderLesson();
  }));
  document.querySelectorAll("[data-token-index]").forEach(button => button.addEventListener("click", () => {
    if (lesson.status !== "answering") return;
    lesson.arranged.push(exercise.tokens[Number(button.dataset.tokenIndex)]); renderLesson();
  }));
  document.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    if (lesson.status !== "answering") return;
    lesson.arranged.splice(Number(button.dataset.remove), 1); renderLesson();
  }));
  document.querySelector("[data-speak]")?.addEventListener("click", button => speak(button.currentTarget.dataset.speak));
  const input = document.querySelector("#type-answer");
  input?.addEventListener("input", event => {
    lesson.selected = event.target.value;
    document.querySelector(".check-btn").disabled = !event.target.value.trim();
  });
  input?.focus();
  document.querySelector(".check-btn")?.addEventListener("click", () => advanceLesson(exercise));
}

function advanceLesson(exercise) {
  if (lesson.status === "answering") {
    const response = exercise.type === "arrange" ? lesson.arranged : lesson.selected;
    const correct = exercise.type === "arrange"
      ? JSON.stringify(response) === JSON.stringify(exercise.answer)
      : exercise.type === "type"
        ? exercise.answers.some(answer => answer.replace(/\s/g, "") === String(response).replace(/\s/g, ""))
        : response === exercise.answer;
    lesson.status = correct ? "correct" : "wrong";
    if (correct) {
      lesson.correct += 1;
      lesson.combo += 1;
      lesson.bestCombo = Math.max(lesson.bestCombo, lesson.combo);
      playTone("correct");
    } else {
      lesson.combo = 0;
      state.energy = Math.max(0, state.energy - 5);
      if (!state.mistakes.some(item => item.prompt === exercise.prompt)) state.mistakes.push({ prompt: exercise.prompt, lessonId: lesson.item.id });
      persist(); playTone("wrong");
    }
    return renderLesson();
  }
  if (lesson.index >= lesson.exercises.length - 1) return finishLesson();
  lesson.index += 1;
  lesson.selected = null;
  lesson.arranged = [];
  lesson.status = "answering";
  renderLesson();
}

function finishLesson() {
  const earned = lesson.practice ? 10 : (lesson.item.xp || 20);
  const firstCompletion = !state.completed.includes(lesson.item.id);
  if (!lesson.practice && firstCompletion) state.completed.push(lesson.item.id);
  state.xp += lesson.practice || firstCompletion ? earned : 5;
  state.todayXp += lesson.practice || firstCompletion ? earned : 5;
  state.todayKey = localDay();
  state.dailyBestCombo = Math.max(state.dailyBestCombo, lesson.bestCombo);
  state.streak = calculateStreak(state.lastStudyDate, state.streak);
  state.lastStudyDate = localDay();
  if (lesson.practice) {
    state.energy = Math.min(25, state.energy + 10);
    state.mistakes = [];
  }
  persist();
  const overlay = document.querySelector("#lesson-overlay");
  overlay.innerHTML = `<main class="result-screen"><div class="confetti" aria-hidden="true">${Array.from({length: 16}, (_,i) => `<i style="--i:${i}"></i>`).join("")}</div><img src="assets/atao.png" alt="阿桃为你庆祝" /><span class="result-kicker">课程完成</span><h1>${lesson.correct === lesson.exercises.length ? "全对，太漂亮了！" : "一步一步，就是进步。"}</h1><p>你完成了「${lesson.item.title}」</p><div class="result-stats"><div><span>✦</span><b>+${lesson.practice || firstCompletion ? earned : 5}</b><small>经验值</small></div><div><span>🎯</span><b>${Math.round((lesson.correct / lesson.exercises.length) * 100)}%</b><small>正确率</small></div><div><span>🔥</span><b>${state.streak}</b><small>连续天数</small></div></div><button class="primary-btn result-done">回到学习路径</button></main>`;
  overlay.querySelector(".result-done").addEventListener("click", () => {
    closeLesson(true);
    state.activeView = "learn"; persist(); render();
    showToast(`获得 ${lesson.practice || firstCompletion ? earned : 5} XP`, "teal");
  });
}

function closeLesson(force = false) {
  if (!force && lesson?.index > 0 && !window.confirm("要退出这节课吗？本次答题进度不会保留。")) return;
  document.querySelector("#lesson-overlay")?.remove();
  document.body.classList.remove("lesson-open");
  lesson = null;
}

function startPractice() {
  const mistakeExercises = state.mistakes
    .map(mistake => exercisesFor(mistake.lessonId).find(exercise => exercise.prompt === mistake.prompt))
    .filter(Boolean);
  const fillers = exercisesFor("hello-1").filter(exercise => !mistakeExercises.some(item => item.prompt === exercise.prompt));
  const adaptiveSet = [...mistakeExercises, ...fillers].slice(0, Math.max(3, Math.min(5, mistakeExercises.length)));
  openLesson("hello-1", true);
  lesson.exercises = adaptiveSet;
  lesson.item = { id: "practice", title: mistakeExercises.length ? "错题复习" : "快速热身", xp: 10 };
  renderLesson();
}

function speak(text) {
  if (!state.sound || !("speechSynthesis" in window)) return showToast("发音已关闭或浏览器暂不支持", "coral");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.8;
  utterance.pitch = 1.05;
  speechSynthesis.speak(utterance);
}

function playTone(type) {
  if (!state.sound) return;
  try {
    const audio = new AudioContext();
    const gain = audio.createGain();
    const oscillator = audio.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(type === "correct" ? 520 : 220, audio.currentTime);
    if (type === "correct") oscillator.frequency.exponentialRampToValueAtTime(760, audio.currentTime + 0.14);
    gain.gain.setValueAtTime(0.07, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.22);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + 0.23);
  } catch { /* sound is enhancement only */ }
}

document.addEventListener("keydown", event => {
  if (!lesson || event.key !== "Enter") return;
  const button = document.querySelector(".check-btn:not(:disabled)");
  if (button) button.click();
});

window.addEventListener("storage", event => {
  if (event.key === STORAGE_KEY) { state = loadState(); render(); }
});

render();

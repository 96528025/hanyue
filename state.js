export const DEFAULT_STATE = {
  completed: [],
  xp: 0,
  todayXp: 0,
  todayKey: "",
  dailyBestCombo: 0,
  energy: 25,
  streak: 0,
  lastStudyDate: "",
  mistakes: [],
  sound: true,
  activeView: "learn"
};

export const STORAGE_KEY = "hanyue-progress-v1";

function createDefaultState() {
  const { completed, mistakes, ...rest } = DEFAULT_STATE;
  return {
    ...rest,
    completed: [...completed],
    mistakes: [...mistakes]
  };
}

export function localDay(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function loadState(storage = localStorage) {
  let saved = {};
  try {
    saved = JSON.parse(storage.getItem(STORAGE_KEY) || "{}");
  } catch {
    saved = {};
  }
  const state = { ...createDefaultState(), ...saved };
  if (state.todayKey !== localDay()) {
    state.todayKey = localDay();
    state.todayXp = 0;
    state.dailyBestCombo = 0;
    state.energy = Math.max(state.energy, 15);
  }
  state.completed = Array.isArray(state.completed) ? [...state.completed] : [];
  state.mistakes = Array.isArray(state.mistakes) ? [...state.mistakes] : [];
  return state;
}

export function saveState(state, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(storage = localStorage) {
  storage.removeItem(STORAGE_KEY);
  return loadState(storage);
}

export function calculateStreak(lastDate, currentStreak, now = new Date()) {
  const today = localDay(now);
  if (!lastDate) return 1;
  if (lastDate === today) return Math.max(1, currentStreak);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return lastDate === localDay(yesterday) ? currentStreak + 1 : 1;
}

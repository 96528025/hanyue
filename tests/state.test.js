import test from "node:test";
import assert from "node:assert/strict";
import { calculateStreak, localDay, loadState, resetState, saveState, STORAGE_KEY } from "../state.js";

function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
}

test("localDay formats a local calendar date", () => {
  assert.equal(localDay(new Date(2026, 6, 9, 23, 30)), "2026-07-09");
});

test("calculateStreak starts, preserves, increments and resets", () => {
  const now = new Date(2026, 6, 10, 9);
  assert.equal(calculateStreak("", 0, now), 1);
  assert.equal(calculateStreak("2026-07-10", 4, now), 4);
  assert.equal(calculateStreak("2026-07-09", 4, now), 5);
  assert.equal(calculateStreak("2026-07-01", 9, now), 1);
});

test("state round-trips through storage", () => {
  const storage = memoryStorage();
  saveState({ xp: 42, completed: ["hello-1"], todayKey: localDay() }, storage);
  const result = loadState(storage);
  assert.equal(result.xp, 42);
  assert.deepEqual(result.completed, ["hello-1"]);
  assert.equal(typeof storage.getItem(STORAGE_KEY), "string");
});

test("resetState clears storage and returns a fresh default", () => {
  const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ xp: 12, completed: ["hello-1"] }) });
  const result = resetState(storage);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.equal(result.xp, 0);
  assert.deepEqual(result.completed, []);
  assert.equal(result.activeView, "learn");
});

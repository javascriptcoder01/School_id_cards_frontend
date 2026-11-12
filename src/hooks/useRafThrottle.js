// useRafThrottle.js — slider / drag updates ek animation frame mein ek baar (form state + preview smooth).
// Unmount par jo baaki hai woh bhej diya jaata hai (aakhri value kabhi nahi khoti).
import { useCallback, useEffect, useRef } from 'react';

/**
 * Har frame mein sirf AAKHRI call (jaise slider ki value).
 * @param {(...args: any[]) => void} fn
 */
export const useRafLatest = (fn) => {
  const ref = useRef({ frame: 0, args: null, fn });
  // Naya fn render ke baad (calls hamesha event handlers mein, render ke baad hote hain)
  useEffect(() => {
    ref.current.fn = fn;
  }, [fn]);
  const flush = useCallback(() => {
    const state = ref.current;
    state.frame = 0;
    if (state.args) {
      const args = state.args;
      state.args = null;
      state.fn(...args);
    }
  }, []);
  useEffect(
    () => () => {
      cancelAnimationFrame(ref.current.frame);
      flush();
    },
    [flush]
  );
  return useCallback(
    (...args) => {
      ref.current.args = args;
      if (!ref.current.frame) ref.current.frame = requestAnimationFrame(flush);
    },
    [flush]
  );
};

/**
 * Ek hi key (jaise layer id) ke patches ek frame mein jud kar ek baar. Doosri key aaye to pehli turant bhejo.
 * @param {(key: string, patch: object) => void} fn
 */
export const useRafMergedPatch = (fn) => {
  const ref = useRef({ frame: 0, key: null, patch: null, fn });
  useEffect(() => {
    ref.current.fn = fn;
  }, [fn]);
  const flush = useCallback(() => {
    const state = ref.current;
    cancelAnimationFrame(state.frame);
    state.frame = 0;
    if (state.patch) {
      const { key, patch } = state;
      state.key = null;
      state.patch = null;
      state.fn(key, patch);
    }
  }, []);
  useEffect(() => () => flush(), [flush]);
  return useCallback(
    (key, patch) => {
      const state = ref.current;
      if (state.patch && state.key !== key) flush();
      state.key = key;
      state.patch = { ...(state.patch || {}), ...patch };
      if (!state.frame) state.frame = requestAnimationFrame(flush);
    },
    [flush]
  );
};

export default { useRafLatest, useRafMergedPatch };

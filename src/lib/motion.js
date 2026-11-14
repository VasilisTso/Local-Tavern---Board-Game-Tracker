// Motion tokens (DESIGN.md › Motion). framer-motion only; every user of these must also
// check `useReducedMotion()` and fall back to `fade`.

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export const DURATION = { fast: 0.12, base: 0.2, slow: 0.32 };

export const SPRING = {
  /** Objects landing on a board. */
  settle: { type: 'spring', stiffness: 380, damping: 30 },
  /** Spine lift and pull-out. */
  pull: { type: 'spring', stiffness: 520, damping: 34 },
  /** Sheets and dialogs. */
  sheet: { type: 'spring', stiffness: 300, damping: 32 },
};

/** Reduced-motion stand-in: a short opacity fade, never movement. */
export const fade = { duration: 0.15, ease: 'linear' };

/** Per-object stagger, capped so a long board never waits more than 320ms. */
export const STAGGER = 0.024;
export const STAGGER_CAP = 0.32;
export const staggerDelay = (index) => Math.min(index * STAGGER, STAGGER_CAP);

/** Objects dropping onto a board, staggered left to right. */
export function dropIn(index, reduceMotion) {
  if (reduceMotion) return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: fade };
  return {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { ...SPRING.settle, delay: staggerDelay(index), opacity: { duration: DURATION.base, delay: staggerDelay(index) } },
  };
}

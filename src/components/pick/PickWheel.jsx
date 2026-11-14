import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useAnimate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronDown, Dices, RotateCcw, Shuffle } from 'lucide-react';
import Cover from '../covers/Cover';
import { coverFor } from '../../lib/cover';
import { formatLength, formatPlayers } from '../../lib/format';
import { kindLine } from '../../lib/shelf';
import { DURATION, SPRING, WHEEL, exit, fade } from '../../lib/motion';
import {
  MAX_SLICES,
  layoutSlices,
  polar,
  sampleItems,
  sectorPath,
  seededRandom,
  sliceIndexAt,
  spinTarget,
  wrapLabel,
} from '../../lib/wheel';
import { btnPrimary, btnSecondary } from '../ui';

const SIZE = 320;
const C = SIZE / 2;
const R = 156;
const RIM = 11;
const FACE = R - RIM;
const HUB = 30;
// canvas-confetti needs hex: amber plus a few object hues (vermilion, cobalt, mustard, bottle, linen).
const CONFETTI = ['#e8a93b', '#f3c56b', '#d4523a', '#3f6fb5', '#d9b23a', '#3f7a52', '#f2e6cf'];

function WheelFace({ slices, winnerId, gradientId }) {
  const base = slices.length <= 6 ? 15 : slices.length <= 10 ? 13 : 11.5;
  const labelEnd = FACE - 9;
  const labelSpace = labelEnd - HUB - 10;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block size-full" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--wood-top)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--wood-face)' }} />
          <stop offset="1" style={{ stopColor: 'var(--wood-edge)' }} />
        </linearGradient>
      </defs>
      {/* Wood rim, with a peg at every slice edge for the pointer to tick against. */}
      <circle cx={C} cy={C} r={R} fill={`url(#${gradientId})`} />
      <circle cx={C} cy={C} r={FACE + 0.5} fill="none" style={{ stroke: 'var(--wood-edge)' }} strokeWidth="1.5" />
      {slices.map((s) => {
        const cover = coverFor(s.item.title, s.item.color);
        // Text height must fit the slice width at mid-radius.
        const room = ((HUB + labelEnd) / 2) * ((Math.min(s.sweep, 120) * Math.PI) / 180);
        const size = Math.min(base, room * 0.62);
        const flip = s.mid > 180;
        const maxChars = Math.floor(labelSpace / (size * 0.56));
        const lineHeight = size * 1.15;
        const lines = wrapLabel(s.item.title, maxChars, room * 0.62 >= lineHeight * 2.2 ? 2 : 1);
        const dimmed = winnerId && winnerId !== s.item.id;
        return (
          <g key={s.item.id} style={{ opacity: dimmed ? 0.4 : 1, transition: 'opacity 240ms ease-out' }}>
            <path d={sectorPath(C, C, 0, FACE, s.start, s.end)} fill={cover.base} className="stroke-bg" strokeWidth="1.25" />
            <path d={sectorPath(C, C, FACE - 6, FACE, s.start, s.end)} fill={cover.spine} />
            {size >= 8 && (
              <text
                transform={`rotate(${flip ? s.mid + 90 : s.mid - 90} ${C} ${C})`}
                x={flip ? C - labelEnd : C + labelEnd}
                y={C}
                textAnchor={flip ? 'start' : 'end'}
                dominantBaseline="central"
                fill={cover.ink}
                fontSize={size}
                fontWeight="600"
                className="font-sans"
              >
                {lines.map((line, i) => (
                  <tspan key={i} x={flip ? C - labelEnd : C + labelEnd} dy={i === 0 ? (-(lines.length - 1) * lineHeight) / 2 : lineHeight}>
                    {line}
                  </tspan>
                ))}
              </text>
            )}
          </g>
        );
      })}
      {slices.length > 1 &&
        slices.map((s) => {
          const [x, y] = polar(C, C, R - RIM / 2, s.start);
          return (
            <circle
              key={`peg-${s.item.id}`}
              cx={x}
              cy={y}
              r="2.6"
              style={{ fill: 'var(--wood-top)', stroke: 'var(--wood-edge)' }}
              strokeWidth="1"
            />
          );
        })}
    </svg>
  );
}

/** Static center hub, drawn over the spinning face. */
function Hub() {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
      <circle cx={C} cy={C} r={HUB} className="fill-surface stroke-line-strong" strokeWidth="1.5" />
      <circle cx={C} cy={C} r={HUB - 8} fill="none" className="stroke-accent" strokeWidth="2" />
      <circle cx={C} cy={C} r="4" className="fill-accent" />
    </svg>
  );
}

function Pointer({ rotate }) {
  return (
    <motion.svg
      viewBox="0 0 28 36"
      aria-hidden="true"
      style={{ rotate, transformOrigin: '50% 22%' }}
      className="pointer-events-none absolute -top-2 left-1/2 z-10 -ml-[14px] h-9 w-7 drop-shadow-[0_2px_2px_oklch(0.1_0.02_55/0.45)]"
    >
      <path d="M14 34 L3 10 A11 11 0 1 1 25 10 Z" className="fill-accent-fill stroke-bg" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="14" cy="9" r="3.4" className="fill-on-accent" />
    </motion.svg>
  );
}

/** The winner: its real cover flies out of the slice under the pointer and lands in the card. */
function Result({ item, getOrigin, actions }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const [coverRef, animateCover] = useAnimate();
  const meta = [kindLine(item), formatPlayers(item.minPlayers, item.maxPlayers), formatLength(item)].filter(Boolean);

  useLayoutEffect(() => {
    const el = coverRef.current;
    const origin = getOrigin();
    if (reduceMotion || !el || !origin) {
      if (el) animateCover(el, { opacity: 1 }, fade);
      return;
    }
    const rect = el.getBoundingClientRect();
    const dx = origin.x - (rect.left + rect.width / 2);
    const dy = origin.y - (rect.top + rect.height / 2);
    animateCover(
      el,
      { x: [dx, 0], y: [dy, 0], scale: [0.3, 1], rotate: [-16, 0], opacity: [0, 1] },
      { ...SPRING.fly, opacity: { duration: DURATION.fast } },
    );
    // Runs once per winner; the card is keyed by item id.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On a phone the result lands under the wheel; bring it into view without jumping if it already is.
  useEffect(() => {
    const id = setTimeout(
      () => ref.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }),
      reduceMotion ? 0 : 380,
    );
    return () => clearTimeout(id);
  }, [reduceMotion]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: reduceMotion ? fade : { duration: DURATION.base } }}
      exit={{ opacity: 0, transition: exit }}
      className="flex gap-4 rounded-md border border-accent bg-raised p-4 sm:gap-5"
    >
      <div ref={coverRef} style={{ opacity: 0, filter: 'var(--obj-pulled)' }} className="relative z-20 shrink-0 self-start">
        <Cover item={item} className="w-24 sm:w-32" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-3xl leading-[1.05] font-extrabold break-words text-ink sm:text-4xl">{item.title}</p>
        {item.creator && <p className="mt-1 text-sm text-ink">{item.creator}</p>}
        <p className="tabular mt-1 text-sm text-muted">{meta.join(' · ')}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>
      </div>
    </motion.div>
  );
}

/**
 * The picker wheel over a pool of items.
 * @param {object} props
 * @param {object[]} props.pool items that may land, before skips (never empty)
 * @param {(item: object) => number} props.weightOf slice weight
 * @param {string} props.resetKey changes when the filters change; clears the result
 * @param {(item: object) => React.ReactNode} props.renderActions buttons under the winner (look the item up fresh)
 */
export default function PickWheel({ pool, weightOf, resetKey, renderActions }) {
  const uid = useId();
  const gradientId = `wood-${uid.replace(/[^a-zA-Z0-9]/g, '')}`;
  const reduceMotion = useReducedMotion();
  const [skips, setSkips] = useState([]);
  const [seed, setSeed] = useState(() => Math.random());
  const [spinning, setSpinning] = useState(false);
  // The result belongs to one filter setting; changing filters (resetKey) drops it.
  const [result, setResult] = useState(null);

  const rotation = useMotionValue(0);
  const pointer = useMotionValue(0);
  const wheelRef = useRef(null);
  const spinRef = useRef(null);
  const lastIndex = useRef(-1);

  const candidates = useMemo(() => pool.filter((item) => !skips.includes(item.id)), [pool, skips]);
  const skippedInPool = pool.length - candidates.length;

  const slices = useMemo(() => {
    const picked = new Set(sampleItems(candidates, MAX_SLICES, weightOf, seededRandom(seed)).map((i) => i.id));
    return layoutSlices(
      candidates.filter((i) => picked.has(i.id)),
      weightOf,
    );
  }, [candidates, weightOf, seed]);
  const hidden = candidates.length - slices.length;

  const winner = result && result.key === resetKey ? result.item : null;
  // Keep showing the winner even if acting on it (say, starting it) moves it out of the pool.
  const liveWinner = winner ? (pool.find((i) => i.id === winner.id) ?? winner) : null;

  const slicesRef = useRef(slices);
  useEffect(() => {
    slicesRef.current = slices;
  }, [slices]);

  useEffect(() => () => spinRef.current?.stop(), []);

  // Pointer flicks each time a peg passes under it.
  useMotionValueEvent(rotation, 'change', (value) => {
    const index = sliceIndexAt(slicesRef.current, value);
    if (index === lastIndex.current) return;
    lastIndex.current = index;
    if (spinRef.current && slicesRef.current.length > 1) {
      animate(pointer, [WHEEL.tickAngle, 0], WHEEL.tick);
    }
  });

  const clear = () => setResult(null);

  // Where the winner sits: just under the pointer at the top of the wheel.
  const getOrigin = () => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.22 };
  };

  const celebrate = () => {
    const origin = getOrigin();
    if (reduceMotion || !origin) return;
    confetti({
      particleCount: 80,
      spread: 75,
      startVelocity: 32,
      gravity: 0.9,
      ticks: 160,
      scalar: 0.85,
      colors: CONFETTI,
      origin: { x: origin.x / window.innerWidth, y: origin.y / window.innerHeight },
      disableForReducedMotion: true,
    });
  };

  const finish = () => {
    spinRef.current = null;
    setSpinning(false);
    const index = sliceIndexAt(slicesRef.current, rotation.get());
    const item = slicesRef.current[index]?.item;
    if (item) {
      setResult({ item, key: resetKey });
      celebrate();
    }
  };

  const spin = () => {
    if (spinning || slices.length === 0) return;
    clear();
    const target = spinTarget(rotation.get());
    if (reduceMotion) {
      rotation.set(target);
      finish();
      return;
    }
    setSpinning(true);
    spinRef.current = animate(rotation, target, { ...WHEEL.spin, onComplete: finish });
  };

  const toggleSkip = (id) => {
    clear();
    setSkips((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const clearSkips = () => {
    clear();
    setSkips([]);
  };

  const showWinner = liveWinner && !spinning;

  return (
    <section aria-label="Picker wheel" className="rounded-md border border-line bg-surface p-4 sm:p-5">
      <div className="flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1">
        <p className="tabular text-sm text-muted">
          {hidden > 0 ? `${slices.length} of ${candidates.length}` : slices.length} on the wheel
          {skippedInPool > 0 && ` · ${skippedInPool} skipped`}
        </p>
        {hidden > 0 && (
          <button
            type="button"
            disabled={spinning}
            onClick={() => {
              clear();
              setSeed(Math.random());
            }}
            title={`The wheel holds ${MAX_SLICES}. Reshuffle to draw a different ${MAX_SLICES}.`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-accent hover:bg-raised disabled:opacity-50"
          >
            <Shuffle aria-hidden="true" className="size-3.5" />
            Reshuffle
          </button>
        )}
      </div>

      {candidates.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-line-strong px-5 py-10 text-center">
          <p className="font-display text-xl font-bold">Everything is skipped</p>
          <p className="mx-auto mt-1 max-w-xs text-muted">Bring something back to spin.</p>
          <button type="button" onClick={clearSkips} className={`${btnSecondary} mt-4`}>
            Clear skips
          </button>
        </div>
      ) : (
        <>
          <div ref={wheelRef} className="relative mx-auto mt-4 aspect-square w-full max-w-[24rem]">
            {/* Clip so the rotated square never widens the page. */}
            <div className="absolute inset-0 overflow-hidden rounded-full" style={{ filter: 'var(--obj-contact)' }}>
              <motion.div style={{ rotate: rotation }} className={`size-full ${spinning ? 'will-change-transform' : ''}`}>
                <WheelFace slices={slices} winnerId={showWinner ? liveWinner.id : null} gradientId={gradientId} />
              </motion.div>
            </div>
            <Hub />
            <Pointer rotate={pointer} />
            <ul className="sr-only" aria-label="On the wheel">
              {slices.map((s) => (
                <li key={s.item.id}>{s.item.title}</li>
              ))}
            </ul>
          </div>

          {/* After a spin the result's action is the one amber button; spinning again steps back. */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={spin}
              aria-disabled={spinning || undefined}
              className={`${showWinner ? btnSecondary : btnPrimary} h-12 min-w-44 px-6 text-base ${spinning ? 'opacity-70' : ''}`}
            >
              {showWinner ? <RotateCcw aria-hidden="true" className="size-5" /> : <Dices aria-hidden="true" className="size-5" />}
              {spinning ? 'Spinning…' : showWinner ? 'Spin again' : 'Spin'}
            </button>
          </div>
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {spinning ? 'Spinning.' : showWinner ? `The wheel picked ${liveWinner.title}.` : ''}
      </p>

      <div className="mt-5 empty:hidden">
        <AnimatePresence mode="wait">
          {showWinner && <Result key={liveWinner.id} item={liveWinner} getOrigin={getOrigin} actions={renderActions(liveWinner)} />}
        </AnimatePresence>
      </div>

      {pool.length > 1 && (
        <details className="group mt-5 border-t border-line pt-4">
          <summary className="flex min-h-10 items-center justify-between gap-2 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span>
              Leave some out
              {skippedInPool > 0 && <span className="tabular ml-1.5 font-normal text-muted">{skippedInPool} skipped</span>}
            </span>
            <ChevronDown aria-hidden="true" className="size-4 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="mb-2 text-sm text-muted">Tap anything you're not in the mood for. It stays off until you tap it again.</p>
          <ul className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">
            {pool.map((item) => {
              const skipped = skips.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={spinning}
                    aria-pressed={skipped}
                    onClick={() => toggleSkip(item.id)}
                    className={`inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors duration-150 ${
                      skipped
                        ? 'border-danger bg-raised text-danger line-through decoration-1'
                        : 'border-line text-muted hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>
          {skippedInPool > 0 && (
            <button
              type="button"
              disabled={spinning}
              onClick={clearSkips}
              className="mt-3 min-h-10 text-sm font-semibold text-accent underline underline-offset-4 hover:no-underline"
            >
              Clear skips
            </button>
          )}
        </details>
      )}
    </section>
  );
}

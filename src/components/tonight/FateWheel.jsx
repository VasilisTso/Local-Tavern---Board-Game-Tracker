import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronDown, Dices, Lock, RotateCcw, Shuffle } from 'lucide-react';
import GameCover from '../GameCover';
import { coverFor } from '../../lib/cover';
import { formatPlayers, formatPlaytime } from '../../lib/format';
import {
  MAX_SLICES,
  dustWeight,
  layoutSlices,
  sampleGames,
  sectorPath,
  seededRandom,
  sliceIndexAt,
  spinTarget,
  wheelPool,
  wrapLabel,
} from '../../lib/wheel';
import { btnPrimary, btnSecondary, chip } from '../ui';

const SIZE = 320;
const C = SIZE / 2;
const R = 152;
const HUB = 30;
const RIM = 7;
const SPIN_EASE = [0.12, 0.72, 0.1, 1];
// canvas-confetti needs hex: candle amber, oxblood, moss, parchment.
const CONFETTI = ['#e8a93b', '#f3c56b', '#b5463c', '#8fb36a', '#f2e6cf'];

function WheelFace({ slices }) {
  const base = slices.length <= 6 ? 15 : slices.length <= 10 ? 13 : 11.5;
  const labelEnd = R - RIM - 8;
  const labelSpace = labelEnd - HUB - 10;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block size-full" aria-hidden="true">
      <circle cx={C} cy={C} r={R + 4} className="fill-raised stroke-line-strong" strokeWidth="1" />
      {slices.map((s) => {
        const cover = coverFor(s.game.title, s.game.color);
        // Text height must fit the slice width at mid-radius.
        const room = ((HUB + labelEnd) / 2) * ((Math.min(s.sweep, 120) * Math.PI) / 180);
        const size = Math.min(base, room * 0.62);
        const flip = s.mid > 180;
        const maxChars = Math.floor(labelSpace / (size * 0.56));
        const lineHeight = size * 1.15;
        const lines = wrapLabel(s.game.title, maxChars, room * 0.62 >= lineHeight * 2.2 ? 2 : 1);
        return (
          <g key={s.game.id}>
            <path d={sectorPath(C, C, 0, R, s.start, s.end)} fill={cover.base} className="stroke-bg" strokeWidth="1.5" />
            <path d={sectorPath(C, C, R - RIM, R, s.start, s.end)} fill={cover.spine} />
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
                  <tspan
                    key={i}
                    x={flip ? C - labelEnd : C + labelEnd}
                    dy={i === 0 ? (-(lines.length - 1) * lineHeight) / 2 : lineHeight}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Static center hub and the pointer, drawn over the spinning face. */
function Hub() {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
      <circle cx={C} cy={C} r={HUB} className="fill-surface stroke-line-strong" strokeWidth="1.5" />
      <circle cx={C} cy={C} r={HUB - 7} fill="none" className="stroke-accent" strokeWidth="2" />
      {[
        [-7, -7],
        [0, 0],
        [7, 7],
      ].map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} cx={C + dx} cy={C + dy} r="2.6" className="fill-accent" />
      ))}
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

function Result({ game, onLock, onRespin }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const playtime = formatPlaytime(game.playtime);

  // On a phone the result lands under the wheel; bring it into view without jumping if it already is.
  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [reduceMotion]);

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      className="flex gap-4 rounded-md border border-accent bg-raised p-4"
    >
      <motion.div
        initial={reduceMotion ? false : { rotate: -8, y: 8, opacity: 0 }}
        animate={{ rotate: 0, y: 0, opacity: 1, transition: { delay: 0.08, type: 'spring', stiffness: 260, damping: 18 } }}
        className="shrink-0 self-start"
      >
        <GameCover title={game.title} color={game.color} className="aspect-[3/4] w-16 sm:w-20" monogramClassName="text-3xl" />
      </motion.div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-2xl leading-tight font-bold text-ink">{game.title}</p>
        <p className="tabular mt-1 text-sm text-muted">
          <span className="font-semibold text-accent">The fates choose</span>
          {' · '}
          {formatPlayers(game.minPlayers, game.maxPlayers)}
          {playtime && ` · ${playtime}`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => onLock(game)} className={btnPrimary}>
            <Lock aria-hidden="true" className="size-4" />
            Lock in for tonight
          </button>
          <button type="button" onClick={onRespin} className={btnSecondary}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Spin again
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FateWheel({ games, playStats, count, countWithMaybes, onLock }) {
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const [source, setSource] = useState('fits');
  const [favorDust, setFavorDust] = useState(true);
  const [vetoes, setVetoes] = useState([]);
  const [seed, setSeed] = useState(() => Math.random());
  const [now] = useState(() => Date.now());
  const [spinning, setSpinning] = useState(false);
  const [resultId, setResultId] = useState(null);

  const rotation = useMotionValue(0);
  const pointer = useMotionValue(0);
  const wheelRef = useRef(null);
  const spinRef = useRef(null);
  const lastIndex = useRef(-1);

  const hasMaybes = countWithMaybes > count;
  const activeSource = source === 'maybes' && !hasMaybes ? 'fits' : source;

  const pool = useMemo(
    () => wheelPool(games, activeSource, { count, countWithMaybes }),
    [games, activeSource, count, countWithMaybes],
  );
  const candidates = useMemo(() => pool.filter((g) => !vetoes.includes(g.id)), [pool, vetoes]);
  const vetoedInPool = pool.length - candidates.length;

  const slices = useMemo(() => {
    const weightOf = favorDust ? (g) => dustWeight(playStats.get(g.id)?.last, now) : () => 1;
    const picked = new Set(sampleGames(candidates, MAX_SLICES, weightOf, seededRandom(seed)).map((g) => g.id));
    return layoutSlices(
      candidates.filter((g) => picked.has(g.id)),
      weightOf,
    );
  }, [candidates, favorDust, playStats, now, seed]);
  const hidden = candidates.length - slices.length;

  const slicesRef = useRef(slices);
  useEffect(() => {
    slicesRef.current = slices;
  }, [slices]);

  useEffect(() => () => spinRef.current?.stop(), []);

  // Pointer flicks each time a slice edge passes under it.
  useMotionValueEvent(rotation, 'change', (value) => {
    const index = sliceIndexAt(slicesRef.current, value);
    if (index === lastIndex.current) return;
    lastIndex.current = index;
    if (spinRef.current && slicesRef.current.length > 1) {
      animate(pointer, [-24, 0], { duration: 0.22, ease: 'easeOut' });
    }
  });

  const result = resultId ? slices.find((s) => s.game.id === resultId)?.game : null;

  const reset = () => setResultId(null);

  const celebrate = () => {
    if (reduceMotion || !wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    confetti({
      particleCount: 80,
      spread: 75,
      startVelocity: 32,
      gravity: 0.9,
      ticks: 160,
      scalar: 0.85,
      colors: CONFETTI,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height * 0.15) / window.innerHeight,
      },
      disableForReducedMotion: true,
    });
  };

  const finish = () => {
    spinRef.current = null;
    setSpinning(false);
    const index = sliceIndexAt(slicesRef.current, rotation.get());
    const game = slicesRef.current[index]?.game;
    if (game) {
      setResultId(game.id);
      celebrate();
    }
  };

  const spin = () => {
    if (spinning || slices.length === 0) return;
    setResultId(null);
    const target = spinTarget(rotation.get());
    if (reduceMotion) {
      rotation.set(target);
      finish();
      return;
    }
    setSpinning(true);
    spinRef.current = animate(rotation, target, {
      duration: 4.4,
      ease: SPIN_EASE,
      onComplete: finish,
    });
  };

  const toggleVeto = (id) => {
    reset();
    setVetoes((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const sources = [
    { id: 'fits', label: `Seats ${count}` },
    ...(hasMaybes ? [{ id: 'maybes', label: `Seats ${countWithMaybes} with maybes` }] : []),
    { id: 'shelf', label: 'Whole shelf' },
  ];

  let empty = null;
  if (games.length === 0) {
    empty = {
      title: 'No games to spin',
      body: 'Add games to the shelf and they land on the wheel.',
      actions: [{ label: 'Go to the shelf', href: '#shelf' }],
    };
  } else if (pool.length === 0) {
    empty = {
      title: `Nothing seats ${activeSource === 'maybes' ? countWithMaybes : count}`,
      body: 'No game on the shelf fits that many players.',
      actions: [
        ...(hasMaybes && activeSource === 'fits'
          ? [{ label: `Try ${countWithMaybes} with maybes`, onClick: () => setSource('maybes') }]
          : []),
        { label: 'Spin the whole shelf', onClick: () => setSource('shelf') },
      ],
    };
  } else if (candidates.length === 0) {
    empty = {
      title: 'Everything is vetoed',
      body: 'Someone has to give way.',
      actions: [{ label: 'Clear vetoes', onClick: () => setVetoes([]) }],
    };
  }

  return (
    <section aria-labelledby={`${uid}-heading`} className="rounded-md border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={`${uid}-heading`} className="font-display text-xl font-bold">
          The Fate Wheel
        </h3>
        <p className="tabular text-sm text-muted empty:hidden">
          {games.length > 0 && `${slices.length} on the wheel`}
          {hidden > 0 && ` · ${hidden} more off it`}
        </p>
      </div>

      {games.length > 0 && (
        <fieldset disabled={spinning} className="mt-4 space-y-3">
          <legend className="sr-only">Wheel options</legend>
          <div role="radiogroup" aria-label="Games on the wheel" className="flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <label key={s.id} className="relative">
                <input
                  type="radio"
                  name={`${uid}-source`}
                  value={s.id}
                  checked={activeSource === s.id}
                  onChange={() => {
                    reset();
                    setSource(s.id);
                  }}
                  className="peer sr-only"
                />
                <span className={chip}>{s.label}</span>
              </label>
            ))}
          </div>
          <label className="flex min-h-10 items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={favorDust}
              onChange={(e) => {
                reset();
                setFavorDust(e.target.checked);
              }}
              className="size-4"
            />
            Favor games gathering dust
            <span className="text-muted">(bigger slice)</span>
          </label>
        </fieldset>
      )}

      {empty ? (
        <div className="mt-4 rounded-md border border-dashed border-line-strong px-5 py-10 text-center">
          <p className="font-display text-xl font-bold">{empty.title}</p>
          <p className="mx-auto mt-1 max-w-xs text-muted">{empty.body}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {empty.actions.map((a) =>
              a.href ? (
                <a key={a.label} href={a.href} className={`${btnSecondary} no-underline`}>
                  {a.label}
                </a>
              ) : (
                <button key={a.label} type="button" onClick={a.onClick} className={btnSecondary}>
                  {a.label}
                </button>
              ),
            )}
          </div>
        </div>
      ) : (
        <>
          <div ref={wheelRef} className="relative mx-auto mt-5 aspect-square w-full max-w-[22rem]">
            {/* Clip so the rotated square never widens the page. */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <motion.div style={{ rotate: rotation }} className={`size-full ${spinning ? 'will-change-transform' : ''}`}>
                <WheelFace slices={slices} />
              </motion.div>
            </div>
            <Hub />
            <Pointer rotate={pointer} />
            <ul className="sr-only" aria-label="Games on the wheel">
              {slices.map((s) => (
                <li key={s.game.id}>{s.game.title}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={spin}
              aria-disabled={spinning || undefined}
              className={`${btnPrimary} h-12 min-w-44 px-6 text-base ${spinning ? 'opacity-70' : ''}`}
            >
              <Dices aria-hidden="true" className="size-5" />
              {spinning ? 'The wheel turns…' : 'Spin the wheel'}
            </button>
            {hidden > 0 && (
              <button
                type="button"
                disabled={spinning}
                onClick={() => {
                  reset();
                  setSeed(Math.random());
                }}
                className={btnSecondary}
              >
                <Shuffle aria-hidden="true" className="size-4" />
                Reshuffle
              </button>
            )}
          </div>
          {hidden > 0 && (
            <p className="tabular mt-2 text-center text-sm text-muted">
              The wheel holds {MAX_SLICES}. {hidden} other {hidden === 1 ? 'game sits' : 'games sit'} out this
              round; reshuffle to draw again.
            </p>
          )}
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {spinning ? 'Spinning.' : result ? `The wheel chose ${result.title}.` : ''}
      </p>

      <div className="mt-5 empty:hidden">
        <AnimatePresence mode="wait">
          {result && !spinning && <Result key={result.id} game={result} onLock={onLock} onRespin={spin} />}
        </AnimatePresence>
      </div>

      {pool.length > 1 && (
        <details className="group mt-5 border-t border-line pt-4">
          <summary className="flex min-h-10 items-center justify-between gap-2 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span>
              Vetoes
              <span className="tabular ml-1.5 font-normal text-muted">
                {vetoedInPool ? `${vetoedInPool} off the table` : 'none yet'}
              </span>
            </span>
            <ChevronDown aria-hidden="true" className="size-4 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="mb-2 text-sm text-muted">Tap a game nobody wants tonight. It stays off the wheel until you tap it again.</p>
          <ul className="flex flex-wrap gap-1.5">
            {pool.map((g) => {
              const vetoed = vetoes.includes(g.id);
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    disabled={spinning}
                    aria-pressed={vetoed}
                    onClick={() => toggleVeto(g.id)}
                    className={`inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors duration-150 ${
                      vetoed
                        ? 'border-danger bg-raised text-danger line-through decoration-1'
                        : 'border-line text-muted hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    {g.title}
                  </button>
                </li>
              );
            })}
          </ul>
          {vetoedInPool > 0 && (
            <button
              type="button"
              disabled={spinning}
              onClick={() => {
                reset();
                setVetoes([]);
              }}
              className="mt-3 min-h-10 text-sm font-semibold text-accent underline underline-offset-4 hover:no-underline"
            >
              Clear vetoes
            </button>
          )}
        </details>
      )}
    </section>
  );
}

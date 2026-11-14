import { Star } from 'lucide-react';
import { MAX_RATING } from '../../lib/kinds';

const STARS = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

/** Read-only stars, e.g. "4 out of 5". */
export function RatingStars({ value, className = '' }) {
  return (
    <span role="img" aria-label={`Rated ${value} out of ${MAX_RATING}`} className={`inline-flex gap-px text-accent ${className}`}>
      {STARS.map((n) => (
        <Star key={n} aria-hidden="true" className={`size-3.5 ${n <= value ? 'fill-current' : 'opacity-35'}`} />
      ))}
    </span>
  );
}

/**
 * Rating input: a radio group of five stars plus "No rating". Arrow keys move between stars
 * (native radio behaviour); each star is a 36px target.
 */
export function RatingInput({ name, value, onChange, legend = 'Rating', legendClassName = '' }) {
  return (
    <fieldset>
      <legend className={legendClassName}>
        {legend}
        <span className="font-normal text-muted"> · {value ? `${value} of ${MAX_RATING}` : 'none'}</span>
      </legend>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <div className="flex">
          {STARS.map((n) => (
            <label key={n} className="relative">
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="peer sr-only"
              />
              <span className="sr-only">{n === 1 ? '1 star' : `${n} stars`}</span>
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-md text-accent transition-transform duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-accent hover:scale-110"
              >
                <Star className={`size-5 ${n <= value ? 'fill-current' : 'opacity-40'}`} />
              </span>
            </label>
          ))}
        </div>
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="h-9 rounded-md px-2 text-sm font-semibold text-muted hover:bg-raised hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
    </fieldset>
  );
}

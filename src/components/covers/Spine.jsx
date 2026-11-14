import { formatMeta, isDigitalFormat } from '../../lib/kinds';
import { spineSize } from '../../lib/cover';

/** Which spine an item shows on the shelf. */
function spineFamily(kind, format) {
  if (isDigitalFormat(format)) return 'digital';
  if (kind === 'book') return 'book';
  if (kind === 'board' || format === 'series') return 'box';
  if (kind === 'music') return format === 'cd' ? 'case' : 'record';
  return 'case';
}

/** Book spines carry the author's surname at the foot, as real ones do. */
const surname = (creator) => creator.trim().split(/\s+/).pop() ?? '';

/** Average advance of a condensed Bricolage glyph, in em. */
const GLYPH = 0.5;
/** Smallest readable spine title, in rem (the spine is never shown smaller than its rem size). */
const MIN_TITLE = 0.6;
/** Spines at least this wide (rem) may set a long title on two lines. */
const TWO_LINE_WIDTH = 2.125;

/**
 * Fit the title to the spine's length instead of cutting it: the size steps down with the title
 * length, then wide spines take two lines, and only then does the ellipsis show. Returned as a
 * share of the spine's width (cqw), so the fit holds at any scale.
 */
function titleFit(item, hasFoot) {
  const { width, height } = spineSize(item);
  const room = height * (hasFoot ? 0.5 : 0.66) - width * 0.6;
  const chars = Math.max(item.title.length, 4);
  const one = (room / (chars * GLYPH)) / width;
  // Two lines only when the title then fits whole; a third line would be clipped mid-glyph.
  if (one * width >= MIN_TITLE || width < TWO_LINE_WIDTH || one * 2 * width < MIN_TITLE) {
    return { size: Math.max(Math.min(one, 0.44), MIN_TITLE / width), lines: 1 };
  }
  return { size: Math.max(Math.min(one * 2, 0.4), MIN_TITLE / width), lines: 2 };
}

/**
 * The item seen edge-on: title set bottom-to-top in condensed Bricolage, a cap at the top
 * (bookcloth band, platform banner, box lid edge), and a foot mark. Decorative.
 */
export default function Spine({ item, cover }) {
  const family = spineFamily(item.kind, item.format);
  const Icon = formatMeta(item.kind, item.format).icon;
  const foot = family === 'book' || family === 'record' ? surname(item.creator) : '';
  const fit = titleFit(item, Boolean(foot));

  return (
    <div className={`cv-spine cv-spine--${family} cv-spine--${item.format}`} data-ornament={cover.ornament}>
      <span className="cv-spine__cap" />
      <span
        className="cv-spine__title"
        data-lines={fit.lines}
        style={{ '--spine-fs': `${(fit.size * 100).toFixed(1)}cqw` }}
      >
        {item.title}
      </span>
      {foot ? <span className="cv-spine__foot">{foot}</span> : <Icon className="cv-spine__icon" aria-hidden="true" />}
      <span className="cv-spine__round" />
    </div>
  );
}

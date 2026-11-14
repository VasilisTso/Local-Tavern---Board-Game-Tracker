import { useState } from 'react';

// The printed artwork inside every object frame: an uploaded image, or a generated
// face (ornament, lettered title, creator). Sized with container units, so it scales with the object.

/** Title size (cqw) and width axis from the title's length and its longest word. */
function titleStyle(title) {
  const words = title.split(/\s+/);
  const longest = Math.max(...words.map((w) => w.length), 1);
  const total = title.length;
  const wdth = total <= 12 ? 100 : total <= 24 ? 88 : 78;
  const charWidth = wdth === 100 ? 0.67 : wdth === 88 ? 0.6 : 0.55; // heavy weight runs wide
  const byTotal = total <= 8 ? 18 : total <= 14 ? 15 : total <= 24 ? 12 : total <= 40 ? 10 : 8.5;
  const byWord = 80 / (longest * charWidth);
  return {
    '--cv-title-size': `${Math.min(byTotal, byWord).toFixed(2)}cqw`,
    '--cv-wdth': wdth,
  };
}

/**
 * The generated face always renders, so a slow or broken image never leaves a blank object;
 * an image fades in over it once it has loaded.
 */
export default function Art({ cover, title, creator, image, footer = null, className = '', children }) {
  return (
    <div className={`cv-art ${className}`} data-ornament={cover.ornament}>
      <div className="cv-art__orn" />
      <div className="cv-art__text" style={titleStyle(title)}>
        <span className="cv-art__title">{title}</span>
        {creator && <span className="cv-art__by">{creator}</span>}
        {footer}
      </div>
      <span className="cv-art__mono">{cover.monogram}</span>
      {image?.src && <CoverImg key={image.src} src={image.src} onError={image.onError} />}
      {children}
    </div>
  );
}

function CoverImg({ src, onError }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      draggable="false"
      className="cv-art__img"
      data-loaded={loaded || undefined}
      onLoad={() => setLoaded(true)}
      onError={onError}
    />
  );
}

/** Light from the top left across the whole object. */
export const Sheen = ({ className = '' }) => <div className={`cv-sheen ${className}`} />;

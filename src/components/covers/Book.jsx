import Art, { Sheen } from './Art';

/** Waveform bars for audiobooks, stable per title. */
function bars(seed, count = 28) {
  let s = seed || 1;
  return Array.from({ length: count }, () => {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    return 0.25 + ((s >>> 16) % 1000) / 1333;
  });
}

/** A hardback with a spine crease and page edges; an ebook in a reader; an audiobook with a waveform band. */
export default function Book({ item, cover, image }) {
  if (item.format === 'ebook') {
    return (
      <div className="cv-ebook">
        <div className="cv-ebook__screen">
          <Art cover={cover} title={item.title} creator={item.creator} image={image} />
        </div>
        <div className="cv-ebook__glare" />
      </div>
    );
  }

  if (item.format === 'audio') {
    return (
      <div className="cv-audio">
        <Art cover={cover} title={item.title} creator={item.creator} image={image} className="cv-audio__art" />
        <div className="cv-audio__wave">
          {bars(cover.seed).map((h, i) => (
            <span key={i} style={{ height: `${Math.round(h * 100)}%` }} />
          ))}
        </div>
        <Sheen />
      </div>
    );
  }

  return (
    <div className="cv-book">
      <div className="cv-book__pages" />
      <div className="cv-book__board">
        <Art cover={cover} title={item.title} creator={item.creator} image={image} className="cv-book__art" />
        <div className="cv-book__crease" />
        <Sheen />
      </div>
    </div>
  );
}

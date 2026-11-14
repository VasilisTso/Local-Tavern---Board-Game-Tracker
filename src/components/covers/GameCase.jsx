import { Cloud } from 'lucide-react';
import Art, { Sheen } from './Art';

/** A video game: keep-case with hinge and platform banner, a cartridge with a label recess, or a launcher tile. */
export default function GameCase({ item, cover, image }) {
  const art = <Art cover={cover} title={item.title} creator={item.creator} image={image} />;

  if (item.format === 'cartridge') {
    return (
      <div className="cv-cart">
        <div className="cv-cart__grip" />
        <div className="cv-cart__label">{art}</div>
        <div className="cv-cart__notch" />
        <Sheen />
      </div>
    );
  }

  if (item.format === 'digital') {
    return (
      <div className="cv-tile">
        {art}
        <span className="cv-tile__chip">
          <Cloud aria-hidden="true" />
          {item.platform && <span>{item.platform}</span>}
        </span>
        <Sheen />
      </div>
    );
  }

  return (
    <div className="cv-case cv-case--game">
      <div className="cv-case__hinge" />
      <div className="cv-case__insert">
        <div className="cv-case__banner">{item.platform}</div>
        {art}
      </div>
      <div className="cv-case__sleeve" />
    </div>
  );
}

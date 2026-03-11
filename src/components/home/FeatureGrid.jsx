import FeatureCard from './FeatureCard';
import { iconMap } from '../IconMap';

function FeatureGrid({ featureSections, onFeatureSelect }) {
  if (!featureSections) return null;

  const {
    topFeatureRows = [],
    fullWidthCards = [],
    bottomFeatureRow = [],
    healthCards = [],
  } = featureSections;

  function renderIcon(iconName) {
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={28} strokeWidth={1.9} /> : null;
  }

  function getCardClickHandler(card) {
    if (!card.route || !onFeatureSelect) return undefined;
    return () => onFeatureSelect(card);
  }

  return (
    <section className="feature-grid-section">
      {topFeatureRows.map((row, rowIndex) => (
        <div className="feature-two-col-row" key={`top-row-${rowIndex}`}>
          {row.map((card) => (
            <FeatureCard
              key={card.id}
              {...card}
              renderIcon={renderIcon}
              onClick={getCardClickHandler(card)}
            />
          ))}
        </div>
      ))}

      {fullWidthCards.map((card) => (
        <FeatureCard
          key={card.id}
          {...card}
          full
          renderIcon={renderIcon}
          onClick={getCardClickHandler(card)}
        />
      ))}

      <div className="feature-two-col-row">
        {bottomFeatureRow.map((card) => (
          <FeatureCard
            key={card.id}
            {...card}
            renderIcon={renderIcon}
            onClick={getCardClickHandler(card)}
          />
        ))}
      </div>

      {healthCards[0] && (
        <FeatureCard
          {...healthCards[0]}
          renderIcon={renderIcon}
          onClick={getCardClickHandler(healthCards[0])}
        />
      )}

      <div className="feature-two-col-row">
        {healthCards.slice(1).map((card) => (
          <FeatureCard
            key={card.id}
            {...card}
            renderIcon={renderIcon}
            onClick={getCardClickHandler(card)}
          />
        ))}
      </div>
    </section>
  );
}

export default FeatureGrid;
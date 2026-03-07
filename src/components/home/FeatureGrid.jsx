import FeatureCard from './FeatureCard';

function FeatureGrid({ featureSections }) {
  if (!featureSections) return null;

  const { topFeatureRows = [], fullWidthCards = [], bottomFeatureRow = [], healthCards = [] } =
    featureSections;

  return (
    <section className="feature-grid-section">
      {topFeatureRows.map((row, rowIndex) => (
        <div className="feature-two-col-row" key={`top-row-${rowIndex}`}>
          {row.map((card) => (
            <FeatureCard key={card.id} {...card} />
          ))}
        </div>
      ))}

      {fullWidthCards.map((card) => (
        <FeatureCard key={card.id} {...card} full />
      ))}

      <div className="feature-two-col-row">
        {bottomFeatureRow.map((card) => (
          <FeatureCard key={card.id} {...card} />
        ))}
      </div>

      {healthCards[0] && <FeatureCard {...healthCards[0]} />}

      <div className="feature-two-col-row">
        {healthCards.slice(1).map((card) => (
          <FeatureCard key={card.id} {...card} />
        ))}
      </div>
    </section>
  );
}

export default FeatureGrid;
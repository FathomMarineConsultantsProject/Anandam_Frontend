import { iconMap } from '../IconMap';

function FeatureCard({ title, subtitle, icon, accent, bg, full = false }) {
  const Icon = iconMap[icon];

  return (
    <article
      className={`feature-card ${bg} ${full ? 'feature-card-full' : ''}`}
    >
      <div className={`feature-icon ${accent}`}>
        {Icon ? <Icon size={28} strokeWidth={1.9} /> : null}
      </div>

      <div className="feature-text">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </article>
  );
}

export default FeatureCard;
function FeatureCard({
  title,
  subtitle,
  accent,
  bg,
  full = false,
  icon,
  renderIcon,
  onClick,
}) {
  const isClickable = typeof onClick === 'function';

  const cardClassName = `feature-card ${bg} ${
    full ? 'feature-card-full' : ''
  } ${isClickable ? 'feature-card-clickable' : 'feature-card-static'}`;

  const content = (
    <>
      <div className={`feature-icon ${accent}`}>
        {renderIcon ? renderIcon(icon) : null}
      </div>

      <div className="feature-text">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </>
  );

  if (isClickable) {
    return (
      <button type="button" className={cardClassName} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}

export default FeatureCard;
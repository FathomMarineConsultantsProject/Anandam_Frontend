function MoodScale({ items, selectedMood, onSelect }) {
  return (
    <div className="mood-scale-grid">
      {items.map((item) => {
        const isActive = selectedMood === item.value;

        return (
          <button
            key={item.value}
            type="button"
            className={`mood-option-card ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(item.value)}
          >
            <div className="mood-option-emoji">{item.emoji}</div>
            <div className="mood-option-value">{item.value}</div>
          </button>
        );
      })}
    </div>
  );
}

export default MoodScale;
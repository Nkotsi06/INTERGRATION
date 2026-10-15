function StepIndicator({ current, total, labels = [], title }) {
  const label = labels[current - 1];
  return (
    <div className="step-indicator" role="group" aria-label="Form progress">
      <div className="step-indicator-text">
        Step {current} of {total}{label ? `: ${label}` : ''}
        {title ? ` — ${title}` : ''}
      </div>
      <ol className="step-indicator-list">
        {Array.from({ length: total }, (_, i) => {
          const stepNumber = i + 1;
          const status =
            stepNumber < current
              ? 'completed'
              : stepNumber === current
              ? 'active'
              : 'upcoming';
          return (
            <li key={i} className={`step-indicator-item is-${status}`}>
              <span className="step-indicator-number">{stepNumber}</span>
              <span className="step-indicator-label">
                {labels[i] || `Step ${stepNumber}`}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default StepIndicator;
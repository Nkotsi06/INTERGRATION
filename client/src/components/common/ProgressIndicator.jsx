function ProgressIndicator({ currentStep, totalSteps, labels = [] }) {
  return (
    <div className="progress-indicator">
      <div className="progress-steps">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`progress-step ${
              i + 1 < currentStep ? 'completed' : i + 1 === currentStep ? 'active' : ''
            }`}
          >
            <div className="progress-step-number">{i + 1}</div>
            {labels[i] && <span className="progress-step-label">{labels[i]}</span>}
          </div>
        ))}
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressIndicator;
function SkeletonLoader({ type = 'text', count = 1 }) {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton skeleton-${type}`} />
      ))}
    </div>
  );
}

export default SkeletonLoader;
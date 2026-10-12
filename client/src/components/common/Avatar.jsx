import { useEffect, useState } from 'react';

/**
 * Shows a profile photo if the URL loads, otherwise shows initials.
 * Never renders a broken-image icon.
 */
function Avatar({ src, name = '', size = 96, alt = 'Profile photo' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const initials = computeInitials(name);

  const style = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.36),
  };

  if (!src || failed) {
    return (
      <div className="avatar avatar-fallback" style={style} aria-label={alt}>
        {initials}
      </div>
    );
  }

  return (
    <div className="avatar" style={{ width: size, height: size }}>
      <img
        src={src}
        alt={alt}
        className="avatar-image"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function computeInitials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

export default Avatar;
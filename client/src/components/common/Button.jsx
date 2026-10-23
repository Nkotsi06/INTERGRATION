import { useEffect, useState } from 'react';
import { getButtonIcon } from '../../utils/actionIcons';

function Button({
  children,
  icon,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  accentColour,
  ...props
}) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return undefined;
    }
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  const isDisabled = disabled || loading;
  const Icon = icon === false ? null : icon || getButtonIcon(children);
  const style = accentColour && variant === 'primary'
    ? { backgroundColor: accentColour }
    : {};

  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''}`}
      onClick={onClick}
      disabled={isDisabled}
      style={style}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="btn-loading-wrap">
          <span className="btn-spinner" aria-hidden="true" />
          <span className="btn-loading-label">
            {slow ? 'The server is waking up. Please wait a moment.' : children}
          </span>
        </span>
      ) : (
        <>
          {Icon && <Icon className="ui-icon" aria-hidden="true" focusable="false" />}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
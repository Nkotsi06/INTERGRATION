function Button({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  accentColour,
  ...props
}) {
  const style = accentColour && variant === 'primary' ? { backgroundColor: accentColour } : {};

  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
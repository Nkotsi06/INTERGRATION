function Card({ children, variant = 'flat', className = '', accentColour, onClick }) {
  return (
    <div
      className={`card card-${variant} ${className} ${onClick ? 'card-clickable' : ''}`}
      style={accentColour ? { borderTopColor: accentColour } : {}}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Card;
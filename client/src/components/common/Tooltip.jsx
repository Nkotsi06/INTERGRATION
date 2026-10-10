import { useState } from 'react';

function Tooltip({ children, text, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <span className={`tooltip tooltip-${position}`}>{text}</span>}
    </span>
  );
}

export default Tooltip;
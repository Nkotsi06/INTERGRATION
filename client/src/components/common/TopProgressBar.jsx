import { useEffect, useState } from 'react';
import { useProgress } from '../../context/ProgressContext';

function TopProgressBar() {
  const { isActive } = useProgress();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      setWidth(15);
      const t1 = setTimeout(() => setWidth(45), 150);
      const t2 = setTimeout(() => setWidth(75), 700);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    setWidth(100);
    const t = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300);
    return () => clearTimeout(t);
  }, [isActive]);

  if (!visible) return null;

  return (
    <div
      className="top-progress-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={width}
      aria-label="Loading"
    >
      <div className="top-progress-bar-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

export default TopProgressBar;
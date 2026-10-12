import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

function Logo({ colour }) {
  const { settings } = useSettings();
  const [failed, setFailed] = useState(false);

  // If a new logo is uploaded, give the new URL a fresh chance.
  useEffect(() => {
    setFailed(false);
  }, [settings.systemLogoPath]);

  const logoSrc = settings.systemLogoPath;

  if (!logoSrc || failed) {
    return (
      <div
        className="header-logo-placeholder"
        style={colour ? { backgroundColor: colour } : undefined}
        aria-label="Lesotho Government System"
        role="img"
      >
        LS
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="Lesotho Government System logo"
      className="header-logo-img"
      onError={() => setFailed(true)}
    />
  );
}

export default Logo;
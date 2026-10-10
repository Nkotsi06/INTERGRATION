import { useSettings } from '../../context/SettingsContext';

function Logo({ colour }) {
  const { settings } = useSettings();

  const logoSrc = settings.systemLogoPath || '/logo.jpeg';

  return (
    <img
      src={logoSrc}
      alt="Lesotho Government System logo"
      className="header-logo-img"
      onError={(event) => {
        // If the image fails to load, hide it and show the placeholder
        event.target.style.display = 'none';
        if (event.target.nextSibling) {
          event.target.nextSibling.style.display = 'flex';
        }
      }}
    />
  );
}

export default Logo;
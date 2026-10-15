import logo from '../../public/Logo.jpeg';

function Logo({ size = 40, showName = false, name }) {
  return (
    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img
        src={logo}
        alt="Integrated Government Services System — Lesotho"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
      {showName && name && <span className="logo-name">{name}</span>}
    </div>
  );
}

export default Logo;
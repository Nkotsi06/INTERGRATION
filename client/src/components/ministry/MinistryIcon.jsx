import {
  FiHome, FiTruck, FiShield, FiDollarSign, FiUsers, FiGlobe,
} from 'react-icons/fi';

const ICONS = {
  HOME_AFFAIRS: <FiHome />,
  TRAFFIC: <FiTruck />,
  POLICE: <FiShield />,
  FINANCE: <FiDollarSign />,
  PENSIONS: <FiUsers />,
  PASSPORT: <FiGlobe />,
};

function MinistryIcon({ code, size = 24 }) {
  return (
    <span className="ministry-icon" style={{ fontSize: size }}>
      {ICONS[code] || <FiHome />}
    </span>
  );
}

export default MinistryIcon;
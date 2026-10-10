import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs">
      {items.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {item.path ? (
            <Link to={item.path}>{item.label}</Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
          {index < items.length - 1 && <FiChevronRight className="breadcrumb-sep" />}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
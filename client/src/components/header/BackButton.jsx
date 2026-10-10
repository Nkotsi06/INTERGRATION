import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function BackButton({ to }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      className="header-back-btn"
      onClick={handleClick}
      aria-label="Go back"
    >
      <FiArrowLeft />
    </button>
  );
}

export default BackButton;
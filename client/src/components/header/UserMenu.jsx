import { useAuth } from '../../context/AuthContext';

function UserMenu() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <span className="header-user">
      {user.fullName || user.username}
    </span>
  );
}

export default UserMenu;
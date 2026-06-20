import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-3">
      <span className="text-slate-600 text-sm">
        Welcome, <strong>{user?.username}</strong> ({user?.role})
      </span>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-1.5 rounded-md text-sm hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;

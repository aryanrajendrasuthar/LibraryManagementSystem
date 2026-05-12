import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, LayoutDashboard, BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isLibrarian, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-[#1B4332] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold hover:text-[#52B788] transition-colors">
          <BookOpen size={24} />
          LibraryMS
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/catalog" className="flex items-center gap-1 hover:text-[#52B788] transition-colors text-sm">
            <BookMarked size={16} /> Catalog
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1 hover:text-[#52B788] transition-colors text-sm">
                <User size={16} /> My Dashboard
              </Link>
              {isLibrarian && (
                <Link to="/admin" className="flex items-center gap-1 hover:text-[#52B788] transition-colors text-sm">
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <span className="text-[#52B788] text-sm font-medium">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-[#52B788] transition-colors text-sm">Login</Link>
              <Link to="/register" className="bg-[#52B788] hover:bg-[#2D6A4F] px-3 py-1.5 rounded text-sm font-medium transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

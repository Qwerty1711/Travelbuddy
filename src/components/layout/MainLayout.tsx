import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plane, Map, User, LogOut } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  async function handleSignOut() {
    await signOut();
    navigate('/auth/login');
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200">
          <Link to="/trips" className="flex items-center group">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg mr-3 group-hover:shadow-glow-md transition-shadow">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                TravelBuddy
              </span>
              <span className="text-xs text-neutral-500 font-medium">Adventures Await</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/trips"
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive('/trips')
                ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Map className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>My Trips</span>
            {isActive('/trips') && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary-600"></div>
            )}
          </Link>

          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive('/profile')
                ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <User className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>Profile</span>
            {isActive('/profile') && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary-600"></div>
            )}
          </Link>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium group"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-subtle">
        {children}
      </main>
    </div>
  );
}

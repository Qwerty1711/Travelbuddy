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
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/trips" className="flex items-center">
            <Plane className="w-8 h-8 text-blue-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">Travel Buddy</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/trips"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/trips')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Map className="w-5 h-5 mr-3" />
            <span className="font-medium">My Trips</span>
          </Link>

          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            <span className="font-medium">Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
